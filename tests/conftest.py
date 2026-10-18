import os

import pytest

from fortune.config import get_settings


@pytest.fixture(autouse=True)
def _isolated_settings(tmp_path, monkeypatch):
    """測試一律離線、資料寫到暫存目錄、不讀 .env 的金鑰。"""
    monkeypatch.setenv("LLM_BACKEND", "mock")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "")
    monkeypatch.setenv("MAINTENANCE", "0")
    monkeypatch.setenv("RATE_LIMIT_PER_IP_PER_DAY", "1000")
    monkeypatch.setenv("DAILY_READING_CAP", "100000")
    monkeypatch.setenv("DAILY_BUDGET_USD", "100")
    monkeypatch.setenv("SESSION_TTL_HOURS", "0")
    monkeypatch.setenv("READING_MAX_TOKENS", "8000")
    get_settings.cache_clear()
    s = get_settings()
    s.data_dir = tmp_path / "data"
    yield
    get_settings.cache_clear()


@pytest.fixture
def mei():
    from fortune.birth import BirthInput
    return BirthInput(name="小美", birth_date="1990-06-15", birth_time="14:30", gender="female", place="台北", longitude=121.5)


@pytest.fixture
def ming():
    from fortune.birth import BirthInput
    return BirthInput(name="小明", birth_date="1988-11-02", birth_time="08:10", gender="male", place="台北", longitude=121.5)
