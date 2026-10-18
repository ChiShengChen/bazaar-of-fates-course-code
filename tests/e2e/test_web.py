"""網頁端對端（離線模式，不花錢）：起一個測試伺服器，用 Playwright 走排盤→解讀→合盤→對話→缺時辰。

需要：pip install playwright && python -m playwright install chromium
沒裝就整個 skip；CI 想跑再裝。執行：pytest tests/e2e -q
"""

import pytest

from tests.e2e.conftest import fill_birth as _fill_birth_shared

pytestmark = pytest.mark.usefixtures("server")


def _fill_birth(page, form="#birth-form", name="小美", d="1990-06-15", t="14:30", g="female"):
    _fill_birth_shared(page, form, name, d, t, g)


def test_status_badge_shows_offline(page):
    page.wait_for_timeout(800)
    assert "離線" in page.locator("#ai-status").inner_text()


def test_cast_bazi_and_ziwei(page):
    _fill_birth(page)
    page.click("#cast-btn")
    page.wait_for_timeout(1200)
    txt = page.locator("#chart-area").inner_text()
    assert "辛" in txt and "亥" in txt and "大運" in txt
    page.locator("#chart-system-seg [data-system=ziwei]").click()
    page.wait_for_timeout(500)
    assert "命宮" in page.locator("#chart-area").inner_text()


def test_reading_six_sections_with_evidence(page):
    page.click("[data-tab=reading]")
    page.click("#reading-btn")
    page.wait_for_timeout(5000)
    txt = page.locator("#reading-area").inner_text()
    for t in ("總論", "性格", "事業", "感情", "財運", "流年", "依據"):
        assert t in txt


def test_synastry(page):
    page.click("[data-tab=synastry]")
    _fill_birth(page, "#birth-form-b", "小明", "1988-11-02", "08:10", "male")
    page.click("#synastry-btn")
    page.wait_for_timeout(1500)
    assert "日主" in page.locator("#synastry-area").inner_text()


def test_chat_lookup_and_refuse(page):
    page.click("[data-tab=chat]")
    page.locator("#chat-form [name=message]").fill("正官是什麼意思？")
    page.click("#chat-btn")
    page.wait_for_timeout(1500)
    page.locator("#chat-form [name=message]").fill("我該買哪支股票？")
    page.click("#chat-btn")
    page.wait_for_timeout(1500)
    txt = page.locator("#chat-window").inner_text()
    assert "正官" in txt and ("婉拒" in txt or "標的" in txt)


def test_no_birth_time_candidates(page):
    page.click("[data-tab=cast]")
    page.locator("#birth-panel").evaluate("el => el.open = true")
    page.locator("#birth-form [name=birth_time]").fill("")
    page.click("#cast-btn")
    page.wait_for_timeout(1200)
    assert "需要出生時辰" in page.locator("#chart-area").inner_text()


def test_no_console_errors(page):
    assert page.errors == [], page.errors  # type: ignore[attr-defined]
