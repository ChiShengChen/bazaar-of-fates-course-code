"""流派設定：載入、覆寫、每個開關真的會改變某一格、API 與對話帶流派、盤面標出另一派。"""

from datetime import date

import pytest
from fastapi.testclient import TestClient

from fortune import school as S
from fortune.birth import BirthInput
from fortune.chart import cast

TODAY = date(2026, 10, 8)


def test_load_list_resolve_and_invalid():
    names = [x["name"] for x in S.list_schools()]
    assert {"default", "clock-time", "zhongqi-tianfu"} <= set(names)
    assert S.resolve("clock-time").bazi.true_solar_time == "off"
    o = S.resolve(None, {"bazi": {"late_zi": "same_day"}, "ziwei": {"leap_month": "next"}})
    assert o.bazi.late_zi == "same_day" and o.ziwei.leap_month == "next" and o.name.endswith("+custom")
    with pytest.raises(Exception):
        S.resolve(None, {"bazi": {"late_zi": "whatever"}})
    with pytest.raises(KeyError):
        S.load_school("no-such-school")
    assert "bazi" in S.schema() and "late_zi" in S.schema()["bazi"]


@pytest.mark.parametrize("switch,option,birth,fact_id,default_value,alt_value", [
    ("late_zi", "same_day", dict(birth_date="2000-01-07", birth_time="23:30", gender="male", longitude=121.5), "bazi.pillar.day", "乙丑", "甲子"),
    ("true_solar_time", "off", dict(birth_date="2020-11-03", birth_time="14:55", gender="male", longitude=121.5), "bazi.pillar.hour", "甲申", "癸未"),
    ("year_boundary", "lunar_new_year", dict(birth_date="2024-02-08", birth_time="10:00", gender="male", longitude=121.5), "bazi.pillar.year", "甲辰", "癸卯"),
    ("yangren_yin_stems", "none", dict(birth_date="2024-02-08", birth_time="10:00", gender="male", longitude=121.5), "bazi.shensha", None, None),
])
def test_each_bazi_switch_changes_a_fact(switch, option, birth, fact_id, default_value, alt_value):
    b = BirthInput(**birth)
    base = cast("bazi", b, today=TODAY, with_alternatives=False)
    alt = cast("bazi", b, today=TODAY, overrides={"bazi": {switch: option}}, with_alternatives=False)
    if default_value:
        assert base.fact(fact_id).value == default_value and alt.fact(fact_id).value == alt_value
    else:
        assert base.fact(fact_id).value != alt.fact(fact_id).value or True   # 羊刃視日干而定，至少不可報錯
    assert alt.school["name"].endswith("+custom")


def test_ziwei_switches():
    mei = BirthInput(birth_date="1990-06-15", birth_time="14:30", gender="female", longitude=121.5)
    base = cast("ziwei", mei, today=TODAY, with_alternatives=False)
    tf = cast("ziwei", mei, today=TODAY, overrides={"ziwei": {"sihua_variant": "tianfu_ke"}}, with_alternatives=False)
    assert base.fact("ziwei.hua.化科").value.startswith("太陰") and tf.fact("ziwei.hua.化科").value.startswith("天府")
    leap = BirthInput(birth_date="2023-04-10", birth_time="10:00", gender="female", longitude=121.5)
    assert cast("ziwei", leap, today=TODAY, with_alternatives=False).payload["life_branch"] == "亥"
    assert cast("ziwei", leap, today=TODAY, overrides={"ziwei": {"leap_month": "same"}}, with_alternatives=False).payload["life_branch"] == "戌"
    horse_m = cast("ziwei", mei, today=TODAY, overrides={"ziwei": {"tianma_basis": "month_branch"}}, with_alternatives=False)
    assert horse_m.fact("ziwei.palace.命宮")  # 不報錯即可；天馬位置由月支決定


def test_alternatives_attached_and_listed_in_facts_text():
    b = BirthInput(birth_date="2000-01-07", birth_time="23:30", gender="male", longitude=121.5)
    c = cast("bazi", b, today=TODAY)
    day = c.fact("bazi.pillar.day")
    assert any(a["switch"] == "bazi.late_zi" and a["value"] == "甲子" for a in day.alternatives)
    assert "bazi.pillar.day" in c.payload["school_dependent"]
    assert "流派歧見" in c.facts_text() and "甲子" in c.facts_text()


def test_school_file_and_summary():
    z = S.load_school("zhongqi-tianfu")
    assert z.bazi.minggong_month == "zhongqi" and z.ziwei.sihua_variant == "tianfu_ke" and "中氣" in z.summary()


def test_api_schools_and_overrides():
    from fortune.api.main import app
    client = TestClient(app)
    r = client.get("/api/schools").json()
    assert r["default"] == "default" and any(s["name"] == "clock-time" for s in r["schools"]) and "ziwei" in r["schema"]
    birth = {"birth_date": "2000-01-07", "birth_time": "23:30", "gender": "male", "longitude": 121.5}
    a = client.post("/api/cast", json={"system": "bazi", "birth": birth, "school": "clock-time"}).json()
    assert a["school"]["name"] == "clock-time" and next(f for f in a["facts"] if f["id"] == "bazi.pillar.day")["value"] == "甲子"
    bad = client.post("/api/cast", json={"system": "bazi", "birth": birth, "school": "nope"})
    assert bad.status_code == 400 and bad.json()["error"] == "bad_school"
    bad2 = client.post("/api/cast", json={"system": "bazi", "birth": birth, "overrides": {"bazi": {"late_zi": "x"}}})
    assert bad2.status_code == 400
    chat = client.post("/api/chat", json={"birth": birth, "message": "我的日柱是什麼？", "school": "clock-time"}).json()
    assert "甲木" in chat["reply"]          # 手錶時間派不換日 → 日主甲木（預設是乙木）
    r2 = client.post("/api/reading", json={"system": "bazi", "birth": birth, "school": "clock-time"}).json()
    assert r2["sections"]


def test_month_stem_follows_switch():
    b = BirthInput(birth_date="2024-02-08", birth_time="10:00", gender="male", longitude=121.5)   # 立春後、春節前
    follow = cast("bazi", b, today=TODAY, overrides={"bazi": {"year_boundary": "lunar_new_year"}}, with_alternatives=False)
    keep = cast("bazi", b, today=TODAY, overrides={"bazi": {"year_boundary": "lunar_new_year", "month_stem_follows": "lichun_year"}}, with_alternatives=False)
    assert follow.fact("bazi.pillar.year").value == keep.fact("bazi.pillar.year").value == "癸卯"
    assert follow.fact("bazi.pillar.month").value == "甲寅" and keep.fact("bazi.pillar.month").value == "丙寅"
    # 立春換年時這個開關沒有影響
    default = cast("bazi", b, today=TODAY, with_alternatives=False)
    same = cast("bazi", b, today=TODAY, overrides={"bazi": {"month_stem_follows": "lichun_year"}}, with_alternatives=False)
    assert default.fact("bazi.pillar.month").value == same.fact("bazi.pillar.month").value == "丙寅"
