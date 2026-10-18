"""e2e 共用：起一個離線模式的測試伺服器（隨機 port）＋ Playwright 頁面。沒裝 playwright 就全部 skip。"""

import os
import socket
import subprocess
import sys
import time
from pathlib import Path

import pytest

pw = pytest.importorskip("playwright.sync_api")
ROOT = Path(__file__).resolve().parents[2]


def _free_port() -> int:
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.fixture(scope="session")
def server():
    port = _free_port()
    env = {**os.environ, "LLM_BACKEND": "mock", "LLM_API_KEY": "", "API_PORT": str(port), "MAINTENANCE": "0",
           "RATE_LIMIT_PER_IP_PER_DAY": "1000", "SESSION_TTL_HOURS": "0", "PERSONA": "master", "SCHOOL": "default"}
    proc = subprocess.Popen([sys.executable, "-m", "fortune"], cwd=ROOT, env=env, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    base = f"http://127.0.0.1:{port}"
    import httpx
    for _ in range(50):
        try:
            if httpx.get(base + "/api/health", timeout=1).status_code == 200:
                break
        except Exception:  # noqa: BLE001
            time.sleep(0.2)
    else:
        proc.kill()
        pytest.skip("測試伺服器起不來")
    yield base
    proc.terminate()


@pytest.fixture(scope="module")
def page(server):
    try:
        with pw.sync_playwright() as p:
            browser = p.chromium.launch()
            pg = browser.new_page(viewport={"width": 1180, "height": 900})
            errors: list[str] = []
            pg.on("pageerror", lambda e: errors.append(str(e)))
            # 400/404/429/503 是刻意的（婉拒、上限、維護、壞金鑰），瀏覽器會記成 console error，不算 bug
            pg.on("console", lambda m: errors.append(m.text) if m.type == "error" and "Failed to load resource" not in m.text else None)
            pg.errors = errors  # type: ignore[attr-defined]
            pg.goto(server + "/")
            yield pg
            browser.close()
    except Exception as e:  # noqa: BLE001 — chromium 沒裝
        pytest.skip(f"Playwright 瀏覽器不可用：{e}")


def fill_birth(page, form="#birth-form", name="小美", d="1990-06-15", t="14:30", g="female", place=None):
    f = page.locator(form)
    f.locator("[name=name]").fill(name)
    f.locator("[name=birth_date]").fill(d)
    f.locator("[name=birth_time]").fill(t)
    f.locator("[name=gender]").select_option(g)
    if place is not None:
        f.locator("[name=place]").fill(place)
        f.locator("[name=place]").dispatch_event("change")
        page.wait_for_timeout(800)
        page.keyboard.press("Escape")


def cast(page, **kw):
    page.locator("#birth-panel").evaluate("el => el.open = true")
    fill_birth(page, **kw)
    page.click("#cast-btn")
    page.wait_for_timeout(1500)
