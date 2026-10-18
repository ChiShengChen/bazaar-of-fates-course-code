"""八字旺衰 v2（可稽核）— 月令旺相休囚死、藏干通根（本／中／餘氣加權，月令×1.5、日支×1.2）、透干，
算出生扶／耗洩比例 → 身強／身弱／中和／疑從格；再選扶抑用神、調候（冬火夏水）、月令格局。
每一項貢獻都列進 lines，解讀與畫面都能逐條查。規則移植自主專案（bazaar-of-fates）的 strength_analysis。

v1（score_v1）是課程用的簡化計分法，保留作對照；流派開關 bazi.strength_method 切換。
"""

from __future__ import annotations

from fortune.bazi.engine import BRANCH_ELEM, BRANCHES, HIDDEN_STEMS, KE, SHENG, STEM_ELEM, STEM_YANG, STEMS, ten_god

_GEN_OF = {v: k for k, v in SHENG.items()}      # 生我者
_CTRL_OF = {v: k for k, v in KE.items()}        # 剋我者
_ROLE_W = {"year": 1.0, "month": 1.5, "day": 1.2, "hour": 1.0}
_POS_W = [1.0, 0.5, 0.3]                        # 藏干 本氣／中氣／餘氣
_ROLE_ZH = {"year": "年", "month": "月", "day": "日", "hour": "時"}


def _category(dm_elem: str, elem: str) -> str:
    if elem == dm_elem:
        return "比劫"
    if SHENG[elem] == dm_elem:
        return "印"
    if SHENG[dm_elem] == elem:
        return "食傷"
    if KE[dm_elem] == elem:
        return "財"
    return "官殺"


def analyze(pillars: dict) -> dict:
    """pillars: engine.BaziChart.pillars（year/month/day/[hour] → Pillar）。"""
    dm = pillars["day"].stem
    de = STEM_ELEM[STEMS.index(dm)]
    support = {"比劫": 0.0, "印": 0.0}
    drain = {"食傷": 0.0, "財": 0.0, "官殺": 0.0}
    lines: list[str] = []

    mb = pillars["month"].branch
    me = BRANCH_ELEM[BRANCHES.index(mb)]
    state, w = (("旺", 3.0) if me == de else ("相", 2.0) if SHENG[me] == de else ("休", -1.0) if SHENG[de] == me
                else ("囚", -2.0) if KE[de] == me else ("死", -3.0))
    lines.append(f"月令 {mb}（{me}）：日主 {dm}{de} 得令為「{state}」（{w:+.0f}）")
    if w > 0:
        support["比劫" if me == de else "印"] += w
    else:
        drain[_category(de, me)] += -w

    has_root = False
    for role in ("year", "month", "day", "hour"):
        if role not in pillars:
            continue
        b = pillars[role].branch
        for i, h in enumerate(HIDDEN_STEMS[b]):
            he = STEM_ELEM[STEMS.index(h)]
            wt = round(_ROLE_W[role] * _POS_W[i], 2)
            cat = _category(de, he)
            if cat in support:
                support[cat] += wt
                has_root = has_root or cat == "比劫" or (cat == "印" and i == 0)
                lines.append(f"{_ROLE_ZH[role]}支 {b} 藏 {h}（{cat}根 +{wt}）")
            else:
                drain[cat] += round(wt * 0.8, 2)
                lines.append(f"{_ROLE_ZH[role]}支 {b} 藏 {h}（{cat} −{round(wt * 0.8, 2)}）")
    for role in ("year", "month", "hour"):
        if role not in pillars:
            continue
        st = pillars[role].stem
        se = STEM_ELEM[STEMS.index(st)]
        cat = _category(de, se)
        if cat in support:
            support[cat] += 1.0
            lines.append(f"{_ROLE_ZH[role]}干 {st} 透（{cat} +1.0）")
        else:
            drain[cat] += 1.0
            lines.append(f"{_ROLE_ZH[role]}干 {st} 透（{cat} −1.0）")

    s_sum, d_sum = sum(support.values()), sum(drain.values())
    ratio = s_sum / (s_sum + d_sum) if s_sum + d_sum else 0.5
    cong = (not has_root) and ratio < 0.22
    if cong:
        strong, label = False, "身極弱無根・疑從格（從勢）"
    elif ratio >= 0.58:
        strong, label = True, "身強（喜洩剋耗）"
    elif ratio <= 0.42:
        strong, label = False, "身弱（喜生扶）"
    else:
        strong = ratio >= 0.5
        label = "中和偏強（喜洩剋耗）" if strong else "中和偏弱（喜生扶）"

    shi_shang, cai, guan_sha = SHENG[de], KE[de], _CTRL_OF[de]
    yin, bi = _GEN_OF[de], de
    if cong:
        top = max(drain, key=drain.get)
        fav = {"食傷": [shi_shang, cai], "財": [cai, shi_shang], "官殺": [guan_sha, cai]}[top]
        avoid = [bi, yin]
        primary = fav[0]
        why = f"從{top}：順其勢，喜 {'、'.join(fav)}，忌比劫印綬生扶"
    elif strong:
        fav, avoid = [shi_shang, cai, guan_sha], [bi, yin]
        primary = guan_sha if support["比劫"] >= support["印"] else cai
        why = ("比劫旺 → 以官殺制身為先" if primary == guan_sha else "印旺身強 → 以財制印為先") + "；食傷洩秀、財星耗身皆宜"
    else:
        fav, avoid = [yin, bi], [guan_sha, cai, shi_shang]
        top = max(drain, key=drain.get)
        primary = bi if top == "財" else yin
        why = {"財": "財多身弱 → 以比劫幫身奪財為先", "官殺": "官殺旺 → 以印化殺生身為先", "食傷": "食傷洩氣 → 以印制食傷生身為先"}[top]

    mbi = BRANCHES.index(mb)
    tiaohou = "火" if mbi in (11, 0, 1) else "水" if mbi in (5, 6, 7) else None
    tiaohou_note = ({"火": "生於冬月（亥子丑）寒凍，調候喜火暖局", "水": "生於夏月（巳午未）炎燥，調候喜水潤局"}[tiaohou]
                    if tiaohou else "生於春秋，調候不急")

    ben = HIDDEN_STEMS[mb][0]
    god = ten_god(dm, ben)
    pattern = ("建祿格" if god == "比肩" else (("羊刃格" if STEM_YANG[STEMS.index(dm)] else "月劫格") if god == "劫財" else f"{god}格"))
    return {
        "method": "score_v2", "label": label, "strong": strong, "cong": cong, "ratio": round(ratio, 2),
        "support": round(s_sum, 2), "drain": round(d_sum, 2),
        "support_by": {k: round(v, 2) for k, v in support.items()}, "drain_by": {k: round(v, 2) for k, v in drain.items()},
        "favourable": sorted(set(fav)), "avoid": sorted(set(avoid)),
        "yongshen": primary, "yongshen_why": why,
        "tiaohou": tiaohou, "tiaohou_note": tiaohou_note,
        "pattern": pattern, "pattern_note": f"月令 {mb} 本氣 {ben} 為日主之{god} → {pattern}",
        "notes": lines,
        "disclaimer": "旺衰為可稽核的計分法（月令旺相休囚死、藏干加權通根、透干），流派間仍有差異",
    }
