"""多家供應商：OpenAI 相容路徑（DeepSeek / Gemini / OpenAI / 本機模型）用假伺服器驗格式；
Anthropic 走 SDK 不在這裡打真 API，只驗 resolve() 的設定解析。"""

import json

import httpx
import pytest

from fortune.config import get_settings
from fortune.reading import providers

MEI = {"name": "小美", "birth_date": "1990-06-15", "birth_time": "14:30", "gender": "female", "longitude": 121.5}

READING_TEXT = """## 總論
方向：平
日主辛金，身弱，喜用土金。
依據：bazi.day_master, bazi.strength
知識卡：wangshuai.shenruo
## 性格
方向：平
七殺偏印為主。
依據：bazi.gods.present
知識卡：shishen.qisha
## 事業
方向：吉
有七殺有偏印。
依據：bazi.gods.present
知識卡：無
## 感情
方向：吉
女命看官星，命有七殺。
依據：bazi.gods.present
知識卡：無
## 財運
方向：吉
有正財偏財。
依據：bazi.gods.present
知識卡：無
## 流年
方向：凶
2026 丙午非喜用。
依據：bazi.liunian.2026
知識卡：無
"""


def _sse(chunks: list[str], usage: dict) -> bytes:
    lines = []
    for c in chunks:
        lines.append("data: " + json.dumps({"choices": [{"delta": {"content": c}, "finish_reason": None}]}))
    lines.append("data: " + json.dumps({"choices": [{"delta": {}, "finish_reason": "stop"}], "usage": usage}))
    lines.append("data: [DONE]")
    return ("\n".join(lines) + "\n").encode()


class FakeServer:
    """記錄每個請求，依是否 stream／是否帶 tools 回假資料。truncate_first=True 時第一次非串流回覆模擬被截斷。"""

    def __init__(self, truncate_first: bool = False):
        self.requests: list[dict] = []
        self.turn = 0
        self.truncate_first = truncate_first

    def handler(self, request: httpx.Request) -> httpx.Response:
        if request.method == "GET" and request.url.path.endswith("/models"):
            self.requests.append({"url": str(request.url), "auth": request.headers.get("authorization"), "body": {}})
            return httpx.Response(200, json={"object": "list", "data": [
                {"id": "deepseek-flash", "object": "model", "name": "DeepSeek-V4.1-Flash", "context_window": 1048576, "max_output_tokens": 393216},
                {"id": "deepseek-v4-pro", "object": "model", "name": "DeepSeek-V4-Pro", "context_window": 1048576}]})
        body = json.loads(request.content)
        self.requests.append({"url": str(request.url), "auth": request.headers.get("authorization"), "body": body})
        usage = {"prompt_tokens": 1200, "completion_tokens": 300, "prompt_tokens_details": {"cached_tokens": 1000}}
        served = {"model": "deepseek-flash", "system_fingerprint": "fp_test"}      # 別名 → 真實 id
        if body.get("stream"):
            return httpx.Response(200, content=_sse(["## 總論\n方向：平\n", READING_TEXT[len("## 總論\n方向：平\n"):]], usage),
                                  headers={"content-type": "text/event-stream"})
        if body.get("tools"):
            self.turn += 1
            if self.turn == 1:      # 第一回合：模型決定查 2027 流年
                msg = {"role": "assistant", "content": None,
                       "tool_calls": [{"id": "call_1", "type": "function",
                                       "function": {"name": "recast_year", "arguments": json.dumps({"year": 2027})}}]}
                return httpx.Response(200, json={"choices": [{"message": msg, "finish_reason": "tool_calls"}], "usage": usage, **served})
            msg = {"role": "assistant", "content": "2027 丁未年，七殺偏印，部分喜用，換工作宜審慎。\n依據：bazi.liunian.2027\n知識卡：shishen.qisha"}
            return httpx.Response(200, json={"choices": [{"message": msg, "finish_reason": "stop"}], "usage": usage, **served})
        if self.truncate_first and body["max_tokens"] <= 8000:
            return httpx.Response(200, json={"choices": [{"message": {"role": "assistant", "content": READING_TEXT[:60]}, "finish_reason": "length"}],
                                             "usage": usage, **served})
        return httpx.Response(200, json={"choices": [{"message": {"role": "assistant", "content": READING_TEXT}, "finish_reason": "stop"}],
                                         "usage": usage, **served})


@pytest.fixture
def fake(monkeypatch):
    srv = FakeServer()
    monkeypatch.setattr(providers, "_transport_factory", lambda: httpx.MockTransport(srv.handler))
    providers.LAST_SERVED.clear()
    providers._describe_cache.clear()
    return srv


def _use(monkeypatch, backend: str, key: str = "sk-test", model: str = "", base: str = ""):
    monkeypatch.setenv("LLM_BACKEND", backend)
    monkeypatch.setenv("LLM_API_KEY", key)
    monkeypatch.setenv("LLM_MODEL", model)
    monkeypatch.setenv("LLM_BASE_URL", base)
    get_settings.cache_clear()


@pytest.mark.parametrize("backend,host,model", [
    ("deepseek", "api.deepseek.com", "deepseek-flash"),
    ("gemini", "generativelanguage.googleapis.com", "gemini-2.5-flash"),
    ("openai", "api.openai.com", "gpt-4o-mini"),
])
def test_presets_resolve(monkeypatch, backend, host, model):
    _use(monkeypatch, backend)
    p = providers.resolve()
    assert p.kind == "openai" and p.ready and host in p.base_url and p.model == model


def test_anthropic_resolve_accepts_old_env(monkeypatch):
    _use(monkeypatch, "anthropic", key="")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "sk-ant")
    get_settings.cache_clear()
    p = providers.resolve()
    assert p.kind == "anthropic" and p.ready and p.model == "claude-opus-5-5"


def test_local_model_needs_no_key(monkeypatch):
    _use(monkeypatch, "openai_compatible", key="", model="qwen2.5:7b", base="http://localhost:11434/v1/")
    p = providers.resolve()
    assert p.ready and p.base_url == "http://localhost:11434/v1"


def test_unknown_backend_is_mock(monkeypatch):
    _use(monkeypatch, "whatever")
    assert providers.resolve().kind == "mock" and not get_settings().llm_ready


def test_reading_via_deepseek(monkeypatch, fake):
    from fortune.birth import BirthInput
    from fortune.reading.report import make_reading
    _use(monkeypatch, "deepseek")
    r, _ = make_reading("bazi", BirthInput(**MEI))
    assert r.backend == "deepseek" and len(r.sections) == 6 and r.sections[0].evidence == ["bazi.day_master", "bazi.strength"]
    assert r.cost_usd > 0
    req = fake.requests[0]
    assert req["url"].startswith("https://api.deepseek.com/v1/chat/completions") and req["auth"] == "Bearer sk-test"
    assert req["body"]["model"] == "deepseek-flash" and req["body"]["messages"][0]["role"] == "system"


def test_stream_via_gemini(monkeypatch, fake):
    from fortune.birth import BirthInput
    from fortune.reading.report import stream_reading
    _use(monkeypatch, "gemini")
    pieces, final = [], None
    for item in stream_reading("bazi", BirthInput(**MEI)):
        if isinstance(item, tuple):
            final = item[0]
        else:
            pieces.append(item)
    assert pieces and final.backend == "gemini" and final.sections[5].direction == "凶"
    assert fake.requests[0]["body"]["stream"] is True


def test_chat_tool_loop_via_openai(monkeypatch, fake):
    from fortune.birth import BirthInput
    from fortune.chat.session import chat
    _use(monkeypatch, "openai")
    out = chat(None, "明年適合換工作嗎", BirthInput(**MEI))
    assert out["action"] == "recast" and "bazi.liunian.2027" in out["evidence"] and "shishen.qisha" in out["cards"]
    bodies = [r["body"] for r in fake.requests]
    assert bodies[0]["tools"][0]["type"] == "function" and bodies[0]["tools"][0]["function"]["name"] == "recast_year"
    assert bodies[1]["messages"][-1]["role"] == "tool" and bodies[1]["messages"][-1]["tool_call_id"] == "call_1"


def test_provider_failure_falls_back_to_mock(monkeypatch):
    from fortune.birth import BirthInput
    from fortune.reading.report import make_reading
    monkeypatch.setattr(providers, "_transport_factory",
                        lambda: httpx.MockTransport(lambda r: httpx.Response(500, json={"error": "boom"})))
    _use(monkeypatch, "deepseek")
    r, _ = make_reading("bazi", BirthInput(**MEI))
    assert r.backend == "mock" and r.checks["passed"]


def test_health_reports_provider(monkeypatch):
    from fastapi.testclient import TestClient
    from fortune.api.main import app
    _use(monkeypatch, "gemini")
    h = TestClient(app).get("/api/health").json()
    assert h["backend"] == "gemini" and h["model"] == "gemini-2.5-flash"


def test_describe_reports_alias_and_served_model(monkeypatch, fake):
    _use(monkeypatch, "deepseek", model="deepseek-chat")       # 設定別名
    info = providers.describe()                                 # 會先 probe 一次（1 token）
    assert info["configured"] == "deepseek-chat" and info["served"] == "deepseek-flash"
    assert info["served_name"] == "DeepSeek-V4.1-Flash" and info["context_window"] == 1048576
    assert "別名" in info["note"] and info["fingerprint"] == "fp_test"
    assert [m["id"] for m in info["available"]] == ["deepseek-flash", "deepseek-v4-pro"]
    assert any(r["url"].endswith("/models") for r in fake.requests)


def test_health_exposes_model_info(monkeypatch, fake):
    from fastapi.testclient import TestClient
    from fortune.api.main import app
    _use(monkeypatch, "deepseek")
    h = TestClient(app).get("/api/health").json()
    assert h["model_info"]["served"] == "deepseek-flash" and h["model_info"]["name"] == "DeepSeek-V4.1-Flash"


def test_truncated_output_is_retried_with_double_budget(monkeypatch):
    from fortune.birth import BirthInput
    from fortune.reading.report import make_reading
    srv = FakeServer(truncate_first=True)
    monkeypatch.setattr(providers, "_transport_factory", lambda: httpx.MockTransport(srv.handler))
    providers.LAST_SERVED.clear()
    _use(monkeypatch, "deepseek")
    r, _ = make_reading("bazi", BirthInput(**MEI))
    budgets = [q["body"]["max_tokens"] for q in srv.requests if q["body"].get("messages") and not q["body"].get("tools")]
    assert budgets[-2:] == [8000, 16000]                       # 第一次 8000 被截斷 → 加倍重試
    assert len(r.sections) == 6 and all("缺漏" not in s.text for s in r.sections)
    assert any("加倍重試成功" in w for w in r.warnings)


def test_gender_is_a_fact(monkeypatch):
    from fortune.birth import BirthInput
    from fortune.chart import cast
    assert cast("bazi", BirthInput(**MEI)).fact("bazi.gender").value == "女命"
    assert cast("ziwei", BirthInput(**MEI)).fact("ziwei.gender").value == "女命"
    assert cast("bazi", BirthInput(birth_date="1990-06-15")).fact("bazi.gender").value.startswith("未填")


def test_thinking_param_mapping(monkeypatch, fake):
    from fortune.birth import BirthInput
    from fortune.reading.report import make_reading
    _use(monkeypatch, "deepseek")
    monkeypatch.setenv("LLM_THINKING", "off"); get_settings.cache_clear()
    make_reading("bazi", BirthInput(**MEI))
    body = [q["body"] for q in fake.requests if q["body"].get("messages")][-1]
    assert body["thinking"] == {"type": "disabled"} and "reasoning_effort" not in body
    monkeypatch.setenv("LLM_THINKING", "high"); get_settings.cache_clear()
    make_reading("bazi", BirthInput(**MEI))
    body = [q["body"] for q in fake.requests if q["body"].get("messages")][-1]
    assert body["reasoning_effort"] == "high" and "thinking" not in body
    _use(monkeypatch, "openai", model="gpt-4o-mini")
    monkeypatch.setenv("LLM_THINKING", "off"); get_settings.cache_clear()
    make_reading("bazi", BirthInput(**MEI))
    body = [q["body"] for q in fake.requests if q["body"].get("messages")][-1]
    assert "thinking" not in body and "reasoning_effort" not in body     # 非推理模型不送
