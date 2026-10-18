"""節氣與真太陽時 — 排盤最常錯的四個地方（4-3）之二。"""

from datetime import datetime, timedelta, timezone

import pytest

from fortune.calendar.solar_terms import bazi_year_at, month_branch_at, term_time
from fortune.calendar.true_solar import to_true_solar

UTC8 = timezone(timedelta(hours=8))

# 公開年曆上的交節時刻（東八區），容忍 2 分鐘
KNOWN = [
    (2024, "立春", "2024-02-04 16:27"), (2023, "立春", "2023-02-04 10:42"), (2000, "立春", "2000-02-04 20:40"),
    (2024, "冬至", "2024-12-21 17:20"), (2024, "夏至", "2024-06-21 04:51"), (2024, "小寒", "2024-01-06 04:49"),
    (1984, "立春", "1984-02-04 23:19"),
]


@pytest.mark.parametrize("year,name,expect", KNOWN)
def test_solar_term_times_match_published(year, name, expect):
    got = term_time(year, name)
    want = datetime.strptime(expect, "%Y-%m-%d %H:%M").replace(tzinfo=UTC8)
    assert abs((got - want).total_seconds()) < 120, f"{year}{name}: {got} vs {want}"


def test_year_rolls_at_lichun_minute():
    before = datetime(2024, 2, 4, 16, 20, tzinfo=UTC8)
    after = datetime(2024, 2, 4, 16, 30, tzinfo=UTC8)
    assert bazi_year_at(before) == 2023 and bazi_year_at(after) == 2024


def test_month_branch_by_term():
    mb, term, *_ = month_branch_at(datetime(2024, 2, 4, 17, 0, tzinfo=UTC8))
    assert (mb, term) == (2, "立春")
    mb, term, *_ = month_branch_at(datetime(2024, 1, 10, tzinfo=UTC8))
    assert (mb, term) == (1, "小寒")
    mb, term, *_ = month_branch_at(datetime(2024, 12, 31, tzinfo=UTC8))
    assert (mb, term) == (0, "大雪")


def test_true_solar_time_taipei_november():
    clock = datetime(2020, 11, 3, 14, 55, tzinfo=UTC8)
    solar, corr = to_true_solar(clock, 121.5, 8)
    assert 20 < corr < 25            # 經度 +6 分 + 均時差約 +16 分
    assert solar.hour == 15


def test_true_solar_time_beijing_is_negative():
    clock = datetime(2020, 2, 12, 12, 0, tzinfo=UTC8)   # 二月中均時差約 -14 分，北京經度 116.4 → -14 分
    _, corr = to_true_solar(clock, 116.4, 8)
    assert corr < -20
