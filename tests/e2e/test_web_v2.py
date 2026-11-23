"""第二批面板的 e2e（離線模式）：流派、出生地補齊、旺衰 v2、黃曆、紫微大限→流年、同盤三次、今日用量、自帶金鑰、一頁式報告。"""

import importlib.util

import pytest

from tests.e2e.conftest import cast, fill_birth

pytestmark = pytest.mark.usefixtures("server")


def test_school_panel_switch_changes_day_pillar(page):
    cast(page, d="2000-01-07", t="23:30", g="male")
    assert "乙丑" in page.locator("#chart-area").inner_text()            # 課程預設：晚子時換日
    page.locator("#school-panel").evaluate("el => el.open = true")
    page.locator("#school-panel select").first.select_option("clock-time")
    page.wait_for_timeout(300)
    page.locator("#birth-panel").evaluate("el => el.open = true")     # 排盤後面板會收合，排盤鍵藏起來
    page.click("#cast-btn"); page.wait_for_timeout(1500)
    area = page.locator("#chart-area").inner_text()
    assert "甲子" in area and "手錶時間派" in area
    assert page.locator("#chart-area .school-mark").count() >= 1       # 受流派影響的格有「派」角標
    page.locator("#school-panel select").first.select_option("default"); page.wait_for_timeout(300)


def test_geo_autofill_with_taiwan_dst(page):
    page.locator("#birth-panel").evaluate("el => el.open = true")
    fill_birth(page, d="1975-07-01", t="10:00", g="female", place="台北")
    f = page.locator("#birth-form")
    assert f.locator("[name=tz_offset_hours]").input_value() == "9"
    assert f.locator("[name=longitude]").input_value().startswith("121.5")
    assert "日光節約" in f.locator(".geo-note").first.inner_text()
    page.click("#cast-btn"); page.wait_for_timeout(1500)
    assert "真太陽時" in page.locator("#chart-area").inner_text()


def hour_pillar(page) -> str:
    """時柱那一格的干支（畫面上天干、地支分兩行）。"""
    return "".join(page.locator("#chart-area .pillars .pillar", has_text="時柱").first.inner_text().split())


def test_dst_checkbox_under_birthplace(page):
    # 台北 1975 夏天：出生地下面出現勾選框（預設勾、時區 9）；取消＝證件時間已是標準時（時區 8）
    page.locator("#birth-panel").evaluate("el => el.open = true")
    fill_birth(page, d="1975-07-15", t="15:30", g="male", place="台北")
    f = page.locator("#birth-form")
    box, tz = f.locator("[name=dst]"), f.locator("[name=tz_offset_hours]")
    assert f.locator(".dst-check").is_visible() and box.is_checked() and tz.input_value() == "9"
    box.uncheck(); assert tz.input_value() == "8"
    box.check(); assert tz.input_value() == "9"

    # 手錶時間派（不換算真太陽時）：勾著 → 先扣回標準時 14:30 → 未時；不勾 → 15:30 照讀 → 申時
    page.locator("#school-panel").evaluate("el => el.open = true")
    page.locator("#school-panel select").first.select_option("clock-time"); page.wait_for_timeout(300)
    page.locator("#birth-panel").evaluate("el => el.open = true")
    page.click("#cast-btn"); page.wait_for_timeout(1500)
    assert "丁未" in hour_pillar(page)
    page.locator("#birth-panel").evaluate("el => el.open = true")
    box.uncheck(); page.click("#cast-btn"); page.wait_for_timeout(1500)
    assert "戊申" in hour_pillar(page)
    page.locator("#school-panel select").first.select_option("default"); page.wait_for_timeout(300)

    # 自己改時區：以填的為準，勾選框收起來；換一個不是日光節約年份的日期再查，也不會出現
    page.locator("#birth-panel").evaluate("el => el.open = true")
    box.check(); tz.fill("9")
    assert not f.locator(".dst-check").is_visible()
    fill_birth(page, d="1990-06-15", t="14:30", g="female", place="台北")
    assert not f.locator(".dst-check").is_visible() and tz.input_value() == "8"


def test_strength_v2_panel_and_almanac(page):
    cast(page, place="台北")
    area = page.locator("#chart-area")
    area.get_by_text("旺衰", exact=False).first.click()
    page.wait_for_timeout(300)
    txt = area.inner_text()
    assert "用神" in txt and "調候" in txt and "格局" in txt and "v2" in txt
    if importlib.util.find_spec("lunar_python"):          # 黃曆要裝 oracles（lunar-python）才有
        assert "黃曆" in txt and "宜" in txt
    for simp in "开关发医":
        assert simp not in txt


def test_ziwei_luck_panel_and_brightness(page):
    cast(page, place="台北")
    page.locator("#chart-system-seg [data-system=ziwei]").click(); page.wait_for_timeout(600)
    area = page.locator("#chart-area")
    assert area.locator(".dx-row").count() >= 1
    chips = area.locator(".dx-row button, .dx-row [role=button], .dx-row > *")
    assert chips.count() >= 12
    assert area.locator(".ln-area").count() >= 1
    txt = area.inner_text()
    assert "大限" in txt and "流年" in txt and ("流祿" in txt or "太歲" in txt)
    assert "長生" in txt or "沐浴" in txt                                 # 十二長生標籤
    marks = area.locator(".palace .laiyin-mark")                          # 來因宮：庚年在辰，小美的交友宮
    assert marks.count() == 1 and "交友宮" in marks.locator("xpath=ancestor::div[contains(@class,'palace')][1]").inner_text()
    assert "來因宮" in area.locator(".ziwei-center").inner_text()
    life = area.locator(".palace.life")                                   # 命宮丁亥：巨門自化忌，又收到遷移宮辛干化入的巨門祿、文曲科
    assert "自忌" in life.inner_text() and "入祿" in life.inner_text() and "入科" in life.inner_text()
    assert area.locator(".palace .zihua:not(.in)").count() == 5 and area.locator(".palace .zihua.in").count() == 3
    legend = area.locator(".ziwei-legend")                                 # 標示說明：分各派通用／三合派／飛星派
    assert [t.split("\n")[0] for t in legend.locator(".zl-row > b").all_inner_texts()] == ["各派通用", "三合派", "飛星派", "流派設定"]
    assert "來因宮" in legend.locator(".zl-row.feixing").inner_text() and "自化" in legend.locator(".zl-row.feixing").inner_text()


def test_consistency_button(page):
    cast(page)
    page.click("[data-tab=reading]")
    page.click("#consistency-btn"); page.wait_for_timeout(4000)
    txt = page.locator("#consistency-area").inner_text()
    assert "同一張盤問三次" in txt and "總論" in txt and "流年" in txt


def test_usage_dialog(page):
    page.click("#usage-link"); page.wait_for_timeout(800)
    dlg = page.locator("#card-dialog")
    assert dlg.evaluate("el => el.open")
    assert "今日" in dlg.inner_text() or "次數" in dlg.inner_text()
    page.keyboard.press("Escape")


def test_byok_panel_rejects_bad_endpoint(page, server):
    page.locator("#llm-panel").evaluate("el => el.open = true")
    page.locator("#llm-panel input[type=radio]").nth(1).check()
    page.locator("#llm-panel select").first.select_option("openai_compatible")
    page.wait_for_timeout(200)
    base = page.locator("#llm-panel input[name=base_url], #llm-panel input[placeholder*='http']").first
    base.fill(server + "/api")                                        # 本機假端點：沒有 /models → 失敗訊息
    page.get_by_role("button", name="驗證並載入模型").click(); page.wait_for_timeout(2500)
    assert "自帶" in page.locator("#ai-status").inner_text()
    page.locator("#llm-panel input[type=radio]").nth(0).check(); page.wait_for_timeout(500)
    assert "離線" in page.locator("#ai-status").inner_text()


def test_report_page_renders_both_systems(page, server):
    page.goto(server + "/report.html?name=小美&birth_date=1990-06-15&birth_time=14:30&gender=female&place=台北")
    page.wait_for_timeout(6000)
    txt = page.inner_text("body")
    for t in ("八字", "紫微", "總論", "流年", "依據", "本報告"):
        assert t in txt, t
    assert "辛" in txt and "巨門" in txt
    page.goto(server + "/")


def test_pillar_order_switch(page, server):
    """四柱排列：切到「時日月年」整排左右倒過來（四柱加列表也是）、大運由右往左，重新整理、報告頁都記得；切回來恢復。"""
    cast(page)
    names = lambda: page.locator("#chart-area .pillars .pname").all_inner_texts()   # noqa: E731
    heads = lambda: page.locator("#chart-area .pillar-ext thead th").all_inner_texts()[1:]   # noqa: E731
    # 第一步大運在最後一步的右邊＝由右往左（大運列、大運×流年表）
    rtl = lambda sel: page.locator(sel).evaluate_all("xs => xs[0].getBoundingClientRect().left > xs[xs.length - 1].getBoundingClientRect().left")   # noqa: E731
    assert names() == ["年柱", "月柱", "日柱", "時柱"] and heads() == ["年", "月", "日", "時"]
    rows = ("#chart-area .dayun-row .dayun", "#chart-area .dl-table thead th", "#chart-area .liunian-row .liunian", "#chart-area .liuyue .ly")
    assert not any(rtl(s) for s in rows)
    page.locator("#chart-area .pillar-order button", has_text="時日月年").click()
    assert names() == ["時柱", "日柱", "月柱", "年柱"] and heads() == ["時", "日", "月", "年"]
    assert all(rtl(s) for s in rows)
    page.reload(); cast(page)
    assert names()[0] == "時柱"
    page.goto(server + "/report.html?name=小美&birth_date=1990-06-15&birth_time=14:30&gender=female")
    page.wait_for_selector("#report .pillars")
    assert page.locator("#report .pillars .pname").all_inner_texts()[0] == "時柱" and rtl("#report .dayun-row .dayun")
    page.goto(server + "/"); cast(page)
    page.locator("#chart-area .pillar-order button", has_text="年月日時").click()
    assert names()[0] == "年柱"


def test_no_console_errors_v2(page):
    assert page.errors == [], page.errors  # type: ignore[attr-defined]


def test_chat_session_line_delete(page):
    cast(page)
    page.click("[data-tab=chat]")
    page.locator("#chat-form [name=message]").fill("我的日主是什麼？")
    page.click("#chat-btn"); page.wait_for_timeout(1500)
    win = page.locator("#chat-window")
    assert "session" in win.inner_text()
    win.get_by_role("button", name="刪除我的資料").click(); page.wait_for_timeout(800)
    assert "已刪除" in win.inner_text()
