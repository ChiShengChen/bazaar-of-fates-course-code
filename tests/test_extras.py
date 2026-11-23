"""詳細盤面（納音、空亡、胎元、命宮、十二長生、神煞、關係、大運流年、流月、稱骨）。
標準答案：周易大學堂排盤（2026-10-08 15:57 男）中與月柱無關的格子，以及人工查表。"""

import pytest
from datetime import date

from fortune.bazi import extras as X
from fortune.birth import BirthInput
from fortune.chart import bazi_chart

AAA = BirthInput(name="aaa", birth_date="2026-10-08", birth_time="15:57", gender="male", longitude=121.5)


def test_nayin_and_kongwang_tables():
    assert X.nayin("甲", "子") == "海中金" and X.nayin("丙", "午") == "天河水" and X.nayin("乙", "卯") == "大溪水" and X.nayin("甲", "申") == "泉中水"
    assert X.nayin("戊", "子") == "霹靂火" and X.nayin("庚", "子") == "壁上土" and X.nayin("癸", "亥") == "大海水"
    assert X.kongwang("甲", "子") == "戌亥" and X.kongwang("丙", "午") == "寅卯" and X.kongwang("丁", "酉") == "辰巳"
    assert X.kongwang("乙", "卯") == "子丑" and X.kongwang("甲", "申") == "午未"


def test_taiyuan_minggong_match_zydx_for_their_month():
    # 周易大學堂以丁酉月排出胎元戊子、命宮庚子；同樣的月柱我們得到一樣的結果
    assert X.taiyuan("丁", "酉") == ("戊子", "霹靂火")
    assert X.minggong("丙", "酉", "申") == ("庚子", "壁上土")


def test_changsheng_yin_stem_counts_backwards():
    for b, want in [("午", "長生"), ("巳", "沐浴"), ("辰", "冠帶"), ("卯", "臨官"), ("寅", "帝旺"), ("丑", "衰"), ("子", "病"), ("亥", "死"), ("戌", "墓"), ("酉", "絕"), ("申", "胎"), ("未", "養")]:
        assert X.changsheng("乙", b) == want, b
    assert X.changsheng("甲", "亥") == "長生" and X.changsheng("甲", "卯") == "帝旺" and X.changsheng("庚", "酉") == "帝旺"


def test_shensha_matches_zydx_on_month_independent_items():
    c = bazi_chart(AAA, today=date(2026, 10, 8))
    got = {(x["name"], x["where"]) for x in c.payload["shensha"]}
    for item in [("將星", "年支午"), ("將星", "日支卯"), ("文昌貴人", "年支午"), ("文昌貴人", "時支申"), ("天廚貴人", "年支午"),
                 ("太極貴人", "年支午"), ("太極貴人", "日支卯"), ("天乙貴人", "時支申"), ("祿神", "日支卯"), ("桃花", "日支卯"),
                 ("天喜", "日支卯"), ("驛馬", "時支申"), ("劫煞", "時支申"), ("孤辰", "時支申"), ("四廢", "日柱乙卯")]:
        assert item in got, item
    assert ("羊刃", "日支卯") not in got            # 乙的羊刃在辰


def test_relations_and_chenggu():
    c = bazi_chart(AAA, today=date(2026, 10, 8))
    texts = [r["text"] for r in c.payload["relations"]]
    assert any("卯與時支申暗合" in t for t in texts) and any("午與日支卯相破" in t for t in texts)
    cg = c.payload["chenggu"]
    assert cg["text"] == "四兩四錢" and cg["parts"] == {"year": 13, "month": 15, "day": 8, "hour": 8}
    assert cg["verse"].startswith("來事由天莫苦求")
    assert c.payload["lunar"]["text"] == "丙午年（馬）八月廿八 申時"


def test_qiyun_dayun_liunian_grid_and_liuyue():
    c = bazi_chart(AAA, today=date(2026, 10, 8))
    q = c.payload["qiyun"]
    assert q["forward"] and (q["years"], q["months"], q["days"]) == (10, 0, 9) and q["jiaoyun"].startswith("2036-10-18")
    d0 = c.payload["dayun"][0]
    assert d0["gz"] == "己亥" and d0["changsheng"] == "死" and d0["liunian"][0] == {"year": 2036, "gz": "丙辰", "stem_god": "傷官", "branch_god": "正財"}
    assert len(d0["liunian"]) == 10
    months = c.payload["liuyue"]["months"]
    assert [m["gz"] for m in months[:3]] == ["庚寅", "辛卯", "壬辰"] and months[0]["term"] == "立春"


def test_qiyun_converts_three_days_to_a_year_step_by_step():
    # 小美：逆行數回芒種 06-06 06:46，相差 9 天 7 時 43 分；三天一年、一天四月、一時辰十天逐級換算後照日曆加上去
    # （lunar-python 第二種算法：3 年 1 月 8 天 16 時，1993-07-24 06:30；差的一小時來自節氣時刻它只取到分鐘）
    c = bazi_chart(BirthInput(birth_date="1990-06-15", birth_time="14:30", gender="female"), today=date(2026, 11, 23))
    q = c.payload["qiyun"]
    assert not q["forward"] and (q["years"], q["months"], q["days"], q["hours"]) == (3, 1, 8, 15)
    assert q["jiaoyun"].startswith("1993-07-24T05") and q["start_age"] == 3.1
    assert [(d["gz"], d["start_date"]) for d in c.payload["dayun"][:2]] == [("辛巳", "1993-07-24"), ("庚辰", "2003-07-24")]


def test_add_months_clamps_to_month_end():
    from datetime import datetime
    from fortune.bazi.engine import add_months
    assert add_months(datetime(1996, 2, 29, 8), 120) == datetime(2006, 2, 28, 8)     # 交運在閏日，十年後那年沒有 2/29
    assert add_months(datetime(2023, 1, 31), 1) == datetime(2023, 2, 28)
    assert add_months(datetime(2023, 11, 15), 14) == datetime(2025, 1, 15)


def test_relations_three_way():
    rel = X.relations([("年", "丙", "申"), ("月", "戊", "子"), ("日", "乙", "辰"), ("大運", "己", "亥")])
    assert any("三合水局" in r["text"] for r in rel)
    rel = X.relations([("年", "甲", "寅"), ("月", "乙", "卯"), ("日", "丙", "辰")])
    assert any("三會東方木" in r["text"] for r in rel)


def test_no_hour_still_builds():
    c = bazi_chart(BirthInput(birth_date="1990-06-15", gender="female"))
    assert c.payload["minggong"] is None and "hour" not in [p["name"] for p in c.payload["pillars"]]
    assert c.payload["chenggu"]["parts"]["hour"] == 0


def test_almanac_is_traditional_chinese():
    pytest.importorskip("lunar_python")
    from fortune.bazi.almanac import build
    from fortune.bazi.almanac_zh_tw import tw
    a = build(date(1975, 7, 1), 10)
    assert a and a["zhixing"] == "滿" and "開光" in tw(["开光"])
    text = " ".join([a["xiu"], a["zhixing"], *a["pengzu"], *a["day_yi"], *a["day_ji"], *a["jishen"], *a["xiongsha"], *a["positions"].values()])
    for simp in "开关门发财进医尝风厨门闭丧阴阳杀":        # 常見簡體字不該出現
        assert simp not in text, (simp, text)
    # 命理專用字不可被一般用語轉換
    assert tw("丑") == "丑" and tw("斗") == "斗" and tw("阴阳击冲") == "陰陽擊沖" and tw("蛰虫咸俯") == "蟄蟲咸俯" and tw("占门床") == "占門床"
