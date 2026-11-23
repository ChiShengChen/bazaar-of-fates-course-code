"""網頁端對端：事業流年（10-5）。解讀分頁選「事業流年」→ 年份欄 → 四段；同盤問三次；一頁式報告。離線模式，不花錢。"""

import datetime as dt

import pytest

from tests.e2e.conftest import cast

pytestmark = pytest.mark.usefixtures("server")
CAREER_TITLES = ["年度總覽", "事業走勢", "可以把握的", "要留意的"]


def _career(page, year="2027"):
    page.click("[data-tab=reading]")
    page.locator("#reading-system-seg [data-system=bazi]").click()
    page.locator("#reading-kind").select_option("career_year")
    page.locator("#reading-year").fill(year)


def test_year_field_appears_with_next_year(page):
    cast(page)
    page.click("[data-tab=reading]")
    assert page.locator("#reading-year").is_hidden()
    page.locator("#reading-kind").select_option("career_year")
    assert page.locator("#reading-year").is_visible()
    assert page.locator("#reading-year").input_value() == str(dt.date.today().year + 1)
    page.locator("#reading-kind").select_option("general")
    assert page.locator("#reading-year").is_hidden()


def test_career_reading_four_sections(page):
    _career(page)
    page.click("#reading-btn")
    page.wait_for_function("document.querySelectorAll('#reading-area .section').length > 0", timeout=15000)
    titles = [t.split("\n")[0].strip() for t in page.locator("#reading-area .section h3").all_inner_texts()]
    assert [t.rstrip("吉平凶—").strip() for t in titles] == CAREER_TITLES
    assert "2027 年事業流年" in page.locator("#reading-area .reading-head").inner_text()
    assert "bazi.liunian.2027" in page.locator("#reading-area").inner_html() or "2027" in page.locator("#reading-area .section").first.inner_text()


def test_career_consistency_has_four_rows(page):
    _career(page)
    page.click("#consistency-btn")
    page.wait_for_function("document.querySelectorAll('#consistency-area .cons-table tbody tr').length > 0", timeout=15000)
    rows = page.locator("#consistency-area .cons-table tbody td.name").all_inner_texts()
    assert rows == CAREER_TITLES


def test_xingming_turns_career_off(page):
    _career(page)
    page.locator("#reading-system-seg [data-system=xingming]").click()
    assert page.locator("#reading-kind").input_value() == "general"
    assert page.locator("#reading-kind option[value=career_year]").is_disabled()
    assert page.locator("#reading-year").is_hidden()
    page.locator("#reading-system-seg [data-system=bazi]").click()
    assert not page.locator("#reading-kind option[value=career_year]").is_disabled()


def test_report_button_carries_career_year(page):
    _career(page, "2028")
    page.evaluate("window.open = (u) => { window.__opened = u; return null; }")
    page.click("[data-tab=cast]")
    page.click("#report-btn")
    url = page.evaluate("window.__opened")
    assert "kind=career_year" in url and "year=2028" in url
    page.click("[data-tab=reading]")
    page.locator("#reading-kind").select_option("general")


def test_report_page_prints_career_year(page, server):
    page.goto(server + "/report.html?name=小美&full_name=陳美玲&birth_date=1990-06-15&birth_time=14:30&gender=female&place=台北&kind=career_year&year=2027")
    page.wait_for_function("document.body.innerText.includes('本報告') || document.querySelectorAll('.report-foot').length > 0", timeout=20000)
    heads = page.locator("#report h2").all_inner_texts()
    assert any(h.startswith("八字・2027 年事業流年") for h in heads) and any(h.startswith("紫微・2027 年事業流年") for h in heads)
    assert not any(h.startswith("姓名學解讀") for h in heads)          # 姓名學只印盤面，不出事業流年
    txt = page.inner_text("#report")
    for t in CAREER_TITLES + ["2027 年事業流年報告", "金土水"]:
        assert t in txt, t
    page.goto(server + "/")


def test_no_console_errors_career(page):
    assert page.errors == [], page.errors  # type: ignore[attr-defined]
