"""解讀流程與四種查核（第 5、6 章）— 全部離線跑。"""

from datetime import date

from fortune.birth import BirthInput
from fortune.chart import cast
from fortune.reading.checks import boundary_check, chart_check, citation_check
from fortune.reading.consistency import consistency_report
from fortune.reading.report import Reading, Section, make_reading, parse_sections
from fortune.reading.sections import SECTIONS, directions

TODAY = date(2026, 10, 8)


def test_offline_reading_has_six_sections_with_evidence(mei):
    for system in ("bazi", "ziwei"):
        r, chart = make_reading(system, mei, today=TODAY)
        assert [s.key for s in r.sections] == [k for k, _ in SECTIONS]
        assert all(s.evidence for s in r.sections), system
        assert all(e in chart.fact_ids() for s in r.sections for e in s.evidence)
        assert r.checks["passed"], r.checks


def test_direction_is_rule_based_and_stable(mei):
    c = cast("bazi", mei, today=TODAY)
    d1, d2 = directions(c), directions(c)
    assert [x.direction for x in d1] == [x.direction for x in d2]
    assert all(x.reason for x in d1)


def test_parse_sections_fills_missing():
    c = cast("bazi", BirthInput(birth_date="1990-06-15", birth_time="14:30", gender="female"), today=TODAY)
    text = "## 總論\n方向：平\n日主辛金。\n依據：bazi.day_master\n知識卡：無\n"
    secs = parse_sections(text, directions(c))
    assert len(secs) == 6 and secs[0].evidence == ["bazi.day_master"] and "缺漏" in secs[1].text


def _reading_with(chart, text, evidence=("bazi.day_master",), cards=()):
    secs = [Section(key=k, title=t, text=text if k == "overview" else "略。", evidence=list(evidence), cards=list(cards)) for k, t in SECTIONS]
    return Reading(system=chart.system, system_zh=chart.system_zh, subject=chart.subject, persona="測", sections=secs, disclaimer="")


def test_chart_check_catches_wrong_ten_god(mei):
    c = cast("bazi", mei, today=TODAY)            # 命中沒有正官
    bad = _reading_with(c, "你的月柱是正官，所以適合公職。")
    res = chart_check(bad, c)
    assert not res["ok"] and any("正官" in i["rule"] for i in res["issues"])
    ok = _reading_with(c, "命中未出現正官，官星以七殺呈現。")
    assert chart_check(ok, c)["ok"]
    # 真實模型寫法：否定句與解釋句都不該被當成「宣稱盤上有」
    for sent in ["盤面上七殺、偏印、傷官都出現，正官與正印則不在命中。",
                 "女命傳統上看官星，也就是正官與七殺。",
                 "正官並未出現，所以官星以七殺的形式呈現。",
                 "知識卡提到「正官配印」，但你的盤裡正印落空。"]:
        assert chart_check(_reading_with(c, sent), c)["ok"], sent
    assert not chart_check(_reading_with(c, "你的日柱坐正官，配偶宮穩定。"), c)["ok"]
    # 大運帶來的十神：同一段前面講了大運，下一句接著論那個十神，不算錯（Gemini 常這樣寫）
    ok2 = _reading_with(c, "目前走戊寅大運，天干戊土為正印。正印屬土，對日主辛金是滋養與支持的能量。")
    assert chart_check(ok2, c)["ok"]
    ok3 = _reading_with(c, "正官沒有出現在盤上，所以沒有傷官見官那種與體制硬碰的組合。")
    assert chart_check(ok3, c)["ok"]


def test_chart_check_allows_school_alternatives(mei):
    z = cast("ziwei", mei, today=TODAY)        # 庚年：預設太陰化科／天同化忌，另一派天府化科／天相化忌
    r = _reading_with(z, "本盤依課程預設，庚干採太陰化科；另一派會是天府化科落在子女宮。", evidence=("ziwei.hua.化科",))
    assert chart_check(r, z)["ok"]
    r2 = _reading_with(z, "本盤依課程預設，庚干化忌採天同；另一派會是天相化忌落在父母宮。", evidence=("ziwei.hua.化忌",))
    assert chart_check(r2, z)["ok"]
    bad = _reading_with(z, "你的命宮有天相化忌。", evidence=("ziwei.hua.化忌",))
    assert not chart_check(bad, z)["ok"]


def test_chart_check_catches_wrong_ganzhi_and_palace_star(mei):
    c = cast("bazi", mei, today=TODAY)
    assert not chart_check(_reading_with(c, "日柱甲子，坐下食神。"), c)["ok"]
    z = cast("ziwei", mei, today=TODAY)
    bad = _reading_with(z, "夫妻宮有紫微坐守。", evidence=("ziwei.palace.夫妻宮",))
    assert not chart_check(bad, z)["ok"]
    good = _reading_with(z, "夫妻宮太陰化科，擎羊同宮。", evidence=("ziwei.palace.夫妻宮",))
    assert chart_check(good, z)["ok"]
    # 真實模型寫法：流年命宮落在某宮，後面接流年四化的星，不該被當成那一宮的星
    real = _reading_with(z, "2026 流年命宮落在本命疾厄宮，位置在午，主星破軍，同宮有右弼與地劫，流年四化是丙干：天同化祿、天機化權、文昌化科、廉貞化忌。",
                         evidence=("ziwei.liunian.2026",))
    assert chart_check(real, z)["ok"], chart_check(real, z)["issues"]


def test_citation_check_catches_fake_ids(mei):
    c = cast("bazi", mei, today=TODAY)
    bad = _reading_with(c, "略。", evidence=("bazi.nope",), cards=("shishen.not_a_card",))
    res = citation_check(bad, c)
    rules = {i["rule"] for i in res["issues"]}
    assert "引用的事實 id 不存在" in rules and "引用的知識卡不存在" in rules
    empty = _reading_with(c, "略。", evidence=())
    assert any(i["rule"] == "本段沒有任何依據" for i in citation_check(empty, c)["issues"])


def test_boundary_check(mei):
    c = cast("bazi", mei, today=TODAY)
    bad = _reading_with(c, "明年適合買股票，而且保證準。你可能會得肝病。")
    res = boundary_check(bad, c)
    topics = {i["rule"].split("（")[0] for i in res["issues"]}
    assert {"投資", "保證準確"} <= topics or {"投資", "醫療"} <= topics
    ok = _reading_with(c, "這裡不談投資標的，只談理財性格。")
    assert boundary_check(ok, c)["ok"]


def test_consistency_offline_is_perfect(mei):
    rep = consistency_report("bazi", mei, runs=3, today=TODAY)
    assert rep["ok"] and rep["worst_score"] == 1.0
