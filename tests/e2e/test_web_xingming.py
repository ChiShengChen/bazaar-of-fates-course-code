"""網頁端對端：姓名學（填姓名→排盤分頁「姓名」→解讀「八字配合」→一頁式報告→mock 模式）。離線模式，不花錢。"""

import pytest

from tests.e2e.conftest import cast

pytestmark = pytest.mark.usefixtures("server")


def _set_full_name(page, value):
    page.locator("#birth-panel").evaluate("el => el.open = true")
    page.locator("#birth-form [name=full_name]").fill(value)


def test_xingming_tab_shows_five_grids(page):
    _set_full_name(page, "陳美玲")
    cast(page)
    page.locator("#chart-system-seg [data-system=xingming]").click()
    page.wait_for_timeout(500)
    area = page.locator("#chart-area")
    assert area.locator(".xm-grid").count() == 5
    assert area.locator(".xm-char").count() == 3
    txt = area.inner_text()
    for t in ("人格", "25", "金土水", "16 畫", "喜用"):
        assert t in txt, t


def test_xingming_reading_has_bazi_section(page):
    page.click("[data-tab=reading]")
    page.locator("#reading-system-seg [data-system=xingming]").click()
    page.click("#reading-btn")
    page.wait_for_timeout(5000)
    txt = page.locator("#reading-area").inner_text()
    for t in ("總論", "八字配合", "依據", "命盤對照"):
        assert t in txt, t
    assert "流年" not in [s.inner_text().strip()[:2] for s in page.locator("#reading-area .section h3").all()]


def test_xingming_without_name_explains(page):
    page.click("[data-tab=cast]")
    _set_full_name(page, "")
    cast(page)
    page.locator("#chart-system-seg [data-system=xingming]").click()
    page.wait_for_timeout(500)
    assert "填「姓名」" in page.locator("#chart-area").inner_text()


def test_report_includes_xingming(page, server):
    page.goto(server + "/report.html?name=小美&full_name=陳美玲&birth_date=1990-06-15&birth_time=14:30&gender=female&place=台北")
    page.wait_for_timeout(8000)
    txt = page.inner_text("body")
    for t in ("姓名學", "金土水", "八字配合", "本報告"):
        assert t in txt, t
    page.goto(server + "/")


def test_mock_mode_renders_xingming(page, server):
    page.goto(server + "/index.html?mock=1")
    page.wait_for_timeout(800)
    _set_full_name(page, "陳美玲")
    cast(page)
    page.locator("#chart-system-seg [data-system=xingming]").click()
    page.wait_for_timeout(500)
    assert page.locator("#chart-area .xm-grid").count() == 5
    page.goto(server + "/")


def test_no_console_errors_xingming(page):
    assert page.errors == [], page.errors  # type: ignore[attr-defined]
