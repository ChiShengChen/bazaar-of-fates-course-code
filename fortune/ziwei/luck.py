"""紫微大限 → 流年（看流年的核心）：大限四化與落宮、每宮十二長生與博士十二神、
流年太歲宮、流年四化與落宮、流曜（流祿／流羊／流陀／流魁／流鉞／流昌／流馬）、歲前／將前十二神。
規則移植自主專案（bazaar-of-fates）的 ziwei_ext.luck；安星以本引擎的 ZiweiChart 為準。
"""

from __future__ import annotations

from datetime import date

from fortune.ziwei.engine import BRANCHES, HUA_NAMES, STEMS, ZiweiChart, sihua_for

_CS_START = {"水": 8, "木": 11, "金": 5, "土": 8, "火": 2}      # 十二長生的長生宮，依五行局
CHANGSHENG = ["長生", "沐浴", "冠帶", "臨官", "帝旺", "衰", "病", "死", "墓", "絕", "胎", "養"]
BOSHI = ["博士", "力士", "青龍", "小耗", "將軍", "奏書", "飛廉", "喜神", "病符", "大耗", "伏兵", "官府"]
SUIQIAN = ["太歲", "晦氣", "喪門", "貫索", "官符", "小耗", "大耗", "龍德", "白虎", "天德", "弔客", "病符"]
JIANGQIAN = ["將星", "攀鞍", "歲驛", "息神", "華蓋", "劫煞", "災煞", "天煞", "指背", "咸池", "月煞", "亡神"]
_SANHE = {0: 0, 4: 0, 8: 0, 2: 1, 6: 1, 10: 1, 5: 2, 9: 2, 1: 2, 11: 3, 3: 3, 7: 3}   # 申子辰／寅午戌／巳酉丑／亥卯未
_JIANGXING = [0, 6, 9, 3]
_LUCUN = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0]
_KUI = [1, 0, 11, 11, 1, 0, 1, 6, 3, 3]
_YUE = [7, 8, 9, 9, 7, 8, 7, 2, 5, 5]
_LIUCHANG = [5, 6, 8, 9, 8, 9, 11, 0, 2, 3]
_TIANMA = [2, 8, 11, 5]


def build(z: ZiweiChart, male: bool | None, today: date, sihua_variant: str = "standard", xusui: int | None = None) -> dict | None:
    """回傳 {start_age, forward, age_now, daxian[12]{…, liunian[10]}}；性別未填回 None（方向無法定）。
    同時在 z.palaces 上補 changsheng / boshi。"""
    life_b = BRANCHES.index(z.life_branch)
    elem = z.five_class[0]
    lunar_year = z.lunar["year"]
    ys, yb = (lunar_year - 4) % 10, (lunar_year - 4) % 12
    by_branch = {BRANCHES.index(p.branch): p for p in z.palaces}
    star_palace = {s: p.name for p in z.palaces for s in p.major + p.lucky + p.unlucky + p.other}
    if male is None:
        return None
    forward = (ys % 2 == 0 and male) or (ys % 2 == 1 and not male)
    sign = 1 if forward else -1
    cs0 = _CS_START[elem]
    lucun = next((BRANCHES.index(p.branch) for p in z.palaces if "祿存" in p.other), _LUCUN[ys])
    for b, p in by_branch.items():
        p.changsheng = CHANGSHENG[(sign * (b - cs0)) % 12]      # type: ignore[attr-defined]
        p.boshi = BOSHI[(sign * (b - lucun)) % 12]               # type: ignore[attr-defined]

    age_now = xusui if xusui is not None else today.year - lunar_year + 1
    start = z.ju
    daxian = []
    for k in range(12):
        b = (life_b + sign * k) % 12
        pal = by_branch[b]
        a0 = start + 10 * k
        y0 = lunar_year + a0 - 1
        row = sihua_for(pal.stem, sihua_variant)
        liunian = []
        for a in range(a0, a0 + 10):
            yr = lunar_year + a - 1
            lys, lyb = (yr - 4) % 10, (yr - 4) % 12
            lrow = sihua_for(STEMS[lys], sihua_variant)
            lu = _LUCUN[lys]
            jg = _SANHE[lyb]
            liunian.append({
                "year": yr, "age": a, "gz": STEMS[lys] + BRANCHES[lyb],
                "taisui_palace": by_branch[lyb].name, "branch": BRANCHES[lyb],
                "sihua": [f"{lrow[i]}{HUA_NAMES[i]}" for i in range(4)],
                "sihua_landing": {HUA_NAMES[i]: star_palace.get(lrow[i], "?") for i in range(4)},
                "flow_stars": {"流祿": BRANCHES[lu], "流羊": BRANCHES[(lu + 1) % 12], "流陀": BRANCHES[(lu - 1) % 12],
                               "流魁": BRANCHES[_KUI[lys]], "流鉞": BRANCHES[_YUE[lys]], "流昌": BRANCHES[_LIUCHANG[lys]],
                               "流馬": BRANCHES[_TIANMA[jg]]},
                "suiqian": {BRANCHES[(lyb + i) % 12]: SUIQIAN[i] for i in range(12)},
                "jiangqian": {BRANCHES[(_JIANGXING[jg] + i) % 12]: JIANGQIAN[i] for i in range(12)},
                "current": yr == today.year,
            })
        daxian.append({
            "index": k, "palace": pal.name, "branch": pal.branch, "stem": pal.stem, "gz": pal.stem + pal.branch,
            "ages": [a0, a0 + 9], "years": [y0, y0 + 9], "changsheng": pal.changsheng,   # type: ignore[attr-defined]
            "sihua": [f"{row[i]}{HUA_NAMES[i]}" for i in range(4)],
            "sihua_landing": {HUA_NAMES[i]: star_palace.get(row[i], "?") for i in range(4)},
            "current": a0 <= age_now <= a0 + 9,
            "liunian": liunian,
        })
    return {"start_age": start, "forward": forward, "age_now": age_now, "daxian": daxian}


def iztro_enrich(d: date, hour_branch: int, male: bool, late_zi_next_day: bool = False) -> dict | None:
    """x-iztro（MIT）的加值層：廟旺利陷、雜曜、格局。沒裝就回 None；星位以本引擎為準（互證測試已確認一致）。"""
    try:
        from x_iztro import Astro
    except Exception:  # noqa: BLE001
        return None
    try:
        idx = 12 if (late_zi_next_day and hour_branch == 0) else hour_branch
        chart = Astro().by_solar(f"{d.year}-{d.month}-{d.day}", idx, "male" if male else "female", language="zh-TW")
        palaces = {}
        for pal in chart.palaces:
            palaces[pal.earthly_branch] = {
                "brightness": {st.name: (st.brightness or "") for st in list(pal.major_stars) + list(pal.minor_stars)},
                "adjective_stars": [st.name for st in getattr(pal, "adjective_stars", [])],
            }
        patterns = []
        try:
            for h in chart.patterns():
                patterns.append({"name": h.name, "palace": getattr(h, "palace_name", ""), "broken": bool(getattr(h, "broken", False)),
                                 "stars": [st.name for st in getattr(h, "stars", [])]})
        except Exception:  # noqa: BLE001
            pass
        return {"palaces": palaces, "patterns": patterns, "source": "x-iztro（MIT，iztro 的 Rust 移植）"}
    except Exception:  # noqa: BLE001
        return None
