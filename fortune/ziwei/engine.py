"""紫微斗數排盤引擎 — 命宮、身宮、五行局、十四主星、六吉六煞、祿存天馬、四化、大限。

紫微一定要出生時辰：命宮是「寅起正月順數到生月，再從該宮起子時逆數到生時」，沒有時辰就沒有命宮。
所以時辰不明時，這個引擎不猜，而是回傳十二個時辰各自的命宮主星，請使用者對照補填（4-4）。

閏月規則（可設定）：
- split（預設）：閏月上半月（≤15 日）算本月，下半月算下一個月 —— 多數軟體的預設
- same：整個閏月算本月
- next：整個閏月算下一個月
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date

from lunardate import LunarDate

from fortune.birth import BirthInput

STEMS = "甲乙丙丁戊己庚辛壬癸"
BRANCHES = "子丑寅卯辰巳午未申酉戌亥"
PALACE_NAMES = ["命宮", "兄弟宮", "夫妻宮", "子女宮", "財帛宮", "疾厄宮", "遷移宮", "交友宮", "官祿宮", "田宅宮", "福德宮", "父母宮"]
MAJOR_STARS = ["紫微", "天機", "太陽", "武曲", "天同", "廉貞", "天府", "太陰", "貪狼", "巨門", "天相", "天梁", "七殺", "破軍"]
LUCKY_STARS = ["左輔", "右弼", "文昌", "文曲", "天魁", "天鉞"]
UNLUCKY_STARS = ["擎羊", "陀羅", "火星", "鈴星", "地空", "地劫"]
OTHER_STARS = ["祿存", "天馬", "紅鸞", "天喜"]

# 六十甲子納音五行（每兩個干支一組，共三十組）
_NAYIN = "金火木土金火水土金木水土火木水金火木土金火水土金木水土火木水"
_JU = {"水": 2, "木": 3, "金": 4, "土": 5, "火": 6}

# 四化：年干 → (化祿, 化權, 化科, 化忌)
SIHUA = {
    "甲": ("廉貞", "破軍", "武曲", "太陽"), "乙": ("天機", "天梁", "紫微", "太陰"),
    "丙": ("天同", "天機", "文昌", "廉貞"), "丁": ("太陰", "天同", "天機", "巨門"),
    "戊": ("貪狼", "太陰", "右弼", "天機"), "己": ("武曲", "貪狼", "天梁", "文曲"),
    "庚": ("太陽", "武曲", "太陰", "天同"), "辛": ("巨門", "太陽", "文曲", "文昌"),
    "壬": ("天梁", "紫微", "左輔", "武曲"), "癸": ("破軍", "巨門", "太陰", "貪狼"),
}
HUA_NAMES = ("化祿", "化權", "化科", "化忌")
# 庚、壬兩干的變體（其他干各派一致）
SIHUA_VARIANTS = {
    "tianfu_ke": {"庚": ("太陽", "武曲", "天府", "天同"), "壬": ("天梁", "紫微", "天府", "武曲")},
    "tianxiang_ji": {"庚": ("太陽", "武曲", "太陰", "天相")},
}


def sihua_for(year_stem: str, variant: str = "standard") -> tuple[str, str, str, str]:
    return SIHUA_VARIANTS.get(variant, {}).get(year_stem, SIHUA[year_stem])

_LUCUN = {"甲": 2, "乙": 3, "丙": 5, "丁": 6, "戊": 5, "己": 6, "庚": 8, "辛": 9, "壬": 11, "癸": 0}
_KUI_YUE = {"甲": (1, 7), "戊": (1, 7), "庚": (1, 7), "乙": (0, 8), "己": (0, 8),
            "丙": (11, 9), "丁": (11, 9), "壬": (3, 5), "癸": (3, 5), "辛": (6, 2)}
# 年支三合局 → (火星起點, 鈴星起點, 天馬)
_FIRE_BELL_HORSE = {
    "寅午戌": (1, 3, 8), "申子辰": (2, 10, 2), "巳酉丑": (3, 10, 11), "亥卯未": (9, 10, 5),
}
# 命主（依命宮地支）、身主（依年支）
_MING_ZHU = ["貪狼", "巨門", "祿存", "文曲", "廉貞", "武曲", "破軍", "武曲", "廉貞", "文曲", "祿存", "巨門"]
_SHEN_ZHU = ["火星", "天相", "天梁", "天同", "文昌", "天機", "火星", "天相", "天梁", "天同", "文昌", "天機"]


@dataclass
class Palace:
    name: str
    branch: str
    stem: str
    major: list[str] = field(default_factory=list)
    lucky: list[str] = field(default_factory=list)
    unlucky: list[str] = field(default_factory=list)
    other: list[str] = field(default_factory=list)
    hua: dict[str, str] = field(default_factory=dict)     # 星 → 化祿/權/科/忌
    is_body: bool = False
    daxian: tuple[int, int] | None = None                 # (起歲, 迄歲)

    def as_dict(self) -> dict:
        return {
            "name": self.name, "branch": self.branch, "stem": self.stem, "gz": self.stem + self.branch,
            "major": self.major, "lucky": self.lucky, "unlucky": self.unlucky, "other": self.other,
            "hua": self.hua, "is_body": self.is_body,
            "daxian": list(self.daxian) if self.daxian else None,
            "is_empty": not self.major,
        }


@dataclass
class ZiweiChart:
    lunar: dict
    hour_branch: str
    life_branch: str
    body_branch: str
    five_class: str              # 例如「金四局」
    ju: int
    soul_star: str               # 命主
    body_star: str               # 身主
    palaces: list[Palace]        # 依地支 子…亥 排列
    warnings: list[str] = field(default_factory=list)
    missing: list[str] = field(default_factory=list)
    school: object = None

    def palace(self, name: str) -> Palace:
        return next(p for p in self.palaces if p.name == name)

    def current_daxian(self, age: int) -> Palace | None:
        for p in self.palaces:
            if p.daxian and p.daxian[0] <= age <= p.daxian[1]:
                return p
        return None


class NeedsBirthTime(ValueError):
    """紫微沒有時辰排不出命宮。帶著十二個時辰的候選命宮，讓使用者對照。"""

    def __init__(self, candidates: list[dict]):
        super().__init__("紫微斗數需要出生時辰")
        self.candidates = candidates


def lunar_of(d: date, leap_rule: str = "split") -> dict:
    lz = LunarDate.from_solar_date(d.year, d.month, d.day)
    leap = lz.is_leap_month
    month, note = lz.month, ""
    if leap:
        if leap_rule == "next" or (leap_rule == "split" and lz.day > 15):
            month = lz.month % 12 + 1
            note = f"閏{lz.month}月{'下半月' if leap_rule == 'split' else ''}，依「{leap_rule}」規則算作{month}月"
        else:
            note = f"閏{lz.month}月{'上半月' if leap_rule == 'split' else ''}，依「{leap_rule}」規則算作本月"
    return {"year": lz.year, "month": month, "day": lz.day, "is_leap": leap,
            "raw_month": lz.month, "note": note,
            "year_gz": STEMS[(lz.year - 4) % 10] + BRANCHES[(lz.year - 4) % 12]}


def hour_branch_of(hour: int) -> int:
    return ((hour + 1) // 2) % 12


def nayin_element(stem_idx: int, branch_idx: int) -> str:
    i = (stem_idx - branch_idx) % 12 // 2 * 10 + stem_idx  # 六十甲子序
    # 簡化：直接用 (stem, branch) 在六十甲子的序號
    seq = next(k for k in range(60) if k % 10 == stem_idx and k % 12 == branch_idx)
    return _NAYIN[seq // 2]


def ziwei_position(ju: int, day: int) -> int:
    """紫微星地支：以局數除生日，商 q（無條件進位）、補數 r = q*局 - 日；
    從寅宮起數 q-1 宮，r 為奇數再退 r 宮、偶數則進 r 宮。"""
    q = -(-day // ju)
    r = q * ju - day
    pos = 2 + (q - 1)
    pos = pos - r if r % 2 == 1 else pos + r
    return pos % 12


def cast(birth: BirthInput, *, leap_rule: str | None = None, today: date | None = None, school=None) -> ZiweiChart:
    from fortune.school import resolve as _resolve_school
    school = school or _resolve_school()
    rules = school.ziwei
    leap_rule = leap_rule or rules.leap_month
    if not birth.has_time:
        raise NeedsBirthTime(candidates_by_hour(birth, leap_rule=leap_rule, school=school))
    warnings: list[str] = []
    missing: list[str] = []
    lunar = lunar_of(birth.birth_date, leap_rule)
    if lunar["note"]:
        warnings.append(lunar["note"])
    # 時支：依流派用真太陽時或手錶時間
    from datetime import timedelta
    from fortune.calendar.true_solar import to_true_solar
    clock = birth.clock_dt
    use_tst = birth.use_true_solar_time if birth.use_true_solar_time is not None else rules.hour_source == "true_solar"
    if birth.longitude is not None and use_tst:
        clock, _ = to_true_solar(clock, birth.longitude, birth.tz_offset_hours)
    hb = hour_branch_of(clock.hour)
    lunar_date = clock.date()
    if clock.hour == 23:
        if rules.late_zi == "next_day":
            lunar_date = (clock + timedelta(hours=1)).date()
            warnings.append("出生於晚子時：依流派農曆日算隔日（另一派不換）")
        else:
            warnings.append("出生於晚子時：依流派農曆日不換（另一派算隔日）")
    if lunar_date != birth.birth_date:
        lunar = lunar_of(lunar_date, leap_rule)
        if clock.date() != birth.birth_date:
            warnings.append("真太陽時換算後跨日，農曆日依換算後日期")

    m, d, ly = lunar["month"], lunar["day"], lunar["year"]
    ys, yb = (ly - 4) % 10, (ly - 4) % 12
    year_stem = STEMS[ys]

    month_palace = (2 + m - 1) % 12
    life_b = (month_palace - hb) % 12
    body_b = (month_palace + hb) % 12
    yin_stem = (2 + 2 * (ys % 5)) % 10                      # 五虎遁：寅宮天干
    stem_at = lambda b: STEMS[(yin_stem + (b - 2) % 12) % 10]    # noqa: E731 — 先對 12 取模：子、丑兩宮在寅之前
    elem = nayin_element(STEMS.index(stem_at(life_b)), life_b)
    ju = _JU[elem]
    five_class = f"{elem}{'二三四五六'[ju - 2]}局"

    # 星曜位置
    pos: dict[str, int] = {}
    zw = ziwei_position(ju, d)
    tf = (4 - zw) % 12
    pos.update({"紫微": zw, "天機": (zw - 1) % 12, "太陽": (zw - 3) % 12, "武曲": (zw - 4) % 12,
                "天同": (zw - 5) % 12, "廉貞": (zw + 4) % 12})
    pos.update({"天府": tf, "太陰": (tf + 1) % 12, "貪狼": (tf + 2) % 12, "巨門": (tf + 3) % 12,
                "天相": (tf + 4) % 12, "天梁": (tf + 5) % 12, "七殺": (tf + 6) % 12, "破軍": (tf + 10) % 12})
    pos.update({"左輔": (4 + m - 1) % 12, "右弼": (10 - (m - 1)) % 12,
                "文昌": (10 - hb) % 12, "文曲": (4 + hb) % 12})
    kui, yue = _KUI_YUE[year_stem]
    pos.update({"天魁": kui, "天鉞": yue})
    lu = _LUCUN[year_stem]
    pos.update({"祿存": lu, "擎羊": (lu + 1) % 12, "陀羅": (lu - 1) % 12})
    group = next(k for k in _FIRE_BELL_HORSE if BRANCHES[yb] in k)
    fire0, bell0, horse = _FIRE_BELL_HORSE[group]
    if rules.tianma_basis == "month_branch":
        mbranch = (2 + m - 1) % 12                        # 寅月=正月
        horse = _FIRE_BELL_HORSE[next(k for k in _FIRE_BELL_HORSE if BRANCHES[mbranch] in k)][2]
    pos.update({"火星": (fire0 + hb) % 12, "鈴星": (bell0 + hb) % 12, "天馬": horse,
                "地空": (11 - hb) % 12, "地劫": (11 + hb) % 12,
                "紅鸞": (3 - yb) % 12, "天喜": (3 - yb + 6) % 12})

    sihua_row = sihua_for(year_stem, rules.sihua_variant)
    hua = {star: HUA_NAMES[i] for i, star in enumerate(sihua_row)}
    if year_stem in ("庚", "壬"):
        alt = {v: sihua_for(year_stem, v) for v in ("standard", "tianfu_ke", "tianxiang_ji") if v != rules.sihua_variant and sihua_for(year_stem, v) != sihua_row}
        if alt:
            warnings.append(f"{year_stem}干四化採「{'、'.join(s + h for s, h in zip(sihua_row, HUA_NAMES))}」；另一派：" +
                            "；".join("、".join(s + h for s, h in zip(row, HUA_NAMES)) for row in alt.values()) + "（流派可切換）")

    palaces: list[Palace] = []
    for b in range(12):
        name = PALACE_NAMES[(life_b - b) % 12]
        p = Palace(name=name, branch=BRANCHES[b], stem=stem_at(b), is_body=(b == body_b))
        for s, sb in pos.items():
            if sb != b:
                continue
            if s in MAJOR_STARS:
                p.major.append(s)
            elif s in LUCKY_STARS:
                p.lucky.append(s)
            elif s in UNLUCKY_STARS:
                p.unlucky.append(s)
            else:
                p.other.append(s)
            if s in hua:
                p.hua[s] = hua[s]
        p.major.sort(key=MAJOR_STARS.index)
        palaces.append(p)

    # 大限：命宮起，局數為起歲；陽男陰女順行（往父母宮方向），陰男陽女逆行
    if birth.gender is None:
        missing.append("gender")
        warnings.append("性別未填：大限方向無法判定，不排大限")
    else:
        yang_year = ys % 2 == 0
        forward = (yang_year and birth.gender == "male") or (not yang_year and birth.gender == "female")
        for i in range(12):
            b = (life_b + i) % 12 if forward else (life_b - i) % 12
            palaces[b].daxian = (ju + 10 * i, ju + 10 * i + 9)
        warnings.append(f"大限{'順行' if forward else '逆行'}，{ju} 歲起第一大限")

    return ZiweiChart(
        lunar=lunar, hour_branch=BRANCHES[hb], life_branch=BRANCHES[life_b], body_branch=BRANCHES[body_b],
        five_class=five_class, ju=ju, soul_star=_MING_ZHU[life_b], body_star=_SHEN_ZHU[yb],
        palaces=palaces, warnings=warnings, missing=missing, school=school,
    )


def candidates_by_hour(birth: BirthInput, leap_rule: str = "split", school=None) -> list[dict]:
    """時辰不明時，列出十二時辰各自的命宮與主星，讓使用者用個性對照（不硬猜）。"""
    from datetime import time
    out = []
    for hb in range(12):
        hour = (hb * 2 + 23) % 24 if hb == 0 else hb * 2 - 1
        trial = birth.model_copy(update={"birth_time": time(hour, 30), "use_true_solar_time": False})
        c = cast(trial, leap_rule=leap_rule, school=school)
        life = c.palace("命宮")
        out.append({"hour_branch": BRANCHES[hb], "clock": f"{hour:02d}:00–{(hour + 2) % 24:02d}:00",
                    "life_branch": c.life_branch, "life_major": life.major or ["空宮（借對宮）"],
                    "five_class": c.five_class})
    return out
