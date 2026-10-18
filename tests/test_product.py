"""產品層：Telegram 走用量上限、成本紀錄、人設切換、紫微合盤、事實的「怎麼算的」。"""

from datetime import date

import pytest

from fortune.config import get_settings

MEI = {"name": "小美", "birth_date": "1990-06-15", "birth_time": "14:30", "gender": "female", "longitude": 121.5}
MING = {"name": "小明", "birth_date": "1988-11-02", "birth_time": "08:10", "gender": "male", "longitude": 121.5}


@pytest.fixture
def fresh_limits():
    from fortune.api import limits
    limits._state.update({"day": "", "per_ip": {}, "total": 0, "cost_usd": 0.0})
    return limits


def test_telegram_bot_respects_rate_limit(monkeypatch, fresh_limits):
    from fortune.bot import telegram as tg
    monkeypatch.setenv("RATE_LIMIT_PER_IP_PER_DAY", "2")
    get_settings.cache_clear()
    tg._users.clear()
    assert "已記下" in tg.handle(42, "/birth 1990-06-15 14:30 女")
    assert "八字：" in tg.handle(42, "/chart")                      # 排盤不計費、不計次
    assert "【總論" in tg.handle(42, "/reading bazi")                 # 第 1 次
    assert "日主" in tg.handle(42, "我的日主是什麼？")                 # 第 2 次（對話）
    assert "上限" in tg.handle(42, "/reading ziwei")                  # 第 3 次 → 擋下
    assert "已記下" in tg.handle(7, "/birth 1988-11-02 08:10 男")     # 另一個使用者不受影響
    assert "【總論" in tg.handle(7, "/reading bazi")
    assert "已刪除" in tg.handle(42, "/forget")


def test_cost_log_written_and_summarised(fresh_limits):
    limits = fresh_limits
    limits.add_cost(0.0025, kind="reading", backend="deepseek", model="deepseek-flash", input_tokens=5000, output_tokens=800)
    limits.add_cost(0.0041, kind="reading", backend="deepseek", model="deepseek-flash", input_tokens=6000, output_tokens=900)
    limits.add_cost(0.0, kind="reading", backend="mock", model="")        # 離線不記
    u = limits.usage()
    assert u["cost_usd"] == 0.0066
    by = u["cost_log"]["by_model"]["deepseek/deepseek-flash"]
    assert by["count"] == 2 and by["avg_usd"] == 0.0033 and by["input_tokens"] == 11000
    assert (get_settings().data_dir / "cost_log.csv").read_text(encoding="utf-8").startswith(limits.COST_LOG_HEADER)
    assert len(u["cost_log"]["rows"]) == 2


def test_persona_switch_by_env(monkeypatch):
    from fortune.reading.persona import load_persona
    monkeypatch.setenv("PERSONA", "does_not_exist")
    get_settings.cache_clear(); load_persona.cache_clear()
    assert load_persona().name == "玄機"                               # 找不到檔 → 預設人設
    monkeypatch.setenv("PERSONA", "master")
    get_settings.cache_clear(); load_persona.cache_clear()
    assert get_settings().persona_path.name == "master.yaml" and load_persona().name == "玄機"
    if (get_settings().persona_path.parent / "yuelao.yaml").exists():
        monkeypatch.setenv("PERSONA", "yuelao")
        get_settings.cache_clear(); load_persona.cache_clear()
        assert load_persona().name == "月老"
    load_persona.cache_clear()


def test_ziwei_synastry_items_and_evidence():
    from fortune.bazi.synastry import synastry
    from fortune.birth import BirthInput
    s = synastry(BirthInput(**MEI), BirthInput(**MING), today=date(2026, 10, 8))
    assert s.a_ziwei and s.b_ziwei and s.ziwei_items
    for it in s.ziwei_items:
        for e in it.evidence:
            chart = s.a_ziwei if e["who"] == "a" else s.b_ziwei
            assert e["fact_id"] in chart.fact_ids(), e
    assert s.score["net"] == s.score["harmony"] - s.score["tension"]
    # 一方缺時辰 → 沒有紫微合盤，但八字合盤照常
    s2 = synastry(BirthInput(**MEI), BirthInput(name="無時", birth_date="1988-11-02", gender="male"))
    assert s2.a_ziwei is None and s2.ziwei_items == [] and s2.items


def test_key_facts_explain_how():
    from fortune.birth import BirthInput
    from fortune.chart import cast
    c = cast("bazi", BirthInput(**MEI), today=date(2026, 10, 8))
    for fid in ("bazi.pillar.month", "bazi.pillar.hour", "bazi.strength", "bazi.qiyun", "bazi.liunian.2026", "bazi.shensha", "bazi.chenggu"):
        assert c.fact(fid).how, fid
    z = cast("ziwei", BirthInput(**MEI), today=date(2026, 10, 8))
    assert z.fact("ziwei.life_palace").how and z.fact("ziwei.five_class").how and z.fact("ziwei.daxian.current").how


def test_consistency_endpoint_strips_readings_and_reports_cost():
    from fastapi.testclient import TestClient
    from fortune.api.main import app
    r = TestClient(app).post("/api/consistency", json={"system": "bazi", "birth": MEI, "runs": 2}).json()
    assert "readings" not in r and r["cost_usd"] == 0.0 and r["runs"] == 2 and len(r["texts"]) == 2
