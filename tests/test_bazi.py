"""八字引擎：標準命例逐格比對（4-2）、十神、時辰不明、大運、合盤。"""

from pathlib import Path

import pytest
import yaml

from fortune.bazi import engine as B
from fortune.bazi.synastry import synastry
from fortune.birth import BirthInput
from fortune.chart import bazi_chart
from fortune.tools.chart_check import run_case

CASES = yaml.safe_load((Path(__file__).parent / "cases" / "standard_cases.yaml").read_text(encoding="utf-8"))


@pytest.mark.parametrize("case", CASES, ids=[c["id"] for c in CASES])
def test_standard_case(case):
    r = run_case(case)
    assert r["ok"], r["diffs"]


def test_ten_gods_table():
    assert B.ten_god("辛", "辛") == "比肩" and B.ten_god("辛", "庚") == "劫財"
    assert B.ten_god("辛", "壬") == "傷官" and B.ten_god("辛", "癸") == "食神"
    assert B.ten_god("辛", "甲") == "正財" and B.ten_god("辛", "乙") == "偏財"
    assert B.ten_god("辛", "丙") == "正官" and B.ten_god("辛", "丁") == "七殺"
    assert B.ten_god("辛", "戊") == "正印" and B.ten_god("辛", "己") == "偏印"
    assert B.ten_god("甲", "庚") == "七殺" and B.ten_god("甲", "辛") == "正官"


def test_hidden_stems_and_gods_in_facts(mei):
    c = bazi_chart(mei)
    f = c.fact("bazi.god.day_branch")
    assert f and f.value == "壬傷官、甲正財"       # 亥藏壬甲，對辛而言
    assert c.fact("bazi.gods.absent").value == "比肩、食神、正官、正印"


def test_no_time_degrades_to_three_pillars():
    c = bazi_chart(BirthInput(birth_date="1990-06-15", gender="female"))
    assert "hour" in c.missing
    assert c.fact("bazi.pillar.hour").value.startswith("資料不足")
    assert any("時辰不明" in w for w in c.warnings)


def test_no_gender_no_dayun():
    c = bazi_chart(BirthInput(birth_date="1990-06-15", birth_time="14:30"))
    assert "gender" in c.missing
    assert c.fact("bazi.dayun.current").value.startswith("資料不足")


def test_dayun_direction_and_start(mei):
    c = B.cast(mei)
    assert c.dayun[0]["gz"] == "辛巳" and c.dayun[1]["gz"] == "庚辰"     # 陽年女命逆行
    assert 2.5 < c.dayun[0]["start_age"] < 3.5
    m = B.cast(BirthInput(birth_date="1990-06-15", birth_time="14:30", gender="male", longitude=121.5))
    assert m.dayun[0]["gz"] == "癸未"                                   # 陽年男命順行


def test_late_zi_configurable():
    b = BirthInput(birth_date="2000-01-07", birth_time="23:30", gender="male", longitude=121.5)
    assert B.cast(b).pillars["day"].gz == "乙丑"
    assert B.cast(b, late_zi_next_day=False).pillars["day"].gz == "甲子"


def test_relations_detected(mei):
    rel = bazi_chart(mei).fact("bazi.relations").value
    assert "天干五合" in rel and "六合" in rel


def test_synastry_items_trace_back_to_facts(mei, ming):
    s = synastry(mei, ming)
    assert s.items and all(i.evidence for i in s.items)
    ids_a, ids_b = s.a.fact_ids(), s.b.fact_ids()
    for i in s.items:
        for e in i.evidence:
            assert e["fact_id"] in (ids_a if e["who"] == "a" else ids_b)
    assert s.score["net"] == s.score["harmony"] - s.score["tension"]
    assert s.reading


def test_current_dayun_by_jiaoyun_date_and_year_boundaries(mei):
    from datetime import date
    c = bazi_chart(mei, today=date(2026, 10, 8))
    assert c.fact("bazi.dayun.current").value == "戊寅" and c.fact("bazi.dayun.4").value.startswith("戊寅（2023–2032 年，虛歲 34–43）")
    # 立春前：八字「今年」仍是前一年；虛歲以農曆新年為界
    c = bazi_chart(mei, today=date(2027, 1, 20))
    assert c.fact("bazi.liunian.current").value == "丙午" and "尚未立春" in c.fact("bazi.liunian.current").note
    assert c.payload["age"] == 37
    c = bazi_chart(mei, today=date(2027, 2, 10))
    assert c.fact("bazi.liunian.current").value == "丁未" and c.payload["age"] == 38


def test_dst_hint_for_taiwan_1975_summer():
    c = bazi_chart(BirthInput(birth_date="1975-07-01", birth_time="10:00", gender="male", longitude=121.5))
    assert any("日光節約" in w for w in c.warnings)
    c = bazi_chart(BirthInput(birth_date="1975-12-01", birth_time="10:00", gender="male", longitude=121.5))
    assert not any("日光節約" in w for w in c.warnings)
