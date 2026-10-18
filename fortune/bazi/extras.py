"""八字的「詳細盤面」— 全部是查表型（2-2）的確定性計算：
納音、旬空（空亡）、胎元、命宮、十二長生、神煞、地支關係（合沖刑害破會）、大運×流年、流月、稱骨。

這些在坊間排盤網站都看得到；做成程式的價值是每一格都能說出「依哪張表、怎麼查」。
流派差異處（羊刃陰干、暗合、稱骨版本）都在 note 標明。
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime

from fortune.bazi.engine import BRANCHES, HIDDEN_STEMS, STEM_YANG, STEMS, ten_god

# ---------------------------------------------------------------- 納音
_NAYIN_NAMES = [
    "海中金", "爐中火", "大林木", "路旁土", "劍鋒金", "山頭火", "澗下水", "城頭土", "白蠟金", "楊柳木",
    "泉中水", "屋上土", "霹靂火", "松柏木", "長流水", "砂中金", "山下火", "平地木", "壁上土", "金箔金",
    "覆燈火", "天河水", "大驛土", "釵釧金", "桑柘木", "大溪水", "沙中土", "天上火", "石榴木", "大海水",
]


def gz_index(stem: str, branch: str) -> int:
    """六十甲子序（甲子=0）。"""
    s, b = STEMS.index(stem), BRANCHES.index(branch)
    return next(k for k in range(60) if k % 10 == s and k % 12 == b)


def nayin(stem: str, branch: str) -> str:
    return _NAYIN_NAMES[gz_index(stem, branch) // 2]


def kongwang(stem: str, branch: str) -> str:
    """旬空：該旬十個干支用不到的兩個地支。甲子旬空戌亥、甲戌旬空申酉…"""
    xun = gz_index(stem, branch) // 10
    k = (10 - 2 * xun) % 12
    return BRANCHES[k] + BRANCHES[(k + 1) % 12]


# ---------------------------------------------------------------- 胎元、命宮
def taiyuan(month_stem: str, month_branch: str) -> tuple[str, str]:
    """胎元：月干進一、月支進三。"""
    s = STEMS[(STEMS.index(month_stem) + 1) % 10]
    b = BRANCHES[(BRANCHES.index(month_branch) + 3) % 12]
    return s + b, nayin(s, b)


def minggong(year_stem: str, month_branch: str, hour_branch: str, *, past_zhongqi: bool = False) -> tuple[str, str]:
    """命宮：卯宮起正月逆數至生月，再從該宮起子時逆數至生時；宮干用五虎遁。
    生月以節為準（與多數排盤軟體一致）；past_zhongqi=True 表示依「中氣派」已過本月中氣、生月進一。"""
    m = (BRANCHES.index(month_branch) - 2) % 12 + 1          # 寅月=1
    if past_zhongqi:
        m = m % 12 + 1
    month_palace = (3 - (m - 1)) % 12
    life = (month_palace - BRANCHES.index(hour_branch)) % 12
    yin_stem = (2 + 2 * (STEMS.index(year_stem) % 5)) % 10
    s = STEMS[(yin_stem + (life - 2) % 12) % 10]     # 先對 12 取模：子、丑在寅之前
    return s + BRANCHES[life], nayin(s, BRANCHES[life])


# ---------------------------------------------------------------- 十二長生
_CS = ["長生", "沐浴", "冠帶", "臨官", "帝旺", "衰", "病", "死", "墓", "絕", "胎", "養"]
_CS_START = {"甲": 11, "丙": 2, "戊": 2, "庚": 5, "壬": 8, "乙": 6, "丁": 9, "己": 9, "辛": 0, "癸": 3}


def changsheng(day_stem: str, branch: str) -> str:
    """日主在某地支的十二長生：陽干順行、陰干逆行。"""
    start = _CS_START[day_stem]
    step = BRANCHES.index(branch) - start
    idx = step % 12 if STEM_YANG[STEMS.index(day_stem)] else (-step) % 12
    return _CS[idx]


# ---------------------------------------------------------------- 神煞
_SANHE_GROUP = {"寅": "寅午戌", "午": "寅午戌", "戌": "寅午戌", "申": "申子辰", "子": "申子辰", "辰": "申子辰",
                "巳": "巳酉丑", "酉": "巳酉丑", "丑": "巳酉丑", "亥": "亥卯未", "卯": "亥卯未", "未": "亥卯未"}
# 以三合局查的神煞：局 → 地支
_BY_GROUP = {
    "將星": {"寅午戌": "午", "申子辰": "子", "巳酉丑": "酉", "亥卯未": "卯"},
    "驛馬": {"寅午戌": "申", "申子辰": "寅", "巳酉丑": "亥", "亥卯未": "巳"},
    "桃花": {"寅午戌": "卯", "申子辰": "酉", "巳酉丑": "午", "亥卯未": "子"},
    "華蓋": {"寅午戌": "戌", "申子辰": "辰", "巳酉丑": "丑", "亥卯未": "未"},
    "劫煞": {"寅午戌": "亥", "申子辰": "巳", "巳酉丑": "寅", "亥卯未": "申"},
    "亡神": {"寅午戌": "巳", "申子辰": "亥", "巳酉丑": "申", "亥卯未": "寅"},
}
# 以天干查的神煞：干 → 地支們
_BY_STEM = {
    "天乙貴人": {"甲": "丑未", "戊": "丑未", "庚": "丑未", "乙": "子申", "己": "子申", "丙": "亥酉", "丁": "亥酉", "壬": "卯巳", "癸": "卯巳", "辛": "午寅"},
    "文昌貴人": {"甲": "巳", "乙": "午", "丙": "申", "丁": "酉", "戊": "申", "己": "酉", "庚": "亥", "辛": "子", "壬": "寅", "癸": "卯"},
    "太極貴人": {"甲": "子午", "乙": "子午", "丙": "卯酉", "丁": "卯酉", "戊": "辰戌丑未", "己": "辰戌丑未", "庚": "寅亥", "辛": "寅亥", "壬": "巳申", "癸": "巳申"},
    "天廚貴人": {"甲": "巳", "乙": "午", "丙": "巳", "丁": "午", "戊": "申", "己": "酉", "庚": "亥", "辛": "子", "壬": "寅", "癸": "卯"},
    "祿神": {"甲": "寅", "乙": "卯", "丙": "巳", "丁": "午", "戊": "巳", "己": "午", "庚": "申", "辛": "酉", "壬": "亥", "癸": "子"},
    "羊刃": {"甲": "卯", "乙": "辰", "丙": "午", "丁": "未", "戊": "午", "己": "未", "庚": "酉", "辛": "戌", "壬": "子", "癸": "丑"},   # 陰干羊刃另一派取「寅申巳亥」或不論
}
_GUCHEN = {"亥": "寅", "子": "寅", "丑": "寅", "寅": "巳", "卯": "巳", "辰": "巳", "巳": "申", "午": "申", "未": "申", "申": "亥", "酉": "亥", "戌": "亥"}
_GUASU = {"亥": "戌", "子": "戌", "丑": "戌", "寅": "丑", "卯": "丑", "辰": "丑", "巳": "辰", "午": "辰", "未": "辰", "申": "未", "酉": "未", "戌": "未"}
_SIFEI = {"寅卯辰": ("庚申", "辛酉"), "巳午未": ("壬子", "癸亥"), "申酉戌": ("甲寅", "乙卯"), "亥子丑": ("丙午", "丁巳")}
_KUIGANG = {"庚辰", "庚戌", "壬辰", "戊戌"}


_YANGREN_YINSHEN = {"乙": "寅", "丁": "申", "己": "申", "辛": "亥", "癸": "巳"}


def yangren_table(variant: str = "chenwei") -> dict[str, str]:
    t = dict(_BY_STEM["羊刃"])
    if variant == "yinshen":
        t.update(_YANGREN_YINSHEN)
    elif variant == "none":
        for k in ("乙", "丁", "己", "辛", "癸"):
            t[k] = ""
    return t


def shensha(pillars: dict[str, tuple[str, str]], *, yangren: str = "chenwei") -> list[dict]:
    """pillars: {"年": (干,支), "月":…, "日":…, "時":…}（時柱可缺）。
    回傳 [{name, where, basis}]，依據寫明「用哪一柱的干／支查到」。"""
    out: list[dict] = []
    names = list(pillars)
    ys, yb = pillars["年"]
    ds, db = pillars["日"]
    mb = pillars["月"][1]

    def hit(name: str, target: str, basis: str, skip: str | None = None):
        for k in names:
            if k == skip:
                continue
            if pillars[k][1] in target:
                out.append({"name": name, "where": f"{k}支{pillars[k][1]}", "basis": basis})

    for name, table in _BY_STEM.items():
        if name == "羊刃":
            table = yangren_table(yangren)
        for label, stem in (("年干", ys), ("日干", ds)):
            if name in ("祿神", "羊刃") and label == "年干":
                continue
            if not table[stem]:
                continue
            hit(name, table[stem], f"{label}{stem}見{table[stem]}")
    for name, table in _BY_GROUP.items():
        for label, b in (("年支", yb), ("日支", db)):
            t = table[_SANHE_GROUP[b]]
            hit(name, t, f"{label}{b}（{_SANHE_GROUP[b]}局）見{t}")
    hl = BRANCHES[(3 - BRANCHES.index(yb)) % 12]
    hit("紅鸞", hl, f"年支{yb}：卯起子年逆數", skip="年")
    hit("天喜", BRANCHES[(BRANCHES.index(hl) + 6) % 12], f"紅鸞{hl}的對宮", skip="年")
    hit("孤辰", _GUCHEN[yb], f"年支{yb}", skip="年")
    hit("寡宿", _GUASU[yb], f"年支{yb}", skip="年")
    tianyi = BRANCHES[(BRANCHES.index(mb) - 1) % 12]
    hit("天醫", tianyi, f"月支{mb}的前一位", skip="月")
    season = next(k for k in _SIFEI if mb in k)
    if ds + db in _SIFEI[season]:
        out.append({"name": "四廢", "where": f"日柱{ds}{db}", "basis": f"{season}月見{'、'.join(_SIFEI[season])}日"})
    if ds + db in _KUIGANG:
        out.append({"name": "魁罡", "where": f"日柱{ds}{db}", "basis": "庚辰、庚戌、壬辰、戊戌日"})
    # 去重（同名同位置）
    seen, uniq = set(), []
    for x in out:
        k = (x["name"], x["where"])
        if k not in seen:
            seen.add(k)
            uniq.append(x)
    return uniq


def shensha_for_branch(pillars: dict[str, tuple[str, str]], branch: str) -> list[str]:
    """某個大運／流年地支會帶來哪些神煞（只看以年支、日支、年干、日干起的那些）。"""
    ys, yb = pillars["年"]
    ds, db = pillars["日"]
    names = []
    for name, table in _BY_STEM.items():
        if name in ("祿神", "羊刃"):
            if branch in table[ds]:
                names.append(name)
        elif branch in table[ys] or branch in table[ds]:
            names.append(name)
    for name, table in _BY_GROUP.items():
        if branch in (table[_SANHE_GROUP[yb]], table[_SANHE_GROUP[db]]):
            names.append(name)
    hl = BRANCHES[(3 - BRANCHES.index(yb)) % 12]
    if branch == hl:
        names.append("紅鸞")
    if branch == BRANCHES[(BRANCHES.index(hl) + 6) % 12]:
        names.append("天喜")
    return list(dict.fromkeys(names))


# ---------------------------------------------------------------- 地支關係
_LIUHE = {frozenset(p) for p in [("子", "丑"), ("寅", "亥"), ("卯", "戌"), ("辰", "酉"), ("巳", "申"), ("午", "未")]}
_HE_RESULT = {frozenset("子丑"): "土", frozenset("寅亥"): "木", frozenset("卯戌"): "火", frozenset("辰酉"): "金", frozenset("巳申"): "水", frozenset("午未"): "土"}
_LIUCHONG = {frozenset(p) for p in [("子", "午"), ("丑", "未"), ("寅", "申"), ("卯", "酉"), ("辰", "戌"), ("巳", "亥")]}
_LIUHAI = {frozenset(p) for p in [("子", "未"), ("丑", "午"), ("寅", "巳"), ("卯", "辰"), ("申", "亥"), ("酉", "戌")]}
_LIUPO = {frozenset(p) for p in [("子", "酉"), ("丑", "辰"), ("寅", "亥"), ("卯", "午"), ("巳", "申"), ("未", "戌")]}
_ANHE = {frozenset("寅丑"): "土", frozenset("卯申"): "金", frozenset("午亥"): "木"}   # 藏干五合；另有子辰、巳酉等版本
_XING_PAIRS = {frozenset(p) for p in [("寅", "巳"), ("巳", "申"), ("申", "寅"), ("丑", "戌"), ("戌", "未"), ("未", "丑"), ("子", "卯")]}
_ZIXING = {"辰", "午", "酉", "亥"}
_SANHE = [("申子辰", "水"), ("亥卯未", "木"), ("寅午戌", "火"), ("巳酉丑", "金")]
_SANHUI = [("寅卯辰", "東方木"), ("巳午未", "南方火"), ("申酉戌", "西方金"), ("亥子丑", "北方水")]
_STEM_HE = {frozenset("甲己"): "土", frozenset("乙庚"): "金", frozenset("丙辛"): "水", frozenset("丁壬"): "木", frozenset("戊癸"): "火"}
_STEM_CHONG = {frozenset("甲庚"), frozenset("乙辛"), frozenset("壬丙"), frozenset("癸丁")}


def relations(slots: list[tuple[str, str, str]]) -> list[dict]:
    """slots: [(標籤, 干, 支)]，例如 [("年", "丙", "午"), ("月", …), …, ("大運", …), ("流年", …)]。
    回傳 [{kind, text, pillars}]；kind ∈ 合 沖 刑 害 破 會。"""
    out: list[dict] = []
    n = len(slots)
    for i in range(n):
        for j in range(i + 1, n):
            (la, sa, ba), (lb, sb, bb) = slots[i], slots[j]
            ps = [la, lb]
            key = frozenset((sa, sb))
            if sa != sb and key in _STEM_HE:
                out.append({"kind": "合", "text": f"{la}干{sa}與{lb}干{sb}天干五合（化{_STEM_HE[key]}）", "pillars": ps})
            if key in _STEM_CHONG:
                out.append({"kind": "沖", "text": f"{la}干{sa}與{lb}干{sb}天干相沖", "pillars": ps})
            bk = frozenset((ba, bb))
            if ba == bb:
                if ba in _ZIXING:
                    out.append({"kind": "刑", "text": f"{la}支{ba}與{lb}支{bb}自刑", "pillars": ps})
                continue
            if bk in _LIUHE:
                out.append({"kind": "合", "text": f"{la}支{ba}與{lb}支{bb}六合（化{_HE_RESULT[bk]}）", "pillars": ps})
            if bk in _LIUCHONG:
                out.append({"kind": "沖", "text": f"{la}支{ba}與{lb}支{bb}相沖", "pillars": ps})
            if bk in _XING_PAIRS:
                out.append({"kind": "刑", "text": f"{la}支{ba}與{lb}支{bb}相刑", "pillars": ps})
            if bk in _LIUHAI:
                out.append({"kind": "害", "text": f"{la}支{ba}與{lb}支{bb}相害", "pillars": ps})
            if bk in _LIUPO:
                out.append({"kind": "破", "text": f"{la}支{ba}與{lb}支{bb}相破", "pillars": ps})
            if bk in _ANHE:
                out.append({"kind": "合", "text": f"{la}支{ba}與{lb}支{bb}暗合（化{_ANHE[bk]}）", "pillars": ps})
    # 三合／三會（任三柱）
    branches = {(lab, b) for lab, _, b in slots}
    for trio, elem in _SANHE:
        got = [lab for lab, b in branches if b in trio]
        have = {b for lab, b in branches if b in trio}
        if len(have) == 3:
            out.append({"kind": "會", "text": f"{'、'.join(sorted(set(got)))}支{trio}三合{elem}局", "pillars": sorted(set(got))})
    for trio, elem in _SANHUI:
        got = [lab for lab, b in branches if b in trio]
        have = {b for lab, b in branches if b in trio}
        if len(have) == 3:
            out.append({"kind": "會", "text": f"{'、'.join(sorted(set(got)))}支{trio}三會{elem}", "pillars": sorted(set(got))})
    return out


# ---------------------------------------------------------------- 流月、流年
def liuyue(year: int, day_stem: str) -> list[dict]:
    """某年十二個月（立春起）的干支與十神，月干用五虎遁。"""
    from fortune.calendar.solar_terms import JIE_TO_BRANCH
    ys = (year - 4) % 10
    yin_stem = (2 + 2 * (ys % 5)) % 10
    order = ["立春", "驚蟄", "清明", "立夏", "芒種", "小暑", "立秋", "白露", "寒露", "立冬", "大雪", "小寒"]
    out = []
    for i, term in enumerate(order):
        b = JIE_TO_BRANCH[term]
        s = STEMS[(yin_stem + i) % 10]
        out.append({"term": term, "gz": s + BRANCHES[b], "stem_god": ten_god(day_stem, s),
                    "branch_god": ten_god(day_stem, HIDDEN_STEMS[BRANCHES[b]][0])})
    return out


# ---------------------------------------------------------------- 稱骨
_CG_YEAR = {
    "甲子": 12, "乙丑": 9, "丙寅": 6, "丁卯": 7, "戊辰": 12, "己巳": 5, "庚午": 9, "辛未": 8, "壬申": 7, "癸酉": 8,
    "甲戌": 15, "乙亥": 9, "丙子": 16, "丁丑": 8, "戊寅": 8, "己卯": 19, "庚辰": 12, "辛巳": 6, "壬午": 8, "癸未": 7,
    "甲申": 5, "乙酉": 15, "丙戌": 6, "丁亥": 16, "戊子": 15, "己丑": 7, "庚寅": 9, "辛卯": 12, "壬辰": 10, "癸巳": 7,
    "甲午": 15, "乙未": 6, "丙申": 5, "丁酉": 14, "戊戌": 14, "己亥": 9, "庚子": 7, "辛丑": 7, "壬寅": 9, "癸卯": 12,
    "甲辰": 8, "乙巳": 7, "丙午": 13, "丁未": 5, "戊申": 14, "己酉": 5, "庚戌": 9, "辛亥": 17, "壬子": 5, "癸丑": 7,
    "甲寅": 12, "乙卯": 8, "丙辰": 8, "丁巳": 6, "戊午": 19, "己未": 6, "庚申": 8, "辛酉": 16, "壬戌": 10, "癸亥": 6,
}
_CG_MONTH = [6, 7, 18, 9, 5, 16, 9, 15, 18, 8, 9, 5]                       # 正月…十二月
_CG_DAY = [5, 10, 8, 15, 16, 15, 8, 16, 8, 16, 9, 17, 8, 17, 10, 8, 9, 18, 5, 15, 10, 9, 8, 9, 15, 18, 7, 8, 16, 6]
_CG_HOUR = {"子": 16, "丑": 6, "寅": 7, "卯": 10, "辰": 9, "巳": 16, "午": 10, "未": 8, "申": 8, "酉": 9, "戌": 6, "亥": 6}


def chenggu(year_gz: str, lunar_month: int, lunar_day: int, hour_branch: str | None) -> dict:
    """袁天罡稱骨：年（干支）＋月（農曆）＋日（農曆）＋時（時辰）的骨重，單位「錢」。"""
    parts = {"year": _CG_YEAR[year_gz], "month": _CG_MONTH[lunar_month - 1], "day": _CG_DAY[lunar_day - 1],
             "hour": _CG_HOUR[hour_branch] if hour_branch else 0}
    total = sum(parts.values())
    liang, qian = divmod(total, 10)
    text = f"{'零一二三四五六七八九'[liang]}兩{'零一二三四五六七八九'[qian] + '錢' if qian else ''}"
    try:
        from fortune.bazi.chenggu_text import verse
        v = verse(total)
    except Exception:  # noqa: BLE001 — 評語表尚未就緒時不影響排盤
        v = ""
    return {"total_qian": total, "text": text, "parts": parts, "verse": v,
            "note": "骨重表與歌訣坊間版本略有出入；時辰不明時不計時辰重量" + ("（本盤時辰不明）" if not hour_branch else "")}


# ---------------------------------------------------------------- 組裝
@dataclass
class Extras:
    lunar: dict
    terms: dict
    taiyuan: dict
    minggong: dict | None
    pillar_extra: dict[str, dict]          # year/month/day/hour → {nayin, kongwang, changsheng, shensha}
    relations: list[dict]
    shensha: list[dict]
    dayun_extra: list[dict]                # 與 chart.dayun 對齊：{changsheng, shensha, liunian[]}
    liuyue: dict
    chenggu: dict


def build(chart, birth, today: date | None = None) -> Extras:
    """chart: BaziChart（engine.cast 的結果）。流派開關從 chart.school 讀。"""
    from lunardate import LunarDate
    from fortune.school import resolve as _resolve_school
    rules = (chart.school or _resolve_school()).bazi
    today = today or date.today()
    P = chart.pillars
    pil = {k[0]: (P[key].stem, P[key].branch) for key, k in (("year", "年"), ("month", "月"), ("day", "日"), ("hour", "時")) if key in P}
    ds = chart.day_master

    lz = LunarDate.from_solar_date(birth.birth_date.year, birth.birth_date.month, birth.birth_date.day)
    ygz = P["year"].gz
    cn_day = ["初一", "初二", "初三", "初四", "初五", "初六", "初七", "初八", "初九", "初十", "十一", "十二", "十三", "十四", "十五",
              "十六", "十七", "十八", "十九", "二十", "廿一", "廿二", "廿三", "廿四", "廿五", "廿六", "廿七", "廿八", "廿九", "三十"]
    cn_month = ["正", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"]
    zodiac = "鼠牛虎兔龍蛇馬羊猴雞狗豬"[BRANCHES.index(P["year"].branch)]
    hb = P["hour"].branch if "hour" in P else None
    lunar = {"year_gz": ygz, "zodiac": zodiac, "month": lz.month, "day": lz.day, "is_leap": lz.is_leap_month,
             "text": f"{ygz}年（{zodiac}）{'閏' if lz.is_leap_month else ''}{cn_month[lz.month - 1]}月{cn_day[lz.day - 1]}" + (f" {hb}時" if hb else "（時辰不明）")}

    t0, t1 = chart.term_window
    from fortune.calendar.solar_terms import TERM_NAMES
    prev_name = chart.month_term
    next_name = TERM_NAMES[(TERM_NAMES.index(prev_name) + 2) % 24]
    terms = {"prev": {"name": prev_name, "time": t0.isoformat(timespec="minutes")},
             "next": {"name": next_name, "time": t1.isoformat(timespec="minutes")}}

    ty_gz, ty_ny = taiyuan(P["month"].stem, P["month"].branch)
    mg = None
    if hb:
        past_zq = False
        if rules.minggong_month == "zhongqi":
            from fortune.calendar.solar_terms import TERM_NAMES, term_time
            zq_name = TERM_NAMES[(TERM_NAMES.index(chart.month_term) + 1) % 24]      # 本節之後的中氣
            zq_at = term_time(t0.year, zq_name, birth.tz)
            if zq_at < t0:                                                            # 跨年（小寒→大寒）
                zq_at = term_time(t0.year + 1, zq_name, birth.tz)
            past_zq = birth.clock_dt >= zq_at
        mg_gz, mg_ny = minggong(P["year"].stem, P["month"].branch, hb, past_zhongqi=past_zq)
        mg = {"gz": mg_gz, "nayin": mg_ny}

    sha = shensha(pil, yangren=rules.yangren_yin_stems)
    pillar_extra = {}
    for key, k in (("year", "年"), ("month", "月"), ("day", "日"), ("hour", "時")):
        if key not in P:
            continue
        p = P[key]
        pillar_extra[key] = {"nayin": nayin(p.stem, p.branch), "kongwang": kongwang(p.stem, p.branch),
                             "changsheng": changsheng(ds, p.branch),
                             "shensha": [x["name"] for x in sha if x["where"].startswith(f"{k}支") or x["where"].startswith(f"{k}柱")]}

    slots = [(k, s, b) for k, (s, b) in pil.items()]
    rel = relations(slots)

    dayun_extra = []
    for dy in chart.dayun:
        ln = []
        for y in range(dy["start_year"], dy["start_year"] + 10):
            s, b = STEMS[(y - 4) % 10], BRANCHES[(y - 4) % 12]
            ln.append({"year": y, "gz": s + b, "stem_god": ten_god(ds, s), "branch_god": ten_god(ds, HIDDEN_STEMS[b][0])})
        dayun_extra.append({"changsheng": changsheng(ds, dy["branch"]), "shensha": shensha_for_branch(pil, dy["branch"]), "liunian": ln})

    ly = {"year": today.year, "months": liuyue(today.year, ds)}
    cg_year = ygz if rules.chenggu_year == "lichun" else STEMS[(lz.year - 4) % 10] + BRANCHES[(lz.year - 4) % 12]
    cg = chenggu(cg_year, lz.month, lz.day, hb)
    return Extras(lunar=lunar, terms=terms, taiyuan={"gz": ty_gz, "nayin": ty_ny}, minggong=mg, pillar_extra=pillar_extra,
                  relations=rel, shensha=sha, dayun_extra=dayun_extra, liuyue=ly, chenggu=cg)
