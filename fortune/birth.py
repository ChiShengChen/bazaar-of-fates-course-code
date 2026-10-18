"""出生資料 — 整個系統唯一的輸入。

規格書（第 3 章）的「輸入資料」欄位就對應這個模型：
日期必填；時辰可不填（八字退回三柱、紫微會要求補填）；出生地用來算真太陽時。
"""

from __future__ import annotations

from datetime import date, datetime, time, timedelta, timezone

from pydantic import BaseModel, Field, field_validator


class BirthInput(BaseModel):
    name: str | None = Field(default=None, description="稱呼（顯示用，可不填）")
    full_name: str | None = Field(default=None, max_length=12, description="完整姓名（姓名學用，可不填）；複姓或冠夫姓在姓與名之間加空白：歐陽 娜娜")
    birth_date: date = Field(..., description="出生日期（公曆）")
    birth_time: time | None = Field(default=None, description="出生時刻；不知道就留空")
    gender: str | None = Field(default=None, description="male / female；大運與大限方向需要")
    place: str | None = Field(default=None, description="出生地名（顯示用）")
    longitude: float | None = Field(default=None, ge=-180, le=180, description="出生地經度，算真太陽時用")
    tz_offset_hours: float = Field(default=8.0, description="出生地時區（台灣 +8）")
    use_true_solar_time: bool | None = Field(default=None, description="有經度時是否換算真太陽時；空＝照流派設定")

    @field_validator("gender")
    @classmethod
    def _norm_gender(cls, v: str | None) -> str | None:
        if v is None or not v.strip():
            return None
        v = v.strip().lower()
        alias = {"男": "male", "m": "male", "male": "male", "女": "female", "f": "female", "female": "female"}
        if v not in alias:
            raise ValueError("gender 須為 male/female（或 男/女）")
        return alias[v]

    @field_validator("birth_date")
    @classmethod
    def _sane_year(cls, v: date) -> date:
        if not (1900 <= v.year <= 2100):
            raise ValueError("出生年須在 1900–2100 之間（節氣算法的可靠範圍）")
        return v

    def with_geo(self) -> "BirthInput":
        """有地名但沒填經度時，用離線城市表補經度與時區（台灣日光節約時間依出生日套用）。"""
        if self.longitude is not None or not self.place:
            return self
        from fortune.geo import lookup
        hit = lookup(self.place, self.birth_date)
        if not hit:
            return self
        return self.model_copy(update={"longitude": hit["longitude"], "tz_offset_hours": hit["tz_offset_hours"],
                                       "place": self.place + (f"（{hit['note']}）" if hit.get("note") else "")})

    @property
    def has_time(self) -> bool:
        return self.birth_time is not None

    @property
    def tz(self) -> timezone:
        return timezone(timedelta(hours=self.tz_offset_hours))

    @property
    def clock_dt(self) -> datetime:
        """手錶時間（帶時區）。沒有時辰時以正午代替，只用來定年、月、日柱。"""
        return datetime.combine(self.birth_date, self.birth_time or time(12, 0), tzinfo=self.tz)

    def label(self) -> str:
        who = self.name or (self.full_name or "").replace(" ", "") or "命主"
        when = self.birth_date.isoformat() + (f" {self.birth_time.strftime('%H:%M')}" if self.birth_time else "（時辰不明）")
        where = f"・{self.place}" if self.place else ""
        return f"{who}・{when}{where}"
