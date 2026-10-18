"""自帶金鑰（BYOK）：每請求覆寫供應商／模型／金鑰，只活在該請求；費用不算站台預算；金鑰不落地。"""

import json

import httpx
import pytest
from fastapi.testclient import TestClient

from fortune.config import get_settings
from fortune.reading import providers
from tests.test_providers import READING_TEXT, FakeServer

MEI = {"name": "小美", "birth_date": "1990-06-15", "birth_time": "14:30", "gender": "female", "longitude": 121.5}


@pytest.fixture
def fake(monkeypatch):
    srv = FakeServer()
    monkeypatch.setattr(providers, "_transport_factory", lambda: httpx.MockTransport(srv.handler))
    providers.LAST_SERVED.clear()
    providers._describe_cache.clear()
    return srv


@pytest.fixture
def client():
    from fortune.api import limits
    from fortune.api.main import app
    limits._state.update({"day": "", "per_ip": {}, "total": 0, "cost_usd": 0.0})
    return TestClient(app)


def test_override_resolves_and_validates():
    p = providers.from_override({"backend": "gemini", "api_key": "k1", "model": "", "thinking": "off"})
    assert p.kind == "openai" and p.byok and p.model == "gemini-2.5-flash" and p.ready and p.thinking == "off"
    assert providers.from_override({"backend": "openai_compatible", "base_url": "http://localhost:11434/v1/"}).ready   # 本機不需金鑰
    assert not providers.from_override({"backend": "openai"}).ready
    with pytest.raises(ValueError):
        providers.from_override({"backend": "nope", "api_key": "x"})
    with pytest.raises(ValueError):
        providers.from_override({"backend": "openai", "api_key": "x", "thinking": "max"})
    tok = providers.REQUEST_LLM.set({"backend": "deepseek", "api_key": "k2"})
    try:
        assert providers.resolve().backend == "deepseek" and providers.resolve().api_key == "k2"
        assert providers.thinking_mode() == (get_settings().llm_thinking or "default")
    finally:
        providers.REQUEST_LLM.reset(tok)
    assert providers.resolve().backend == "mock"          # 離開請求後回到站台設定


def test_backends_and_models_endpoints(client, fake):
    b = client.get("/api/llm/backends").json()
    assert {x["name"] for x in b["backends"]} >= {"anthropic", "openai", "deepseek", "gemini", "openai_compatible"}
    r = client.post("/api/llm/models", json={"backend": "deepseek", "api_key": "sk-user"}).json()
    assert r["ok"] and [m["id"] for m in r["models"]] == ["deepseek-flash", "deepseek-v4-pro"] and r["served"] == "deepseek-flash"
    assert fake.requests[0]["auth"] == "Bearer sk-user"
    bad = client.post("/api/llm/models", json={"backend": "nope", "api_key": "x"})
    assert bad.status_code == 400 and bad.json()["error"] == "bad_llm"
    nokey = client.post("/api/llm/models", json={"backend": "openai"}).json()
    assert not nokey["ok"] and "金鑰" in nokey["error"]


def test_reading_with_user_key_uses_it_and_is_not_charged_to_site_budget(client, fake):
    from fortune.api import limits
    r = client.post("/api/reading", json={"system": "bazi", "birth": MEI,
                                          "llm": {"backend": "gemini", "api_key": "user-gem", "model": "gemini-2.5-pro", "thinking": "off"}}).json()
    assert r["backend"] == "gemini" and r["model"] == "gemini-2.5-pro" and r["byok"] is True and r["cost_usd"] > 0
    req = [q for q in fake.requests if q["body"].get("messages")][-1]
    assert req["auth"] == "Bearer user-gem" and req["url"].startswith("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions")
    assert req["body"]["model"] == "gemini-2.5-pro" and req["body"]["reasoning_effort"] == "none"
    u = limits.usage()
    assert u["cost_usd"] == 0.0                              # 使用者自付，不算站台預算
    assert u["cost_log"]["rows"][-1]["kind"].endswith(":byok")   # 但有紀錄
    assert u["total_readings"] == 1                          # 次數照算
    # 離開請求後站台設定不受影響
    assert client.get("/api/health").json()["backend"] == "mock"


def test_stream_and_chat_with_user_key(client, fake):
    with client.stream("POST", "/api/reading/stream", json={"system": "bazi", "birth": MEI,
                                                           "llm": {"backend": "deepseek", "api_key": "u2"}}) as resp:
        body = "".join(resp.iter_text())
    assert "event: done" in body and '"byok": true' in body
    c = client.post("/api/chat", json={"birth": MEI, "message": "明年適合換工作嗎", "llm": {"backend": "openai", "api_key": "u3"}}).json()
    assert c["action"] == "recast" and c.get("byok") is True
    assert any(q["auth"] == "Bearer u3" for q in fake.requests)


def test_bad_llm_rejected_before_streaming(client):
    r = client.post("/api/reading/stream", json={"system": "bazi", "birth": MEI, "llm": {"backend": "nope"}})
    assert r.status_code == 400 and r.json()["error"] == "bad_llm"


def test_key_never_appears_in_error_text(client, monkeypatch):
    def boom(request):
        return httpx.Response(401, json={"error": {"message": "invalid key sk-secret-123"}})
    monkeypatch.setattr(providers, "_transport_factory", lambda: httpx.MockTransport(boom))
    r = client.post("/api/llm/models", json={"backend": "deepseek", "api_key": "sk-secret-123"}).json()
    assert not r["ok"] and "sk-secret-123" not in json.dumps(r)
