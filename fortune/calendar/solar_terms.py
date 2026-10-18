"""二十四節氣的精確時刻 — 用太陽視黃經計算，不查表。

八字的年、月以「節」為界（立春換年、每月換節），差一分鐘就可能差一柱，
所以這裡用天文算法算出交節的精確時刻（誤差約一分鐘以內），而不是「每年大約 2 月 4 日」。
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone

import ephem

# 節氣名稱，依太陽黃經 0° 起每 15° 一個：春分=0°, 清明=15°, ...
TERM_NAMES = [
    "春分", "清明", "穀雨", "立夏", "小滿", "芒種", "夏至", "小暑", "大暑", "立秋", "處暑", "白露",
    "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至", "小寒", "大寒", "立春", "雨水", "驚蟄",
]
# 八字只用「節」（每月的起點），不用「中氣」。節 → 該月地支（子=0…亥=11）
JIE_TO_BRANCH = {
    "立春": 2, "驚蟄": 3, "清明": 4, "立夏": 5, "芒種": 6, "小暑": 7,
    "立秋": 8, "白露": 9, "寒露": 10, "立冬": 11, "大雪": 0, "小寒": 1,
}
UTC8 = timezone(timedelta(hours=8))


def sun_longitude(t_utc: datetime) -> float:
    """太陽視黃經（度，0–360），t_utc 須為 UTC。"""
    d = ephem.Date(t_utc.replace(tzinfo=None))
    sun = ephem.Sun(d)
    # g_ra/g_dec = 視位置（含光行差、章動），配合當日曆元換成黃經；用 astrometric 會慢約 8 分鐘
    eq = ephem.Equatorial(sun.g_ra, sun.g_dec, epoch=d)
    return math.degrees(float(ephem.Ecliptic(eq).lon)) % 360.0


def _find_crossing(target_deg: float, lo: datetime, hi: datetime) -> datetime:
    """在 [lo, hi]（UTC）之間二分搜尋太陽黃經跨越 target_deg 的時刻。"""
    def diff(t: datetime) -> float:
        return ((sun_longitude(t) - target_deg + 180.0) % 360.0) - 180.0
    for _ in range(50):
        mid = lo + (hi - lo) / 2
        if diff(mid) < 0:
            lo = mid
        else:
            hi = mid
        if (hi - lo).total_seconds() < 1:
            break
    return hi


def term_time(year: int, name: str, tz: timezone = UTC8) -> datetime:
    """某年某節氣的精確時刻（回傳帶時區的 datetime）。
    year 以公曆年計：例如 term_time(2024, "立春") 是 2024 年 2 月的立春。"""
    idx = TERM_NAMES.index(name)
    target = idx * 15.0
    # 粗估日期：春分約 3/21，每個節氣約隔 15.2 天；立春(idx 21)、雨水、驚蟄落在年初
    approx = datetime(year, 3, 21, tzinfo=timezone.utc) + timedelta(days=15.22 * idx)
    if idx >= 19:  # 小寒、大寒、立春、雨水、驚蟄 屬同一公曆年的年初
        approx -= timedelta(days=365.25)
    lo, hi = approx - timedelta(days=10), approx + timedelta(days=10)
    return _find_crossing(target, lo, hi).astimezone(tz)


def jie_boundaries(year: int, tz: timezone = UTC8) -> list[tuple[datetime, str, int]]:
    """某公曆年前後所有「節」的時刻，依時間排序：[(時刻, 節名, 月支)]。
    涵蓋前一年小寒到下一年立春，供任何該年日期查月柱用。"""
    out: list[tuple[datetime, str, int]] = []
    for y in (year - 1, year, year + 1):
        for name, branch in JIE_TO_BRANCH.items():
            out.append((term_time(y, name, tz), name, branch))
    out.sort(key=lambda r: r[0])
    return out


def month_branch_at(t: datetime) -> tuple[int, str, datetime, datetime]:
    """t（帶時區）所在的八字月：(月支, 起始節名, 本節時刻, 下一節時刻)。"""
    bounds = jie_boundaries(t.year, t.tzinfo or UTC8)
    for i in range(len(bounds) - 1):
        if bounds[i][0] <= t < bounds[i + 1][0]:
            return bounds[i][2], bounds[i][1], bounds[i][0], bounds[i + 1][0]
    raise ValueError(f"無法判定月令：{t}")


def bazi_year_at(t: datetime) -> int:
    """八字的年：以立春為界。立春前屬前一年。"""
    lichun = term_time(t.year, "立春", t.tzinfo or UTC8)
    return t.year if t >= lichun else t.year - 1
