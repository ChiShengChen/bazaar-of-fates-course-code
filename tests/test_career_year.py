"""事業流年報告（10-4）：指定一年，只談那一年的事業，四段；全部離線跑。"""

import pytest
from fastapi.testclient import TestClient

from fortune.chart import cast
from fortune.reading.consistency import consistency_report
from fortune.reading.persona import load_persona
from fortune.reading.prompt import system_prompt, user_prompt
from fortune.reading.report import make_reading, parse_sections
from fortune.reading.sections import CAREER_YEAR_SECTIONS, NoYearFacts, directions, hua_moves

KEYS = [k for k, _ in CAREER_YEAR_SECTIONS]


@pytest.mark.parametrize("system", ["bazi", "ziwei"])
def test_four_sections_with_evidence_and_checks(mei, system):
    r, chart = make_reading(system, mei, kind="career_year", year=2027)
    assert (r.kind, r.year) == ("career_year", 2027)
    assert [s.key for s in r.sections] == KEYS and [s.title for s in r.sections] == ["年度總覽", "事業走勢", "可以把握的", "要留意的"]
    assert all(s.evidence and all(e in chart.fact_ids() for e in s.evidence) for s in r.sections)
    assert f"{system}.liunian.2027" in r.sections[0].evidence           # 年度總覽一定引用那一年的流年
    assert r.checks["passed"], r.checks


def test_directions_for_mei_2027(mei):
    # 小美 2027 丁未：八字流年七殺／偏印、大運戊寅（正印／正財）；紫微流年命宮在本命財帛宮，天同化權入官祿宮、巨門化忌入命宮
    from datetime import date
    bazi = directions(cast("bazi", mei, today=date(2027, 7, 1), with_alternatives=False), "career_year")
    assert [d.direction for d in bazi] == ["平", "吉", "吉", "吉"]
    assert "七殺" in bazi[1].reason and "偏印" in bazi[1].reason and "戊寅" in bazi[1].reason
    ziwei = directions(cast("ziwei", mei, today=date(2027, 7, 1), with_alternatives=False), "career_year")
    assert [d.direction for d in ziwei] == ["平", "吉", "吉", "凶"]
    assert "天同化權入官祿宮" in ziwei[1].reason and "巨門化忌入命宮" in ziwei[3].reason
    assert "ziwei.palace.命宮" in ziwei[3].evidence                     # 化忌落在哪一宮，依據就列哪一宮


def test_hua_moves_parses_the_note():
    note = "流年四化（丁干）：太陰化祿、天同化權、天機化科、巨門化忌；四化落宮：太陰化祿入夫妻宮、天同化權入官祿宮、天機化科入財帛宮、巨門化忌入命宮；流曜：流祿午"
    assert hua_moves(note) == [("太陰", "祿", "夫妻宮"), ("天同", "權", "官祿宮"), ("天機", "科", "財帛宮"), ("巨門", "忌", "命宮")]


def test_any_year_recasts_with_that_date(mei):
    # 排盤只算「今年起三年」的流年；更遠的年份用那一年的日期重排，不讓 AI 自己算
    r, chart = make_reading("bazi", mei, kind="career_year", year=2035)
    assert r.year == 2035 and chart.fact("bazi.liunian.2035") and "今年" in chart.fact("bazi.liunian.2035").note


def test_prompt_says_four_sections_and_the_year(mei):
    from datetime import date
    chart = cast("bazi", mei, today=date(2027, 7, 1), with_alternatives=False)
    dirs = directions(chart, "career_year")
    sp = system_prompt(load_persona(), "bazi", "career_year")
    up = user_prompt(chart, [], dirs, kind="career_year")
    assert "四段都要有" in sp and "## 年度總覽" in sp and "## 要留意的" in sp
    assert "2027 年事業流年" in up and up.rstrip().endswith("請依格式輸出四段解讀。")
    assert "請依格式輸出六段解讀。" in user_prompt(chart, [], directions(chart))   # 一般解讀照舊


def test_parse_career_titles(mei):
    from datetime import date
    dirs = directions(cast("bazi", mei, today=date(2027, 7, 1), with_alternatives=False), "career_year")
    secs = parse_sections("## 事業走勢\n方向：吉\n今年有官有印。\n依據：bazi.liunian.2027\n知識卡：無\n", dirs, "bazi", "career_year")
    assert [s.key for s in secs] == KEYS and secs[1].evidence == ["bazi.liunian.2027"] and "缺漏" in secs[0].text


def test_same_chart_three_times_same_directions(mei):
    rep = consistency_report("ziwei", mei, runs=3, kind="career_year", year=2027)
    assert all(s["direction_consistent"] for s in rep["sections"]) and [s["key"] for s in rep["sections"]] == KEYS


def test_xingming_has_no_career_year(mei):
    with pytest.raises(NoYearFacts):
        directions(cast("xingming", mei.model_copy(update={"full_name": "陳美玲"}), with_alternatives=False), "career_year")


def test_api_career_year():
    from fortune.api import limits
    from fortune.api.main import app
    limits._state.update({"day": "", "per_ip": {}, "total": 0, "cost_usd": 0.0})
    client = TestClient(app)
    birth = {"name": "小美", "birth_date": "1990-06-15", "birth_time": "14:30", "gender": "female", "longitude": 121.5}
    r = client.post("/api/reading", json={"system": "bazi", "birth": birth, "kind": "career_year", "year": 2027})
    assert r.status_code == 200 and r.json()["year"] == 2027 and [s["key"] for s in r.json()["sections"]] == KEYS
    bad = client.post("/api/reading", json={"system": "xingming", "birth": {**birth, "full_name": "陳美玲"}, "kind": "career_year", "year": 2027})
    assert bad.status_code == 400 and bad.json()["error"] == "unsupported_kind"
    plain = client.post("/api/reading", json={"system": "bazi", "birth": birth})
    assert plain.json()["kind"] == "general" and len(plain.json()["sections"]) == 6
