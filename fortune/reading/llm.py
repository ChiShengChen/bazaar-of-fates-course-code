"""LLM 閘道 — 只做一件事：把「盤面事實＋知識卡」變成文字。

後端由 fortune/reading/providers.py 決定：
- mock：不需金鑰，回傳由程式組出的確定性解讀（離線模式，整條流程照樣能跑、能查核）
- anthropic：官方 SDK（有 prompt cache）
- openai / deepseek / gemini / openai_compatible：OpenAI 相容的 /chat/completions
任何失敗都退回 mock，不讓整個服務掛掉。
"""

from __future__ import annotations

from collections.abc import Callable, Iterator
from dataclasses import dataclass

from fortune.config import get_settings
from fortune.reading import providers


@dataclass
class LLMResult:
    text: str
    backend: str
    model: str = ""
    input_tokens: int = 0
    output_tokens: int = 0
    cache_read_tokens: int = 0
    truncated: bool = False          # 達 max_tokens 被截斷（已重試一次仍截斷才會是 True）
    retried: bool = False
    byok: bool = False               # 使用者自帶金鑰

    @property
    def cost_usd(self) -> float:
        if self.backend == "mock":
            return 0.0
        pin, pout = providers.MODEL_PRICES.get(self.model, providers.resolve().price())
        return round((self.input_tokens - self.cache_read_tokens) * pin / 1e6 + self.cache_read_tokens * pin * 0.1 / 1e6
                     + self.output_tokens * pout / 1e6, 5)


def _anthropic_client(p=None):
    import anthropic
    return anthropic.Anthropic(api_key=(p or providers.resolve()).api_key)


def _anthropic_extra() -> dict:
    """LLM_THINKING → output_config.effort（Claude 5 系列不能關思考，用 effort 控制深度）。"""
    mode = providers.thinking_mode()
    return {} if mode == "default" else {"output_config": {"effort": "low" if mode == "off" else mode}}


def complete(system: str, user: str, *, fallback: Callable[[], str], max_tokens: int | None = None, _retry: bool = False,
             provider=None) -> LLMResult:
    """一次拿完整回覆。system 固定不變的部分放前面並加快取，省錢（9-1）。provider 可明確指定（串流路徑用）。"""
    s = get_settings()
    p = provider or providers.resolve()
    max_tokens = max_tokens or s.reading_max_tokens
    if not p.ready:
        return LLMResult(text=fallback(), backend="mock")
    try:
        if p.kind == "anthropic":
            with _anthropic_client(p).messages.stream(
                model=p.model, max_tokens=max_tokens,
                system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
                messages=[{"role": "user", "content": user}], **_anthropic_extra(),
            ) as st:
                msg = st.get_final_message()
            providers.note_served(getattr(msg, "model", None), backend=p.backend)
            if msg.stop_reason == "refusal":
                return LLMResult(text=fallback(), backend="mock")
            if msg.stop_reason == "max_tokens" and not _retry:
                print(f"[llm:{p.backend}] 輸出被截斷（max_tokens={max_tokens}），加倍重試")
                res = complete(system, user, fallback=fallback, max_tokens=max_tokens * 2, _retry=True, provider=p)
                res.retried = True
                return res
            u = msg.usage
            return LLMResult(text="".join(b.text for b in msg.content if b.type == "text").strip(), backend=p.backend, model=p.model,
                             input_tokens=u.input_tokens, output_tokens=u.output_tokens,
                             cache_read_tokens=getattr(u, "cache_read_input_tokens", 0) or 0,
                             truncated=msg.stop_reason == "max_tokens", byok=p.byok)
        r = providers.OpenAICompatible(p).complete(system, [{"role": "user", "content": user}], max_tokens=max_tokens)
        if r.finish_reason == "length" and not _retry:
            print(f"[llm:{p.backend}] 輸出被截斷（max_tokens={max_tokens}，思考型模型的推理 token 也算在內），加倍重試")
            res = complete(system, user, fallback=fallback, max_tokens=max_tokens * 2, _retry=True, provider=p)
            res.retried = True
            return res
        if not r.text:
            raise RuntimeError("模型沒有回傳文字")
        return LLMResult(text=r.text, backend=p.backend, model=p.model, input_tokens=r.input_tokens,
                         output_tokens=r.output_tokens, cache_read_tokens=r.cache_read_tokens, truncated=r.finish_reason == "length", byok=p.byok)
    except Exception as e:  # noqa: BLE001 — 任何失敗都退回離線模式
        print(f"[llm:{p.backend}] 退回離線模式：{e}")
        return LLMResult(text=fallback(), backend="mock")


def stream(system: str, user: str, *, fallback: Callable[[], str], max_tokens: int | None = None, provider=None) -> Iterator[str | LLMResult]:
    """逐字產生；最後一個 yield 是 LLMResult（含用量）。離線模式把 fallback 文字切片吐出。"""
    s = get_settings()
    p = provider or providers.resolve()
    max_tokens = max_tokens or s.reading_max_tokens
    if p.ready:
        try:
            if p.kind == "anthropic":
                with _anthropic_client(p).messages.stream(
                    model=p.model, max_tokens=max_tokens,
                    system=[{"type": "text", "text": system, "cache_control": {"type": "ephemeral"}}],
                    messages=[{"role": "user", "content": user}], **_anthropic_extra(),
                ) as st:
                    for piece in st.text_stream:
                        yield piece
                    msg = st.get_final_message()
                providers.note_served(getattr(msg, "model", None), backend=p.backend)
                if msg.stop_reason == "max_tokens":
                    print(f"[llm:{p.backend}] 串流輸出被截斷，改以非串流加倍重試")
                    res = complete(system, user, fallback=fallback, max_tokens=max_tokens * 2, _retry=True, provider=p)
                    res.retried = True
                    yield res
                    return
                if msg.stop_reason != "refusal":
                    u = msg.usage
                    yield LLMResult(text="".join(b.text for b in msg.content if b.type == "text").strip(), backend=p.backend, model=p.model,
                                    input_tokens=u.input_tokens, output_tokens=u.output_tokens,
                                    cache_read_tokens=getattr(u, "cache_read_input_tokens", 0) or 0, byok=p.byok)
                    return
            else:
                final = None
                for item in providers.OpenAICompatible(p).stream(system, [{"role": "user", "content": user}], max_tokens=max_tokens):
                    if isinstance(item, providers.ChatResult):
                        final = item
                    else:
                        yield item
                if final and final.finish_reason == "length":
                    print(f"[llm:{p.backend}] 串流輸出被截斷（max_tokens={max_tokens}），改以非串流加倍重試")
                    res = complete(system, user, fallback=fallback, max_tokens=max_tokens * 2, _retry=True, provider=p)
                    res.retried = True
                    yield res
                    return
                if final and final.text:
                    yield LLMResult(text=final.text, backend=p.backend, model=p.model, input_tokens=final.input_tokens,
                                    output_tokens=final.output_tokens, cache_read_tokens=final.cache_read_tokens, byok=p.byok)
                    return
                raise RuntimeError("模型沒有回傳文字")
        except Exception as e:  # noqa: BLE001
            print(f"[llm:{p.backend}] 串流失敗，退回離線模式：{e}")
    text = fallback()
    for i in range(0, len(text), 24):
        yield text[i:i + 24]
    yield LLMResult(text=text, backend="mock")
