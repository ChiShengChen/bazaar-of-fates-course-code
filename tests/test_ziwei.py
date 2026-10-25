"""紫微引擎：安星表、閏月、時辰不明候選、大限方向。"""

import pytest

from fortune.birth import BirthInput
from fortune.chart import ziwei_chart
from fortune.ziwei import engine as Z


def test_ziwei_position_table():
    # 《紫微斗數全書》安紫微星表抽查：局數, 日 → 地支
    for ju, day, branch in [(2, 1, "丑"), (2, 2, "寅"), (3, 1, "辰"), (4, 1, "亥"), (5, 1, "午"), (6, 1, "酉"), (5, 23, "申"), (2, 30, "辰")]:
        assert Z.BRANCHES[Z.ziwei_position(ju, day)] == branch, (ju, day)


def test_nayin_table():
    for gz, e in [("甲子", "金"), ("丙寅", "火"), ("戊辰", "木"), ("庚午", "土"), ("壬申", "金"), ("丁亥", "土"), ("癸亥", "水"), ("乙卯", "水")]:
        assert Z.nayin_element(Z.STEMS.index(gz[0]), Z.BRANCHES.index(gz[1])) == e, gz


def test_full_chart_1990(mei):
    z = Z.cast(mei)
    assert (z.life_branch, z.body_branch, z.five_class) == ("亥", "丑", "土五局")
    assert z.palace("命宮").major == ["巨門"] and z.palace("命宮").lucky == ["文曲"]
    zi = z.palace("子女宮")
    assert zi.major == ["紫微", "天府"] and "祿存" in zi.other and "火星" in zi.unlucky
    assert z.palace("遷移宮").hua == {"太陽": "化祿"} and z.palace("官祿宮").hua == {"天同": "化忌"}
    assert z.palace("命宮").daxian == (5, 14) and z.palace("兄弟宮").daxian == (15, 24)   # 陽年女命逆行


def test_daxian_forward_for_yang_male():
    z = Z.cast(BirthInput(birth_date="1990-06-15", birth_time="14:30", gender="male", longitude=121.5))
    assert z.palace("命宮").daxian == (5, 14) and z.palace("父母宮").daxian == (15, 24)


def test_needs_birth_time_gives_12_candidates():
    with pytest.raises(Z.NeedsBirthTime) as e:
        Z.cast(BirthInput(birth_date="1990-06-15", gender="female"))
    c = e.value.candidates
    assert len(c) == 12 and len({x["life_branch"] for x in c}) == 12


def test_leap_month_rules():
    b = BirthInput(birth_date="2023-04-10", birth_time="10:00", gender="female", longitude=121.5)   # 閏二月二十
    assert Z.cast(b, leap_rule="split").life_branch == "亥"      # 下半月 → 當三月
    assert Z.cast(b, leap_rule="same").life_branch == "戌"       # 整個閏月當二月
    assert Z.cast(b, leap_rule="next").life_branch == "亥"
    early = BirthInput(birth_date="2023-03-25", birth_time="10:00", gender="female", longitude=121.5)  # 閏二月初四
    assert Z.cast(early, leap_rule="split").life_branch == Z.cast(early, leap_rule="same").life_branch


def test_chart_facts_have_stable_ids(mei):
    c = ziwei_chart(mei)
    ids = c.fact_ids()
    for must in ("ziwei.life_palace", "ziwei.five_class", "ziwei.palace.命宮", "ziwei.palace.夫妻宮", "ziwei.hua.化忌", "ziwei.daxian.current"):
        assert must in ids
    assert c.fact("ziwei.soul_star").value == "巨門"


def test_palace_stems_for_zi_chou_use_wuhu_dun_correctly(mei):
    # 庚年五虎遁：寅戊…亥丁、子戊、丑己（子丑在寅之前，位移要先對 12 取模）
    z = Z.cast(mei)
    stems = {p.branch: p.stem for p in z.palaces}
    assert stems["寅"] == "戊" and stems["亥"] == "丁" and stems["子"] == "戊" and stems["丑"] == "己"


# 來因宮：宮干＝生年天干。十個年干各落在固定的地支（甲戌 乙酉 丙申 丁未 戊午 己巳 庚辰 辛卯 壬寅 癸亥）；
# 辛年卯、丑同為辛干，壬年寅、子同為壬干，子丑不取
@pytest.mark.parametrize("year,gz", [(1984, "甲戌"), (1985, "乙酉"), (1986, "丙申"), (1987, "丁未"), (1988, "戊午"),
                                     (1989, "己巳"), (1990, "庚辰"), (1991, "辛卯"), (1992, "壬寅"), (1993, "癸亥")])
def test_laiyin_palace_by_year_stem(year, gz):
    z = Z.cast(BirthInput(birth_date=f"{year}-08-15", birth_time="10:00", gender="female", longitude=121.5))
    laiyin = [p for p in z.palaces if p.is_laiyin]
    assert len(laiyin) == 1 and laiyin[0].stem + laiyin[0].branch == gz and z.laiyin_branch == gz[1]
    assert laiyin[0].stem == z.lunar["year_gz"][0]


def test_laiyin_skips_zi_chou():
    for year, skipped in ((1991, "丑"), (1992, "子")):            # 辛年丑宮、壬年子宮的宮干也等於年干，但不算
        z = Z.cast(BirthInput(birth_date=f"{year}-08-15", birth_time="10:00", gender="male", longitude=121.5))
        same = {p.branch for p in z.palaces if p.stem == z.lunar["year_gz"][0]}
        assert skipped in same and not next(p for p in z.palaces if p.branch == skipped).is_laiyin


def test_laiyin_fact_and_payload(mei):
    c = ziwei_chart(mei)
    f = c.fact("ziwei.laiyin_palace")
    assert f.value == "在交友宮（庚辰）" and "子、丑" in f.how
    assert c.payload["laiyin_branch"] == "辰"
    assert [p["branch"] for p in c.payload["palaces"] if p["is_laiyin"]] == ["辰"]


def test_laiyin_card_is_loaded_and_selected(mei):
    from fortune.knowledge.store import load_cards, select_cards
    cards = load_cards()
    card = cards["gong.laiyin"]
    assert card.system == "ziwei" and "來因宮" in card.keywords
    assert {"意義", "正面", "負面", "常見組合", "出處"} <= set(card.sections) and "子、丑" in card.sections["意義"]
    assert sum(c.system in ("bazi", "ziwei") for c in cards.values()) == 86     # 投影片 2-3、5-1 講的張數
    picked = [c.id for c in select_cards(ziwei_chart(mei))]
    assert "gong.laiyin" in picked and "gong.jiaoyou" in picked            # 小美的來因宮在交友宮，交友宮的卡也一起挑


def test_five_class_when_life_palace_in_zi():
    # 1990-06-15 午時：命宮在子 → 庚年子宮為戊子 → 納音霹靂火 → 火六局
    z = Z.cast(BirthInput(birth_date="1990-06-15", birth_time="12:00", gender="female", use_true_solar_time=False))
    assert z.life_branch == "子" and z.palace("命宮").stem == "戊" and z.five_class == "火六局"


def test_daxian_before_first_limit_is_not_missing_gender():
    c = ziwei_chart(BirthInput(birth_date="2026-10-08", birth_time="15:57", gender="male", longitude=121.5))
    v = c.fact("ziwei.daxian.current").value
    assert v.startswith("尚未起大限") and "性別" not in v


def test_ziwei_current_year_uses_lunar_new_year(mei):
    from datetime import date
    before = ziwei_chart(mei, today=date(2027, 1, 20))     # 2027 春節是 2/6
    assert any(f.id == "ziwei.liunian.2026" and "今年" in f.note for f in before.facts)
    after = ziwei_chart(mei, today=date(2027, 2, 10))
    assert any(f.id == "ziwei.liunian.2027" and "今年" in f.note for f in after.facts)
