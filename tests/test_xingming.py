"""姓名學（熊崎式五格）：康熙筆畫、五格、流派開關、八字連動、解讀與查核、API。五格的標準命例在 cases/standard_cases.yaml。"""

from datetime import date

import pytest
from fastapi.testclient import TestClient

from fortune.birth import BirthInput
from fortune.chart import cast
from fortune.reading.checks import chart_check, citation_check
from fortune.reading.report import Reading, Section, make_reading
from fortune.reading.sections import SECTIONS, directions, sections_for
from fortune.school import resolve
from fortune.xingming.engine import NameInputError, Rules, analyze, char_strokes, element_of, split_name

TODAY = date(2026, 10, 8)

# 康熙筆畫（部首還原原形）：常見姓氏與名字用字，逐字手算對照。
# 「戴」不收：Unihan 歸戈部 13 畫＝17，坊間姓名學表有寫 18 的，有爭議。
KANGXI = dict(
    陳=16, 林=8, 黃=12, 張=11, 李=7, 王=4, 吳=7, 劉=15, 蔡=17, 楊=13, 許=11, 鄭=19, 謝=17, 洪=10, 郭=15, 邱=12,
    曾=12, 廖=14, 賴=16, 徐=10, 周=8, 葉=15, 蘇=22, 莊=13, 呂=7, 江=7, 何=7, 蕭=18, 羅=20, 高=10, 潘=16, 簡=18,
    朱=6, 鍾=17, 彭=12, 游=13, 詹=13, 胡=11, 施=9, 沈=8, 余=7, 盧=16, 梁=11, 趙=14, 顏=18, 柯=9, 翁=10, 魏=18,
    孫=10, 范=11, 方=4, 宋=7, 鄧=19, 杜=7, 傅=12, 侯=9, 曹=11, 薛=19, 丁=2, 卓=8, 馬=10, 阮=12, 董=15, 唐=10,
    藍=20, 蔣=17, 石=5, 古=5, 紀=9, 姚=9, 連=14, 馮=12, 歐=15, 程=12, 湯=13, 田=5, 康=11, 姜=9, 白=5, 汪=8,
    鄒=17, 尤=4, 巫=7, 鐘=20, 黎=15, 龔=22, 嚴=20, 韓=17, 袁=10, 金=8, 童=12, 陸=16, 夏=10, 柳=9, 邵=12, 錢=16,
    伍=6, 倪=10, 溫=14, 于=3, 譚=19, 駱=16, 熊=14, 任=6, 甘=5, 秦=10, 顧=21, 毛=4,
    美=9, 華=14, 文=4, 明=8, 志=7, 偉=11, 怡=9, 婷=12, 雅=12, 俊=9, 宏=7, 家=10, 豪=14, 傑=12, 欣=8, 宇=6,
    翔=12, 淑=12, 芬=10, 玲=10, 珍=10, 建=9, 國=11, 榮=14, 嘉=14, 慧=15, 惠=12, 秀=7, 英=11, 麗=19, 玉=5,
    蘭=23, 春=9, 雲=12, 鳳=14, 蓮=17, 德=15, 龍=16, 博=12, 浩=11, 清=12, 海=11, 思=9, 琪=13, 瑜=14, 涵=12,
    安=6, 心=4, 恩=10, 承=8, 祐=10, 福=14, 禎=14, 振=11, 哲=10,
)


@pytest.mark.parametrize("ch,want", sorted(KANGXI.items()))
def test_kangxi_strokes(ch, want):
    assert char_strokes(ch, "名", Rules())[0].strokes == want


def test_radical_restoration_is_explained():
    info, _ = char_strokes("陳", "姓", Rules())
    assert "阜" in info.how and "170.8" in info.how and info.modern == 10


def test_modern_and_numeral_switches():
    assert char_strokes("陳", "姓", Rules(stroke_basis="modern"))[0].strokes == 10
    assert char_strokes("四", "名", Rules())[0].strokes == 4
    assert char_strokes("四", "名", Rules(numeral_strokes="shape"))[0].strokes == 5
    assert char_strokes("九", "名", Rules())[0].strokes == 9


def test_simplified_input_uses_traditional_form():
    info, warnings = char_strokes("张", "姓", Rules())
    assert info.strokes == 11 and info.traditional == "張" and warnings


def test_split_name():
    assert split_name("陳美玲")[:2] == ("陳", "美玲")
    assert split_name("歐陽娜娜")[:2] == ("歐陽", "娜娜")
    assert split_name("陳林 美玲")[:2] == ("陳林", "美玲")          # 冠夫姓用空白
    assert split_name("張簡")[:2] == ("張", "簡")                    # 只有兩個字不當複姓
    for bad in ("", "陳", "Amy Chen"):
        with pytest.raises(NameInputError):
            analyze(bad)


def test_number_cycle_and_element():
    assert [element_of(n) for n in (1, 2, 3, 4, 5, 6, 7, 8, 9, 10)] == ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"]
    from fortune.xingming.engine import _grid
    g = _grid("總格", 85, "測")
    assert g.shuli == 5 and g.element == "土"


def _birth(name="陳美玲"):
    return BirthInput(full_name=name, birth_date="1990-06-15", birth_time="14:30", gender="female", longitude=121.5)


def test_chart_facts_and_alternatives():
    c = cast("xingming", _birth(), today=TODAY)
    f = {x.id: x for x in c.facts}
    assert f["xingming.ge.ren"].value == "25・土・吉"
    assert f["xingming.bazi.favourable"].value == "土、金"          # 同一張八字盤的喜用（test_bazi 的標準命例：身弱）
    assert f["xingming.bazi.link"].value == "人格土：喜用"
    alts = {a["switch"] for a in f["xingming.ge.ren"].alternatives}
    assert "xingming.stroke_basis" in alts                          # 換現代筆畫，人格會變


def test_school_override():
    sch = resolve(None, {"xingming": {"jiashu": "off"}})
    c = cast("xingming", _birth(), school=sch, today=TODAY)
    assert c.fact("xingming.ge.tian").value.startswith("16")
    assert c.school["settings"]["xingming"]["jiashu"] == "off"


def test_sections_and_directions():
    c = cast("xingming", _birth(), today=TODAY)
    dirs = directions(c)
    assert [d.key for d in dirs] == [k for k, _ in SECTIONS]
    assert dict(sections_for("xingming"))["year"] == "八字配合"
    assert {d.key: d.direction for d in dirs} == {"overview": "吉", "personality": "平", "career": "吉",
                                                    "love": "凶", "wealth": "吉", "year": "吉"}


def test_offline_reading_passes_checks():
    r, chart = make_reading("xingming", _birth(), today=TODAY)
    assert [s.title for s in r.sections][-1] == "八字配合"
    assert all(s.evidence and s.cards for s in r.sections)
    assert r.checks["passed"], r.checks


def _reading_with(chart, text):
    secs = [Section(key=k, title=t, text=text if k == "overview" else "略。", evidence=["xingming.ge.ren"])
            for k, t in sections_for("xingming")]
    return Reading(system="xingming", system_zh="姓名學", subject=chart.subject, persona="測", sections=secs, disclaimer="")


def test_chart_check_catches_wrong_numbers():
    c = cast("xingming", _birth(), today=TODAY)
    assert chart_check(_reading_with(c, "你的人格 25，屬土，數理吉。陳 16 畫。三才金土水。"), c)["ok"]
    for bad, rule in (("你的人格是 23，主運平穩。", "人格是 25"), ("人格屬木，個性溫和。", "人格五行是土"),
                      ("「陳」字 10 畫。", "「陳」是 16 畫"), ("三才配置是金土火。", "三才是金土水")):
        res = chart_check(_reading_with(c, bad), c)
        assert not res["ok"] and rule in res["issues"][0]["rule"], bad


def test_citation_check_knows_xingming_cards():
    c = cast("xingming", _birth(), today=TODAY)
    r = _reading_with(c, "略。")
    r.sections[0].cards = ["wuge.ren", "shuli.ji", "wuge.nonexistent"]
    issues = citation_check(r, c)["issues"]
    assert [i["item"] for i in issues] == ["wuge.nonexistent"]


@pytest.fixture
def client():
    from fortune.api import limits
    from fortune.api.main import app
    limits._state.update({"day": "", "per_ip": {}, "total": 0, "cost_usd": 0.0})
    return TestClient(app)


def test_api(client):
    birth = {"full_name": "陳美玲", "birth_date": "1990-06-15", "birth_time": "14:30", "gender": "female", "longitude": 121.5}
    r = client.post("/api/cast/all", json={"birth": birth}).json()
    assert r["xingming"]["payload"]["sancai"] == "金土水" and r["xingming_error"] is None
    r = client.post("/api/cast/all", json={"birth": {**birth, "full_name": None}}).json()
    assert r["xingming"] is None
    r = client.post("/api/cast/all", json={"birth": {**birth, "full_name": "Amy"}}).json()
    assert r["xingming"] is None and r["xingming_error"]
    r = client.post("/api/reading", json={"system": "xingming", "birth": {**birth, "full_name": None}})
    assert r.status_code == 422 and r.json()["error"] == "needs_full_name"
    r = client.post("/api/reading", json={"system": "xingming", "birth": birth})
    assert r.status_code == 200 and r.json()["sections"][-1]["title"] == "八字配合"
    r = client.post("/api/cast", json={"system": "xingming", "birth": {**birth, "full_name": "陳a"}})
    assert r.status_code == 422 and r.json()["error"] == "bad_name"
    assert "xingming" in client.get("/api/schools").json()["schema"]


def test_telegram_bot_xingming(monkeypatch):
    from fortune.api import limits
    from fortune.bot import telegram as tg
    limits._state.update({"day": "", "per_ip": {}, "total": 0, "cost_usd": 0.0})
    assert "已記下" in tg.handle(99, "/birth 1990-06-15 14:30 女")
    assert "姓名學需要完整姓名" in tg.handle(99, "/reading xingming")      # 沒姓名：提示、不扣次數
    assert "用法" in tg.handle(99, "/reading tarot")
    assert limits._state["per_ip"].get("tg:99", 0) == 0
    assert "已記下" in tg.handle(99, "/birth 1990-06-15 14:30 女 陳美玲")
    assert "人格25" in tg.handle(99, "/chart") and "三才金土水" in tg.handle(99, "/chart")
    assert "【八字配合" in tg.handle(99, "/reading xingming")
    tg.handle(99, "/forget")
