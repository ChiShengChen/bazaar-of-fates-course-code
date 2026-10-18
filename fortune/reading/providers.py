"""多家 LLM 供應商（9-1 挑對模型、3-2 金鑰）。

- claude（anthropic）：官方 SDK，走 fortune/reading/llm.py 與 chat/session.py 的原生路徑
- openai / deepseek / gemini / openai_compatible：都講 OpenAI 相容的 /chat/completions，
  共用這裡的 OpenAICompatible 用 httpx 直接打，不多裝套件。openai_compatible 給 Ollama、LM Studio、
  Groq、Mistral 這類自訂 base_url 的服務。

設定（.env）：
  LLM_BACKEND=deepseek          # mock | anthropic | openai | deepseek | gemini | openai_compatible
  LLM_API_KEY=sk-...            # 通用金鑰（anthropic 也可改用 ANTHROPIC_API_KEY）
  LLM_MODEL=deepseek-chat       # 留空用預設
  LLM_BASE_URL=                 # 只有 openai_compatible 需要
"""

from __future__ import annotations

import json
from collections.abc import Callable, Iterator
from dataclasses import dataclass
from typing import Any

import httpx

# 各家預設：base_url、預設模型、粗估單價（美元／百萬 token：輸入, 輸出），單價只用來做量級試算
PRESETS: dict[str, dict[str, Any]] = {
    "anthropic": {"base_url": None, "model": "claude-opus-5-5", "price": (4.0, 20.0), "label": "Claude（Anthropic）"},
    "openai": {"base_url": "https://api.openai.com/v1", "model": "gpt-4o-mini", "price": (0.15, 0.60), "label": "OpenAI"},
    "deepseek": {"base_url": "https://api.deepseek.com/v1", "model": "deepseek-flash", "price": (0.27, 1.10), "label": "DeepSeek"},   # deepseek-chat 仍可用（別名）
    "gemini": {"base_url": "https://generativelanguage.googleapis.com/v1beta/openai", "model": "gemini-2.5-flash",
               "price": (0.30, 2.50), "label": "Gemini（Google）"},
    "openai_compatible": {"base_url": "http://localhost:11434/v1", "model": "qwen2.5:7b", "price": (0.0, 0.0),
                          "label": "OpenAI 相容端點（Ollama／LM Studio／Groq…）"},
}
MODEL_PRICES: dict[str, tuple[float, float]] = {
    "claude-opus-5-5": (4.0, 20.0), "claude-sonnet-5-5": (2.0, 10.0), "claude-haiku-5-5": (0.10, 0.50),
    "gpt-4o-mini": (0.15, 0.60), "gpt-4o": (2.50, 10.0), "gpt-4.1-mini": (0.40, 1.60),
    "deepseek-chat": (0.27, 1.10), "deepseek-reasoner": (0.55, 2.19), "deepseek-flash": (0.27, 1.10), "deepseek-v4-pro": (0.55, 2.19),   # DeepSeek V4 單價請對官方頁
    "gemini-2.5-flash": (0.30, 2.50), "gemini-2.5-pro": (1.25, 10.0),
}


from contextvars import ContextVar

# 每請求的 LLM 覆寫（使用者自帶金鑰、自選模型）；只活在這個請求的 context，不落地、不進日誌
REQUEST_LLM: ContextVar[dict[str, Any] | None] = ContextVar("REQUEST_LLM", default=None)


@dataclass
class Provider:
    kind: str                 # mock | anthropic | openai（相容路徑統一叫 openai）
    backend: str              # 使用者設的名字：anthropic / openai / deepseek / gemini / openai_compatible / mock
    api_key: str
    model: str
    base_url: str | None
    label: str
    byok: bool = False        # 是否為使用者自帶金鑰（費用不算站台預算、不計入站台成本紀錄的預算）
    thinking: str | None = None   # 每請求的思考深度覆寫

    @property
    def ready(self) -> bool:
        if self.kind == "mock":
            return False
        if self.backend == "openai_compatible":        # 本機模型通常不需要金鑰
            return True
        return bool(self.api_key)

    def price(self) -> tuple[float, float]:
        return MODEL_PRICES.get(self.model, PRESETS.get(self.backend, {}).get("price", (0.0, 0.0)))


def from_override(o: dict[str, Any]) -> Provider:
    """使用者自帶的設定 → Provider。backend 必填；model、base_url 留空用該家預設。"""
    b = str(o.get("backend") or "").strip().lower()
    if b not in PRESETS:
        raise ValueError(f"不支援的後端：{b or '(空)'}；可用：{', '.join(PRESETS)}")
    p = PRESETS[b]
    key = str(o.get("api_key") or "").strip()
    model = str(o.get("model") or "").strip() or p["model"]
    base = (str(o.get("base_url") or "").strip() or p["base_url"] or "")
    thinking = str(o.get("thinking") or "").strip().lower() or None
    if thinking and thinking not in ("default", "off", "low", "high"):
        raise ValueError("thinking 須為 default / off / low / high")
    kind = "anthropic" if b == "anthropic" else "openai"
    return Provider(kind, b, key, model, None if kind == "anthropic" else base.rstrip("/"), p["label"], byok=True, thinking=thinking)


def resolve() -> Provider:
    """目前請求帶了自帶金鑰就用它；否則用站台設定（.env）。"""
    o = REQUEST_LLM.get()
    if o:
        return from_override(o)
    from fortune.config import get_settings
    s = get_settings()
    b = (s.llm_backend or "mock").strip().lower()
    if b not in PRESETS:
        return Provider("mock", "mock", "", "", None, "離線模式")
    p = PRESETS[b]
    if b == "anthropic":
        return Provider("anthropic", b, s.llm_api_key or s.anthropic_api_key, s.llm_model or s.anthropic_model, None, p["label"])
    return Provider("openai", b, s.llm_api_key, s.llm_model or p["model"], (s.llm_base_url or p["base_url"]).rstrip("/"), p["label"])


def thinking_mode(p: Provider | None = None) -> str:
    """思考深度：每請求覆寫 → .env。"""
    p = p or resolve()
    if p.thinking:
        return p.thinking
    from fortune.config import get_settings
    return (get_settings().llm_thinking or "default").lower()


# ---------------------------------------------------------------- OpenAI 相容客戶端
@dataclass
class ChatResult:
    text: str
    tool_calls: list[dict[str, Any]]          # [{id, name, arguments(dict)}]
    raw_message: dict[str, Any]               # 原樣的 assistant message，回傳對話歷史用
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_tokens: int = 0
    finish_reason: str = ""


# 測試可以換掉這個，塞 httpx.MockTransport
_transport_factory: Callable[[], httpx.BaseTransport | None] = lambda: None  # noqa: E731

# 最近一次真實回覆裡供應商回報的模型（設定的 id 可能是別名，例如 deepseek-chat → deepseek-flash）
LAST_SERVED: dict[str, Any] = {}


def note_served(model: str | None, fingerprint: str | None = None, backend: str = "") -> None:
    if model:
        LAST_SERVED.update({"model": model, "fingerprint": fingerprint or "", "backend": backend})


class OpenAICompatible:
    def __init__(self, p: Provider, timeout: float = 120.0):
        self.p = p
        headers = {"Content-Type": "application/json"}
        if p.api_key:
            headers["Authorization"] = f"Bearer {p.api_key}"
        self.client = httpx.Client(base_url=p.base_url or "", headers=headers, timeout=timeout, transport=_transport_factory())

    @staticmethod
    def tools_to_openai(tools: list[dict[str, Any]]) -> list[dict[str, Any]]:
        """Anthropic 風格 {name, description, input_schema} → OpenAI function tools。"""
        return [{"type": "function", "function": {"name": t["name"], "description": t.get("description", ""),
                                                  "parameters": t["input_schema"]}} for t in tools]

    def _thinking_params(self) -> dict[str, Any]:
        """把 LLM_THINKING 翻成各家聽得懂的參數；不確定的一律不送，免得 400。"""
        mode = thinking_mode(self.p)
        b = self.p.backend
        if mode == "default":
            return {}
        if b == "deepseek":
            return {"thinking": {"type": "disabled"}} if mode == "off" else {"reasoning_effort": mode}
        if b in ("openai", "gemini"):
            m = self.p.model
            reasoning_model = b == "gemini" or m.startswith(("o", "gpt-5"))
            if not reasoning_model:
                return {}
            return {"reasoning_effort": "none" if (mode == "off" and b == "gemini") else ("low" if mode == "off" else mode)}
        return {}

    def _body(self, system: str, messages: list[dict[str, Any]], *, max_tokens: int, tools=None, stream=False) -> dict[str, Any]:
        body: dict[str, Any] = {"model": self.p.model, "max_tokens": max_tokens,
                                "messages": [{"role": "system", "content": system}, *messages], **self._thinking_params()}
        if tools:
            body["tools"] = self.tools_to_openai(tools)
            body["tool_choice"] = "auto"
        if stream:
            body["stream"] = True
            body["stream_options"] = {"include_usage": True}
        return body

    @staticmethod
    def _usage(u: dict[str, Any] | None) -> tuple[int, int, int]:
        u = u or {}
        cached = ((u.get("prompt_tokens_details") or {}).get("cached_tokens")
                  or u.get("prompt_cache_hit_tokens") or 0)           # OpenAI / DeepSeek 兩種欄位
        return int(u.get("prompt_tokens") or 0), int(u.get("completion_tokens") or 0), int(cached)

    def complete(self, system: str, messages: list[dict[str, Any]], *, max_tokens: int = 2500, tools=None) -> ChatResult:
        r = self.client.post("/chat/completions", json=self._body(system, messages, max_tokens=max_tokens, tools=tools))
        r.raise_for_status()
        data = r.json()
        choice = data["choices"][0]
        msg = choice["message"]
        calls = []
        for tc in msg.get("tool_calls") or []:
            fn = tc.get("function") or {}
            try:
                args = json.loads(fn.get("arguments") or "{}")
            except json.JSONDecodeError:
                args = {}
            calls.append({"id": tc.get("id", ""), "name": fn.get("name", ""), "arguments": args})
        pi, po, pc = self._usage(data.get("usage"))
        note_served(data.get("model"), data.get("system_fingerprint"), self.p.backend)
        return ChatResult(text=(msg.get("content") or "").strip(), tool_calls=calls, raw_message=msg,
                          input_tokens=pi, output_tokens=po, cache_read_tokens=pc, finish_reason=choice.get("finish_reason", ""))

    def stream(self, system: str, messages: list[dict[str, Any]], *, max_tokens: int = 2500) -> Iterator[str | ChatResult]:
        """逐字 yield 文字，最後 yield ChatResult（含完整文字與用量）。"""
        parts: list[str] = []
        usage = None
        finish = ""
        with self.client.stream("POST", "/chat/completions", json=self._body(system, messages, max_tokens=max_tokens, stream=True)) as r:
            r.raise_for_status()
            for line in r.iter_lines():
                if not line.startswith("data:"):
                    continue
                payload = line[5:].strip()
                if payload == "[DONE]":
                    break
                try:
                    chunk = json.loads(payload)
                except json.JSONDecodeError:
                    continue
                if chunk.get("usage"):
                    usage = chunk["usage"]
                if chunk.get("model"):
                    note_served(chunk["model"], chunk.get("system_fingerprint"), self.p.backend)
                for ch in chunk.get("choices") or []:
                    delta = (ch.get("delta") or {}).get("content")
                    if delta:
                        parts.append(delta)
                        yield delta
                    if ch.get("finish_reason"):
                        finish = ch["finish_reason"]
        pi, po, pc = self._usage(usage)
        text = "".join(parts).strip()
        yield ChatResult(text=text, tool_calls=[], raw_message={"role": "assistant", "content": text},
                         input_tokens=pi, output_tokens=po, cache_read_tokens=pc, finish_reason=finish)


# ---------------------------------------------------------------- 模型資訊（給 /api/health 與頁首狀態列）
_describe_cache: dict[str, Any] = {}


def probe(p: Provider | None = None) -> None:
    """還沒呼叫過模型時，用一個 1 token 的請求問出「實際服務的模型」（別名 → 真實 id）。"""
    p = p or resolve()
    if not p.ready or LAST_SERVED.get("backend") == p.backend:
        return
    try:
        if p.kind == "anthropic":
            import anthropic
            m = anthropic.Anthropic(api_key=p.api_key).messages.create(model=p.model, max_tokens=1, messages=[{"role": "user", "content": "hi"}])
            note_served(getattr(m, "model", None), backend=p.backend)
        else:
            OpenAICompatible(p, timeout=20).complete("", [{"role": "user", "content": "hi"}], max_tokens=1)
    except Exception as e:  # noqa: BLE001
        LAST_SERVED.update({"backend": p.backend, "model": None, "error": str(e)})


def describe(p: Provider | None = None, ttl_sec: int = 600, do_probe: bool = True) -> dict[str, Any]:
    """{configured, served, name, context_window, max_output_tokens, available[], fingerprint, note}
    openai 相容：GET /models（DeepSeek、OpenAI、Gemini、Ollama 都有）；anthropic：client.models.retrieve。"""
    import time
    p = p or resolve()
    if not p.ready:
        return {"configured": None, "served": None, "name": "離線模式", "available": []}
    if do_probe:
        probe(p)
    key = f"{p.backend}:{p.base_url}:{p.model}"
    hit = _describe_cache.get(key)
    if hit and time.time() - hit["_at"] < ttl_sec:
        info = dict(hit)
    else:
        info = {"configured": p.model, "name": "", "context_window": None, "max_output_tokens": None, "available": [], "note": ""}
        try:
            if p.kind == "anthropic":
                import anthropic
                client = anthropic.Anthropic(api_key=p.api_key)
                m = client.models.retrieve(p.model)
                info.update({"name": getattr(m, "display_name", "") or p.model,
                             "context_window": getattr(m, "max_input_tokens", None),
                             "max_output_tokens": getattr(m, "max_tokens", None),
                             "created": str(getattr(m, "created_at", "") or "")[:10]})
                info["available"] = [{"id": x.id, "name": getattr(x, "display_name", x.id)} for x in client.models.list()][:30]
            else:
                headers = {"Authorization": f"Bearer {p.api_key}"} if p.api_key else {}
                with httpx.Client(base_url=p.base_url or "", headers=headers, timeout=15, transport=_transport_factory()) as c:
                    data = c.get("/models").json().get("data") or []
                for m in data:                                   # Gemini 的 id 是 "models/gemini-2.5-flash"，去掉前綴
                    if isinstance(m.get("id"), str) and m["id"].startswith("models/"):
                        m["id"] = m["id"][len("models/"):]
                info["available"] = [{"id": m.get("id"), "name": m.get("name") or m.get("display_name") or m.get("id"),
                                      "context_window": m.get("context_window"), "owned_by": m.get("owned_by")} for m in data][:40]
                mine = next((m for m in data if m.get("id") == p.model), None)
                if mine:
                    info.update({"name": mine.get("name") or mine.get("display_name") or p.model,
                                 "context_window": mine.get("context_window"), "max_output_tokens": mine.get("max_output_tokens")})
                elif data:
                    info["note"] = f"{p.model} 不在 /models 清單裡（可能是別名；以實際回覆的 model 欄位為準）"
        except Exception as e:  # noqa: BLE001
            info["note"] = f"查詢模型資訊失敗：{e}"
        info["_at"] = time.time()
        _describe_cache[key] = dict(info)
    info.pop("_at", None)
    # 實際服務的模型（來自最近一次回覆），並從清單補上它的正式名稱
    served = LAST_SERVED.get("model") if LAST_SERVED.get("backend") == p.backend else None
    info["served"] = served
    info["fingerprint"] = LAST_SERVED.get("fingerprint", "") if served else ""
    if LAST_SERVED.get("backend") == p.backend and LAST_SERVED.get("error"):
        info["error"] = LAST_SERVED["error"]
    if served and served != p.model:
        m = next((x for x in info["available"] if x["id"] == served), None)
        if m:
            info["served_name"] = m.get("name")
            info["context_window"] = m.get("context_window") or info.get("context_window")
        info["note"] = (info.get("note") or "") + f" 設定的 {p.model} 實際由 {served} 服務。"
    elif served:
        info["served_name"] = info.get("name")
    return info


def list_models(o: dict[str, Any]) -> dict[str, Any]:
    """自帶金鑰：驗證金鑰、列出可用模型、探一次實際服務的模型。不快取、不記錄金鑰。"""
    p = from_override(o)
    out: dict[str, Any] = {"ok": False, "backend": p.backend, "label": p.label, "model": p.model, "models": [], "served": None, "error": ""}
    if not p.ready:
        out["error"] = "缺少金鑰"
        return out
    try:
        if p.kind == "anthropic":
            import anthropic
            client = anthropic.Anthropic(api_key=p.api_key)
            out["models"] = [{"id": x.id, "name": getattr(x, "display_name", x.id)} for x in client.models.list()][:40]
            m = client.messages.create(model=p.model, max_tokens=1, messages=[{"role": "user", "content": "hi"}])
            out["served"] = getattr(m, "model", None)
        else:
            headers = {"Authorization": f"Bearer {p.api_key}"} if p.api_key else {}
            with httpx.Client(base_url=p.base_url or "", headers=headers, timeout=20, transport=_transport_factory()) as c:
                data = c.get("/models").json().get("data") or []
            for m in data:
                if isinstance(m.get("id"), str) and m["id"].startswith("models/"):
                    m["id"] = m["id"][len("models/"):]
            out["models"] = [{"id": m.get("id"), "name": m.get("name") or m.get("display_name") or m.get("id"),
                              "context_window": m.get("context_window")} for m in data][:60]
            r = OpenAICompatible(p, timeout=20).complete("", [{"role": "user", "content": "hi"}], max_tokens=1)
            out["served"] = LAST_SERVED.get("model") if LAST_SERVED.get("backend") == p.backend else None
        out["ok"] = True
    except Exception as e:  # noqa: BLE001
        msg = str(e)
        out["error"] = msg.replace(p.api_key, "***") if p.api_key else msg
    return out
