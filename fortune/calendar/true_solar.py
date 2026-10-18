"""真太陽時 — 把手錶時間換成出生地「太陽真正在頭頂」的時間。

時辰以太陽位置定義，但手錶走的是時區標準時。兩者差兩筆：
1. 經度差：出生地經度和時區中央經線每差 1°，差 4 分鐘（台北 121.5°E 對東八區 120°E → +6 分）
2. 均時差：地球公轉不均勻造成的每日偏差（±16 分鐘內）
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta


def equation_of_time_minutes(d: datetime) -> float:
    """均時差（分鐘），Spencer 公式，誤差約半分鐘。"""
    day_of_year = d.timetuple().tm_yday
    b = 2 * math.pi * (day_of_year - 1 + (d.hour - 12) / 24) / 365.0
    return 229.18 * (
        0.000075 + 0.001868 * math.cos(b) - 0.032077 * math.sin(b)
        - 0.014615 * math.cos(2 * b) - 0.040849 * math.sin(2 * b)
    )


def to_true_solar(clock: datetime, longitude: float, tz_offset_hours: float) -> tuple[datetime, float]:
    """手錶時間 → 真太陽時。回傳 (真太陽時 datetime, 總修正分鐘數)。"""
    lon_minutes = (longitude - tz_offset_hours * 15.0) * 4.0
    eot = equation_of_time_minutes(clock)
    total = lon_minutes + eot
    return clock + timedelta(minutes=total), round(total, 1)
