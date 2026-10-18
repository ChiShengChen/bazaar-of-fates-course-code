"""八字排盤引擎 — 程式算得出來的，全部在這裡算；AI 不准自己排盤（5-2）。

排盤規則：
- 年柱：立春換年（精確到分鐘）。1984 年 = 甲子年。
- 月柱：以十二「節」換月（精確到分鐘），月干用五虎遁。
- 日柱：以儒略日數推算，2000-01-07 = 甲子日。晚子時（23:00 後）算隔日的日柱（可設定）。
- 時柱：時支依真太陽時（有經度時）；時干用五鼠遁。
- 十神：每個干（含藏干）對日主的生剋與陰陽。
- 旺衰與喜用：依月令、通根、生扶比例簡估（教學用簡化版，流派差異大，知識卡會註明）。
- 大運：陽男陰女順、陰男陽女逆；起運歲以出生到交節的天數除以三。
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta

from fortune.birth import BirthInput
from fortune.calendar.solar_terms import JIE_TO_BRANCH, bazi_year_at, jie_boundaries, month_branch_at
from fortune.calendar.true_solar import to_true_solar

STEMS = "甲乙丙丁戊己庚辛壬癸"
BRANCHES = "子丑寅卯辰巳午未申酉戌亥"
STEM_ELEM = ["木", "木", "火", "火", "土", "土", "金", "金", "水", "水"]
STEM_YANG = [True, False] * 5                       # 甲陽 乙陰 …
BRANCH_ELEM = ["水", "土", "木", "木", "土", "火", "火", "土", "金", "金", "土", "水"]
BRANCH_YANG = [True, False] * 6
ZODIAC = "鼠牛虎兔龍蛇馬羊猴雞狗豬"

SHENG = {"木": "火", "火": "土", "土": "金", "金": "水", "水": "木"}   # 我生
KE = {"木": "土", "土": "水", "水": "火", "火": "金", "金": "木"}      # 我剋

# 地支藏干（本氣在前）
HIDDEN_STEMS = {
    "子": "癸", "丑": "己癸辛", "寅": "甲丙戊", "卯": "乙", "辰": "戊乙癸", "巳": "丙戊庚",
    "午": "丁己", "未": "己丁乙", "申": "庚壬戊", "酉": "辛", "戌": "戊辛丁", "亥": "壬甲",
}
TEN_GODS = ["比肩", "劫財", "食神", "傷官", "偏財", "正財", "七殺", "正官", "偏印", "正印"]

# 地支關係（合盤 4-5 用）
LIUHE = {("子", "丑"), ("寅", "亥"), ("卯", "戌"), ("辰", "酉"), ("巳", "申"), ("午", "未")}
LIUCHONG = {("子", "午"), ("丑", "未"), ("寅", "申"), ("卯", "酉"), ("辰", "戌"), ("巳", "亥")}
SANHE = [("申", "子", "辰", "水"), ("亥", "卯", "未", "木"), ("寅", "午", "戌", "火"), ("巳", "酉", "丑", "金")]
STEM_HE = {("甲", "己"): "土", ("乙", "庚"): "金", ("丙", "辛"): "水", ("丁", "壬"): "木", ("戊", "癸"): "火"}
XING = {("寅", "巳"), ("巳", "申"), ("申", "寅"), ("丑", "戌"), ("戌", "未"), ("未", "丑"), ("子", "卯")}
ZIXING = {"辰", "午", "酉", "亥"}


def ten_god(day_stem: str, other: str) -> str:
    """other 這個天干，對日主 day_stem 來說是哪個十神。"""
    d, o = STEMS.index(day_stem), STEMS.index(other)
    de, oe = STEM_ELEM[d], STEM_ELEM[o]
    same_polarity = STEM_YANG[d] == STEM_YANG[o]
    if oe == de:
        return "比肩" if same_polarity else "劫財"
    if SHENG[de] == oe:          # 我生 → 食傷
        return "食神" if same_polarity else "傷官"
    if KE[de] == oe:             # 我剋 → 財
        return "偏財" if same_polarity else "正財"
    if KE[oe] == de:             # 剋我 → 官殺
        return "七殺" if same_polarity else "正官"
    return "偏印" if same_polarity else "正印"   # 生我 → 印


def _jdn(y: int, m: int, d: int) -> int:
    a = (14 - m) // 12
    yy = y + 4800 - a
    mm = m + 12 * a - 3
    return d + (153 * mm + 2) // 5 + 365 * yy + yy // 4 - yy // 100 + yy // 400 - 32045


@dataclass
class Pillar:
    name: str            # 年柱/月柱/日柱/時柱
    stem: str
    branch: str

    @property
    def gz(self) -> str:
        return self.stem + self.branch

    def as_dict(self, day_stem: str | None = None) -> dict:
        hidden = HIDDEN_STEMS[self.branch]
        d = {
            "name": self.name, "stem": self.stem, "branch": self.branch, "gz": self.gz,
            "stem_elem": STEM_ELEM[STEMS.index(self.stem)], "branch_elem": BRANCH_ELEM[BRANCHES.index(self.branch)],
            "zodiac": ZODIAC[BRANCHES.index(self.branch)], "hidden_stems": list(hidden),
        }
        if day_stem:
            d["stem_god"] = "日主" if self.name == "日柱" else ten_god(day_stem, self.stem)
            d["hidden_gods"] = [ten_god(day_stem, h) for h in hidden]
        return d


@dataclass
class BaziChart:
    pillars: dict[str, Pillar]            # year/month/day/(hour)
    day_master: str
    true_solar_dt: datetime | None        # 用來排時柱的真太陽時（無時辰則 None）
    solar_correction_min: float | None
    late_zi: bool                         # 是否落在晚子時並已換日
    month_term: str                       # 本月的節名
    strength: dict = field(default_factory=dict)
    dayun: list[dict] = field(default_factory=list)
    qiyun: dict = field(default_factory=dict)        # 起運／交運細節
    school: object = None                             # 本盤採用的流派（fortune.school.School）
    term_window: tuple[datetime, datetime] | None = None   # (本節時刻, 下節時刻)
    warnings: list[str] = field(default_factory=list)
    missing: list[str] = field(default_factory=list)


def year_pillar(bazi_year: int) -> Pillar:
    return Pillar("年柱", STEMS[(bazi_year - 4) % 10], BRANCHES[(bazi_year - 4) % 12])


def month_pillar(year_stem: str, month_branch: int) -> Pillar:
    """五虎遁：甲己之年丙作首、乙庚戊、丙辛庚、丁壬壬、戊癸甲（寅月的月干）。"""
    yin_stem = (2 + 2 * (STEMS.index(year_stem) % 5)) % 10
    offset = (month_branch - 2) % 12
    return Pillar("月柱", STEMS[(yin_stem + offset) % 10], BRANCHES[month_branch])


def day_pillar_of(d: datetime) -> Pillar:
    i = (_jdn(d.year, d.month, d.day) + 49) % 60     # 2000-01-07 = 甲子
    return Pillar("日柱", STEMS[i % 10], BRANCHES[i % 12])


def hour_pillar(day_stem: str, hour_branch: int) -> Pillar:
    """五鼠遁：甲己還加甲、乙庚丙作初、丙辛從戊起、丁壬庚子居、戊癸何方發壬子是真途。"""
    zi_stem = (2 * (STEMS.index(day_stem) % 5)) % 10
    return Pillar("時柱", STEMS[(zi_stem + hour_branch) % 10], BRANCHES[hour_branch])


# 曾實施日光節約時間的年份（夏季時鐘撥快一小時）：出生在這些期間要先減一小時再排盤
_DST_YEARS = {
    "台灣": set(range(1945, 1962)) | {1974, 1975, 1979},
    "中國大陸": set(range(1986, 1992)),
}


def _dst_hint(birth: BirthInput) -> str | None:
    if not birth.has_time or birth.tz_offset_hours != 8:
        return None
    y, m = birth.birth_date.year, birth.birth_date.month
    for region, years in _DST_YEARS.items():
        if y in years and 4 <= m <= 10:
            return (f"{y} 年{region}曾實施日光節約時間（約 4–10 月）：若出生地在{region}且證件時間是當時的時鐘時間，"
                    f"請把出生時間減一小時再排；本盤未自動調整")
    return None


def hour_branch_of(t: datetime) -> int:
    """真太陽時 → 時支。23:00–00:59 子、01:00–02:59 丑 … 21:00–22:59 亥。"""
    return ((t.hour + 1) // 2) % 12


def cast(birth: BirthInput, *, late_zi_next_day: bool | None = None, school=None) -> BaziChart:
    from fortune.school import resolve as _resolve_school
    school = school or _resolve_school()
    rules = school.bazi
    if late_zi_next_day is None:
        late_zi_next_day = rules.late_zi == "next_day"
    use_tst = birth.use_true_solar_time if birth.use_true_solar_time is not None else rules.true_solar_time == "on"
    warnings: list[str] = []
    missing: list[str] = []

    # 1. 年、月：用手錶時間（換成同一時區的精確節氣比較）。沒有時辰時以正午代入；
    #    若出生日正好是交節日，年/月可能受時辰影響，要標出來。
    clock = birth.clock_dt
    solar_dt: datetime | None = None
    corr: float | None = None
    if birth.has_time and birth.longitude is not None and use_tst:
        solar_dt, corr = to_true_solar(clock, birth.longitude, birth.tz_offset_hours)
    elif birth.has_time:
        solar_dt = clock
        warnings.append("未提供出生地經度，時柱以手錶時間計，未換算真太陽時" if birth.longitude is None else "依流派設定，時柱用手錶時間、未換算真太陽時")

    # 年、月以「交節的絕對時刻」比較 → 用手錶時間（交節是全球同一瞬間，不隨經度改變）；
    # 真太陽時只用來定時辰與子時換日。這是 4-3「節氣交界」最常錯的地方之一。
    if rules.year_boundary == "lunar_new_year":
        from lunardate import LunarDate
        bazi_year = LunarDate.from_solar_date(clock.year, clock.month, clock.day).year
        if bazi_year != bazi_year_at(clock):
            warnings.append(f"依流派以農曆新年換年：年柱算 {bazi_year} 年（以立春為界會是 {bazi_year_at(clock)} 年）")
    else:
        bazi_year = bazi_year_at(clock)
    mb, term_name, term_at, next_term_at = month_branch_at(clock)
    ref = solar_dt or clock
    dst = _dst_hint(birth)
    if dst:
        warnings.append(dst)
    yp = year_pillar(bazi_year)
    # 月干由五虎遁從「年干」推；農曆新年換年派裡，有人讓月干跟著年柱變，有人只換年柱、月干仍依立春年
    month_stem_src = yp.stem if rules.month_stem_follows == "year_pillar" else year_pillar(bazi_year_at(clock)).stem
    mp = month_pillar(month_stem_src, mb)
    if month_stem_src != yp.stem:
        warnings.append(f"依流派月干以立春年天干（{month_stem_src}）起五虎遁，不跟年柱（{yp.stem}）")

    if not birth.has_time:
        missing.append("hour")
        # 交節日無時辰：年/月柱不確定
        bounds = jie_boundaries(clock.year, birth.tz)
        same_day = [b for b in bounds if b[0].date() == birth.birth_date]
        if same_day:
            warnings.append(f"出生日為交節日（{same_day[0][1]} {same_day[0][0].strftime('%H:%M')}），無時辰無法確定月柱，暫以正午計")

    # 2. 日柱（晚子時換日）
    day_ref = ref
    late_zi = False
    if birth.has_time and ref.hour == 23 and late_zi_next_day:
        day_ref = ref + timedelta(hours=1)
        late_zi = True
        warnings.append("出生於晚子時（23 時後），日柱依「晚子時換日」派算作隔日；另一派不換日（流派可切換）")
    elif birth.has_time and ref.hour == 23:
        warnings.append("出生於晚子時（23 時後），依流派日柱不換日；另一派算隔日（流派可切換）")
    dp = day_pillar_of(day_ref)

    pillars = {"year": yp, "month": mp, "day": dp}

    # 3. 時柱（第三派：晚子時日柱不換，但時干用隔日的日干起五鼠遁）
    if birth.has_time:
        hour_stem_src = dp.stem
        if ref.hour == 23 and rules.late_zi == "same_day_next_hour_stem":
            hour_stem_src = day_pillar_of(ref + timedelta(hours=1)).stem
            warnings.append("出生於晚子時：依流派日柱不換、時干依隔日日干起五鼠遁")
        pillars["hour"] = hour_pillar(hour_stem_src, hour_branch_of(ref))
    else:
        warnings.append("時辰不明：只排年、月、日三柱；時柱與相關判斷（子女、晚年、身宮）標示為資料不足")

    chart = BaziChart(
        pillars=pillars, day_master=dp.stem, true_solar_dt=solar_dt, solar_correction_min=corr,
        late_zi=late_zi, month_term=term_name, warnings=warnings, missing=missing,
    )
    chart.school = school
    if rules.strength_method == "score_v2":
        from fortune.bazi.strength import analyze
        chart.strength = analyze(chart.pillars)
    else:
        chart.strength = estimate_strength(chart)
        chart.strength["method"] = "score_v1"
    chart.term_window = (term_at, next_term_at)
    chart.dayun = compute_dayun(birth, chart, term_at, next_term_at)
    return chart


# ---------------------------------------------------------------- 旺衰 / 喜用
_SEASON_STRONG = {"木": ["寅", "卯"], "火": ["巳", "午"], "金": ["申", "酉"], "水": ["亥", "子"], "土": ["辰", "戌", "丑", "未"]}


def estimate_strength(chart: BaziChart) -> dict:
    """教學用簡化旺衰：月令得令 +3、通根 +1/支、天干生扶 +1/干；其餘為耗洩。
    總分 ≥ 0 偏強，否則偏弱。喜用：身強用「剋洩耗」，身弱用「生扶」。"""
    dm = chart.day_master
    dme = STEM_ELEM[STEMS.index(dm)]
    score = 0
    notes: list[str] = []
    mbranch = chart.pillars["month"].branch
    if mbranch in _SEASON_STRONG[dme]:
        score += 3
        notes.append(f"日主{dme}於{mbranch}月得令（+3）")
    elif BRANCH_ELEM[BRANCHES.index(mbranch)] and SHENG.get(BRANCH_ELEM[BRANCHES.index(mbranch)]) == dme:
        score += 2
        notes.append(f"月令{mbranch}生日主（+2）")
    else:
        score -= 2
        notes.append(f"日主{dme}於{mbranch}月失令（-2）")
    for key, p in chart.pillars.items():
        if key != "day":
            se = STEM_ELEM[STEMS.index(p.stem)]
            if se == dme or SHENG.get(se) == dme:
                score += 1
                notes.append(f"{p.name}天干{p.stem}（{se}）生扶日主（+1）")
            else:
                score -= 1
                notes.append(f"{p.name}天干{p.stem}（{se}）耗洩日主（-1）")
        for h in HIDDEN_STEMS[p.branch]:
            he = STEM_ELEM[STEMS.index(h)]
            if he == dme:
                score += 1
                notes.append(f"{p.name}地支{p.branch}藏{h}，日主通根（+1）")
                break
    strong = score >= 0
    gen_of = {v: k for k, v in SHENG.items()}
    ctrl_of = {v: k for k, v in KE.items()}
    if strong:
        favourable = [ctrl_of[dme], SHENG[dme], KE[dme]]     # 官殺、食傷、財
        label = "身強（宜剋洩耗）"
    else:
        favourable = [gen_of[dme], dme]                      # 印、比劫
        label = "身弱（宜生扶）"
    return {"score": score, "label": label, "favourable": favourable, "notes": notes,
            "disclaimer": "簡化版旺衰估算，流派間差異大，僅供課程示範"}


# ---------------------------------------------------------------- 大運
def compute_dayun(birth: BirthInput, chart: BaziChart, term_at: datetime, next_term_at: datetime, count: int = 8) -> list[dict]:
    if birth.gender is None:
        chart.missing.append("gender")
        chart.warnings.append("性別未填：大運方向無法判定，不排大運")
        return []
    year_yang = STEM_YANG[STEMS.index(chart.pillars["year"].stem)]
    forward = (year_yang and birth.gender == "male") or (not year_yang and birth.gender == "female")
    ref = birth.clock_dt                      # 起運同樣用絕對時刻對交節
    # 順行數到下一節，逆行數到上一節；三日折一年（一天 = 四個月、一時辰 = 十天）
    days = (next_term_at - ref).total_seconds() / 86400 if forward else (ref - term_at).total_seconds() / 86400
    start_age = round(days / 3, 1)
    jiaoyun = ref + timedelta(days=days * 120)   # 交運的精確時刻
    total_days = days * 120
    y = int(total_days // 365.25); rem = total_days - y * 365.25
    mo = int(rem // 30.4375); rem -= mo * 30.4375
    d = int(rem); h = int(round((rem - d) * 24))
    chart.qiyun = {"forward": forward, "years": y, "months": mo, "days": d, "hours": h, "start_age": start_age,
                   "jiaoyun": jiaoyun.isoformat(timespec="minutes"), "huanyun_digit": jiaoyun.year % 10,
                   "text": f"出生後 {y} 年 {mo} 個月 {d} 天 {h} 小時起運，{jiaoyun.strftime('%Y 年 %m 月 %d 日 %H:%M')} 交運，之後每逢尾數 {jiaoyun.year % 10} 的年份換運"}
    mp = chart.pillars["month"]
    ms, mb = STEMS.index(mp.stem), BRANCHES.index(mp.branch)
    out = []
    step = 1 if forward else -1
    for i in range(1, count + 1):
        s, b = STEMS[(ms + step * i) % 10], BRANCHES[(mb + step * i) % 12]
        age = start_age + 10 * (i - 1)
        start_dt = jiaoyun.replace(year=jiaoyun.year + 10 * (i - 1))      # 每運十年，從交運時刻起算
        out.append({
            "index": i, "gz": s + b, "stem": s, "branch": b, "start_age": age, "end_age": age + 10,
            "start_year": start_dt.year, "start_date": start_dt.date().isoformat(),
            "xusui": start_dt.year - birth.birth_date.year + 1,              # 交運那年的虛歲（命理慣用）
            "stem_god": ten_god(chart.day_master, s),
            "branch_god": ten_god(chart.day_master, HIDDEN_STEMS[b][0]),
        })
    chart.warnings.append(f"大運{'順行' if forward else '逆行'}，{start_age} 歲起運")
    return out


def liunian(year: int, day_master: str) -> dict:
    """某公曆年（立春後）的流年干支與十神。"""
    s, b = STEMS[(year - 4) % 10], BRANCHES[(year - 4) % 12]
    return {"year": year, "gz": s + b, "stem": s, "branch": b,
            "stem_god": ten_god(day_master, s), "branch_god": ten_god(day_master, HIDDEN_STEMS[b][0])}
