"""API 契約（docs/api.md）、用量上限、緊急開關、對話。"""

import pytest
from fastapi.testclient import TestClient

from fortune.config import get_settings


@pytest.fixture
def client():
    from fortune.api import limits
    from fortune.api.main import app
    limits._state.update({"day": "", "per_ip": {}, "total": 0, "cost_usd": 0.0})
    return TestClient(app)


MEI = {"name": "小美", "birth_date": "1990-06-15", "birth_time": "14:30", "gender": "female", "longitude": 121.5}
MING = {"name": "小明", "birth_date": "1988-11-02", "birth_time": "08:10", "gender": "male", "longitude": 121.5}


def test_health(client):
    r = client.get("/api/health").json()
    assert r["status"] == "ok" and r["backend"] == "mock"


def test_cast_all_and_needs_birth_time(client):
    r = client.post("/api/cast/all", json={"birth": MEI}).json()
    assert r["bazi"]["system"] == "bazi" and r["ziwei"]["payload"]["five_class"] == "土五局"
    r = client.post("/api/cast/all", json={"birth": {"birth_date": "1990-06-15"}}).json()
    assert r["ziwei"] is None and len(r["ziwei_candidates"]) == 12
    r = client.post("/api/cast", json={"system": "ziwei", "birth": {"birth_date": "1990-06-15"}})
    assert r.status_code == 422 and r.json()["error"] == "needs_birth_time"


def test_reading_and_stream(client):
    r = client.post("/api/reading", json={"system": "bazi", "birth": MEI}).json()
    assert len(r["sections"]) == 6 and r["checks"]["passed"]
    with client.stream("POST", "/api/reading/stream", json={"system": "ziwei", "birth": MEI}) as resp:
        body = "".join(resp.iter_text())
    assert "event: delta" in body and "event: done" in body


def test_check_endpoint(client):
    r = client.post("/api/reading", json={"system": "bazi", "birth": MEI}).json()
    chart = client.post("/api/cast", json={"system": "bazi", "birth": MEI}).json()
    r["sections"][0]["text"] = "保證準。"
    res = client.post("/api/check", json={"reading": r, "chart": chart}).json()
    assert not res["boundary_check"]["ok"]


def test_synastry(client):
    r = client.post("/api/synastry", json={"a": MEI, "b": MING}).json()
    assert r["items"] and r["score"]["net"] == r["score"]["harmony"] - r["score"]["tension"]


def test_chat_session_and_refusal(client):
    r = client.post("/api/chat", json={"birth": MEI, "message": "我的日主是什麼？"}).json()
    sid = r["session_id"]
    assert r["action"] == "answer" and "bazi.day_master" in r["evidence"]
    r2 = client.post("/api/chat", json={"session_id": sid, "message": "明年適合換工作嗎"}).json()
    assert r2["action"] == "recast" and any(e.startswith("bazi.liunian.") for e in r2["evidence"])
    r3 = client.post("/api/chat", json={"session_id": sid, "message": "我明年會不會生病"})
    assert r3.status_code == 400 and r3.json()["error"] == "refused"
    assert client.delete(f"/api/chat/{sid}").json()["deleted"] is True
    assert client.post("/api/chat", json={"session_id": sid, "message": "hi"}).status_code == 404


def test_chat_offline_answers_by_topic(client):
    r = client.post("/api/chat", json={"birth": MEI, "message": "最近有桃花嗎"}).json()
    assert r["action"] == "answer" and r["topic"] == "love" and r["evidence"]      # 問運勢 → 主題回答，不是查「桃花」卡
    r0 = client.post("/api/chat", json={"session_id": r["session_id"], "message": "桃花是什麼意思？"}).json()
    assert r0["action"] == "lookup" and r0["cards"] == ["shensha.taohua"]
    assert "感情" in r["reply"]
    r2 = client.post("/api/chat", json={"session_id": r["session_id"], "message": "我的財運怎麼看"}).json()
    assert r2["topic"] == "wealth" and "財" in r2["reply"]
    assert client.get("/api/persona").json()["suggestions"]


def test_rate_limit(client, monkeypatch):
    monkeypatch.setenv("RATE_LIMIT_PER_IP_PER_DAY", "2")
    get_settings.cache_clear()
    for _ in range(2):
        assert client.post("/api/reading", json={"system": "bazi", "birth": MEI}).status_code == 200
    r = client.post("/api/reading", json={"system": "bazi", "birth": MEI})
    assert r.status_code == 429 and r.json()["error"] == "rate_limited"


def test_maintenance_switch(client, monkeypatch):
    monkeypatch.setenv("MAINTENANCE", "1")
    get_settings.cache_clear()
    assert client.post("/api/cast", json={"system": "bazi", "birth": MEI}).status_code == 503
    assert client.get("/api/health").status_code == 200


def test_cards_and_persona(client):
    assert isinstance(client.get("/api/cards").json(), list)
    assert client.get("/api/cards/not.exist").status_code == 404
    assert "name" in client.get("/api/persona").json()


def test_chat_reply_strips_ids_but_keeps_tags():
    from fortune.chat.session import _strip_ids
    text = ("你的日主是丙火，盤面判為身強（wangshuai.shenqiang、shishen.bijian）。命宮見文昌化科（hua.ke）。\n"
            "這些是傾向，不是定論。\n\n依據：bazi.day_master, bazi.strength, ziwei.palace.命宮\n知識卡：wangshuai.shenqiang, hua.ke")
    reply, ev, cd = _strip_ids(text)
    assert "依據" not in reply and "知識卡" not in reply and "shenqiang" not in reply and "（）" not in reply
    assert reply.startswith("你的日主是丙火，盤面判為身強。命宮見文昌化科。")
    assert "bazi.day_master" in ev and "ziwei.palace.命宮" in ev and "hua.ke" in cd and "shishen.bijian" in cd
    # 有文字的括號不動
    assert _strip_ids("年支午是羊刃（身強的人常見）。")[0] == "年支午是羊刃（身強的人常見）。"
