"""八字合盤（4-5）— 兩張盤並排，比對日主五行、天干五合、地支合沖刑。
每一項結論都能追回兩張盤的哪一格（evidence 帶 who + fact_id）。"""

from __future__ import annotations

from datetime import date
from typing import Any

from pydantic import BaseModel, Field

from fortune.bazi.engine import BRANCH_ELEM, BRANCHES, KE, LIUCHONG, LIUHE, SANHE, SHENG, STEM_ELEM, STEM_HE, STEMS, XING
from fortune.birth import BirthInput
from fortune.chart import ChartData, bazi_chart


class SynastryItem(BaseModel):
    kind: str                     # 合 | 沖 | 生 | 剋 | 同
    title: str
    text: str
    evidence: list[dict[str, str]] = Field(default_factory=list)


class Synastry(BaseModel):
    a: ChartData
    b: ChartData
    items: list[SynastryItem]
    a_ziwei: ChartData | None = None
    b_ziwei: ChartData | None = None
    ziwei_items: list[SynastryItem] = Field(default_factory=list)
    score: dict[str, int]
    summary: str
    reading: str = ""


_PILLAR_ZH = {"year": "年柱", "month": "月柱", "day": "日柱", "hour": "時柱"}


def _pillars(c: ChartData) -> dict[str, tuple[str, str]]:
    return {p["name"][0]: (p["stem"], p["branch"]) for p in c.payload["pillars"]}   # 年/月/日/時 → (干, 支)


def compare(a: ChartData, b: ChartData) -> list[SynastryItem]:
    na, nb = a.birth.get("name") or "甲方", b.birth.get("name") or "乙方"
    pa, pb = _pillars(a), _pillars(b)
    items: list[SynastryItem] = []

    # 1. 日主五行生剋
    da, db = pa["日"][0], pb["日"][0]
    ea, eb = STEM_ELEM[STEMS.index(da)], STEM_ELEM[STEMS.index(db)]
    ev = [{"who": "a", "fact_id": "bazi.day_master"}, {"who": "b", "fact_id": "bazi.day_master"}]
    if ea == eb:
        items.append(SynastryItem(kind="同", title="日主同氣", text=f"{na}日主{da}{ea}、{nb}日主{db}{eb}，同屬{ea}，頻率相近，容易理解彼此，也容易在同一件事上固執。", evidence=ev))
    elif SHENG[ea] == eb:
        items.append(SynastryItem(kind="生", title="日主相生", text=f"{na}日主{da}{ea}生{nb}日主{db}{eb}：{na}較常付出、照顧對方。", evidence=ev))
    elif SHENG[eb] == ea:
        items.append(SynastryItem(kind="生", title="日主相生", text=f"{nb}日主{db}{eb}生{na}日主{da}{ea}：{nb}較常付出、照顧對方。", evidence=ev))
    elif KE[ea] == eb:
        items.append(SynastryItem(kind="剋", title="日主相剋", text=f"{na}日主{da}{ea}剋{nb}日主{db}{eb}：{na}在關係裡較強勢，需留意壓迫感。", evidence=ev))
    else:
        items.append(SynastryItem(kind="剋", title="日主相剋", text=f"{nb}日主{db}{eb}剋{na}日主{da}{ea}：{nb}在關係裡較強勢，需留意壓迫感。", evidence=ev))

    # 2. 日干五合（最直接的緣分訊號）
    key = tuple(sorted((da, db)))
    if key in STEM_HE:
        items.append(SynastryItem(kind="合", title="日干五合", text=f"{na}的{da}與{nb}的{db}天干五合（合{STEM_HE[key]}），彼此吸引、互補明顯。", evidence=ev))

    # 3. 地支關係：日支對日支最重要，其餘柱次之
    def branch_items(ka: str, kb: str, weight: str):
        ba, bb = pa[ka][1], pb[kb][1]
        evb = [{"who": "a", "fact_id": f"bazi.pillar.{_KEY[ka]}"}, {"who": "b", "fact_id": f"bazi.pillar.{_KEY[kb]}"}]
        pair = tuple(sorted((ba, bb)))
        label = f"{na}{ka}支{ba}與{nb}{kb}支{bb}"
        if pair in LIUHE or (pair[1], pair[0]) in LIUHE:
            items.append(SynastryItem(kind="合", title=f"{ka}支六合{weight}", text=f"{label}六合，相處自然、容易合拍。", evidence=evb))
        elif pair in LIUCHONG or (pair[1], pair[0]) in LIUCHONG:
            items.append(SynastryItem(kind="沖", title=f"{ka}支相沖{weight}", text=f"{label}相沖，{'日支代表配偶宮，' if ka == kb == '日' else ''}容易在生活節奏上起摩擦，要靠溝通化解。", evidence=evb))
        elif (ba, bb) in XING or (bb, ba) in XING:
            items.append(SynastryItem(kind="沖", title=f"{ka}支相刑{weight}", text=f"{label}相刑，互相挑剔的機率高。", evidence=evb))
        else:
            for x, y, z, elem in SANHE:
                if {ba, bb} <= {x, y, z} and ba != bb:
                    items.append(SynastryItem(kind="合", title=f"{ka}支半三合{weight}", text=f"{label}半三合{elem}局，目標一致時合作愉快。", evidence=evb))
                    break

    branch_items("日", "日", "（配偶宮）")
    branch_items("年", "年", "")
    branch_items("月", "月", "")
    if "時" in pa and "時" in pb:
        branch_items("時", "時", "")

    # 4. 喜用互補：對方日主五行是不是我的喜用
    fa = set(next(f.value for f in a.facts if f.id == "bazi.favourable").split("、"))
    fb = set(next(f.value for f in b.facts if f.id == "bazi.favourable").split("、"))
    evf = [{"who": "a", "fact_id": "bazi.favourable"}, {"who": "b", "fact_id": "bazi.day_master"}]
    if eb in fa:
        items.append(SynastryItem(kind="生", title="對方是你的喜用", text=f"{nb}的日主{eb}正是{na}的喜用五行，相處對{na}有補益。", evidence=evf))
    evf2 = [{"who": "b", "fact_id": "bazi.favourable"}, {"who": "a", "fact_id": "bazi.day_master"}]
    if ea in fb:
        items.append(SynastryItem(kind="生", title="你是對方的喜用", text=f"{na}的日主{ea}正是{nb}的喜用五行，相處對{nb}有補益。", evidence=evf2))
    return items


_KEY = {"年": "year", "月": "month", "日": "day", "時": "hour"}


def compare_ziwei(a: ChartData, b: ChartData) -> list[SynastryItem]:
    """紫微合盤三條通論：對方命宮主星與我夫妻宮、生年四化互入、夫妻宮對照。"""
    na, nb = a.birth.get("name") or "甲方", b.birth.get("name") or "乙方"
    pa = {p["name"]: p for p in a.payload["palaces"]}
    pb = {p["name"]: p for p in b.payload["palaces"]}
    items: list[SynastryItem] = []

    def opp(pal: dict, name: str) -> dict:
        br = pal[name]["branch"]
        from fortune.ziwei.engine import BRANCHES
        ob = BRANCHES[(BRANCHES.index(br) + 6) % 12]
        return next(p for p in pal.values() if p["branch"] == ob)

    # 1. 對方命宮主星是否落在我夫妻宮（或其對宮）
    for me, other, pm, po, who in ((na, nb, pa, pb, ("a", "b")), (nb, na, pb, pa, ("b", "a"))):
        my_fuqi = set(pm["夫妻宮"]["major"]) | set(opp(pm, "夫妻宮")["major"])
        hit = [s for s in po["命宮"]["major"] if s in my_fuqi]
        if hit:
            items.append(SynastryItem(kind="合", title=f"{other}的命宮主星入{me}的夫妻宮",
                                      text=f"{other}命宮主星{'、'.join(hit)}，正是{me}夫妻宮（含對宮）的主星，傳統視為容易把對方當成「理想中的伴侶樣子」。",
                                      evidence=[{"who": who[1], "fact_id": "ziwei.palace.命宮"}, {"who": who[0], "fact_id": "ziwei.palace.夫妻宮"}]))
    # 2. 生年四化互入：我的化祿／化忌星落在對方命宮或夫妻宮
    for me, other, cm, po, who in ((na, nb, a, pb, ("a", "b")), (nb, na, b, pa, ("b", "a"))):
        for hua, kind, word in (("化祿", "生", "帶來緣分與助益"), ("化忌", "剋", "容易成為牽掛或摩擦的來源")):
            f = cm.fact(f"ziwei.hua.{hua}")
            if not f:
                continue
            star = f.value.split("（")[0]
            for pname in ("命宮", "夫妻宮"):
                if star in po[pname]["major"] + po[pname]["lucky"]:
                    items.append(SynastryItem(kind=kind, title=f"{me}的{hua}入{other}的{pname}",
                                              text=f"{me}生年{hua}在{star}，這顆星坐在{other}的{pname}，{word}。",
                                              evidence=[{"who": who[0], "fact_id": f"ziwei.hua.{hua}"}, {"who": who[1], "fact_id": f"ziwei.palace.{pname}"}]))
    # 3. 兩人夫妻宮主星性質對照（煞星數）
    sa, sb = len(pa["夫妻宮"]["unlucky"]), len(pb["夫妻宮"]["unlucky"])
    kind = "同" if (sa == 0) == (sb == 0) else "沖"
    items.append(SynastryItem(kind=kind, title="夫妻宮對照",
                              text=f"{na}夫妻宮{'、'.join(pa['夫妻宮']['major']) or '空宮'}（煞星 {sa}）；{nb}夫妻宮{'、'.join(pb['夫妻宮']['major']) or '空宮'}（煞星 {sb}）。"
                                   + ("兩人對感情的期待型態相近。" if kind == "同" else "一方較能耐磨、一方較求平順，節奏要互相遷就。"),
                              evidence=[{"who": "a", "fact_id": "ziwei.palace.夫妻宮"}, {"who": "b", "fact_id": "ziwei.palace.夫妻宮"}]))
    return items


def synastry(a_in: BirthInput, b_in: BirthInput, *, today: date | None = None, school=None) -> Synastry:
    a, b = bazi_chart(a_in, today=today, school=school), bazi_chart(b_in, today=today, school=school)
    items = compare(a, b)
    az = bz = None
    zitems: list[SynastryItem] = []
    try:
        from fortune.chart import ziwei_chart
        az, bz = ziwei_chart(a_in, today=today, school=school), ziwei_chart(b_in, today=today, school=school)
        zitems = compare_ziwei(az, bz)
    except Exception:  # noqa: BLE001 — 任一方缺時辰就不做紫微合盤
        az = bz = None
    harmony = sum(1 for i in items + zitems if i.kind in ("合", "生", "同"))
    tension = sum(1 for i in items + zitems if i.kind in ("沖", "剋"))
    na, nb = a_in.name or "甲方", b_in.name or "乙方"
    summary = f"{na}與{nb}：契合 {harmony} 項、張力 {tension} 項，淨值 {harmony - tension}。"
    s = Synastry(a=a, b=b, items=items, a_ziwei=az, b_ziwei=bz, ziwei_items=zitems,
                 score={"harmony": harmony, "tension": tension, "net": harmony - tension}, summary=summary)
    s.reading = _reading(s)
    return s


def _reading(s: Synastry) -> str:
    from fortune.reading import llm
    from fortune.reading.persona import load_persona
    persona = load_persona()
    facts = "\n".join(f"- [{i.kind}] {i.title}：{i.text}" for i in s.items + s.ziwei_items)
    sysmsg = f"你是命理師「{persona.name}」。{persona.style}\n只根據下面列出的合盤比對結果說話，不可自行推算；不談醫療、投資、法律、生死；不用「保證」「一定」。用繁體中文，300 字內，分「契合」「張力」「相處建議」三小段，段名後接全形冒號、各段換行；不要用 Markdown（不要 ** 或 #）。"
    user = f"{s.summary}\n\n比對結果：\n{facts}"
    def fallback() -> str:
        allitems = s.items + s.ziwei_items
        good = "；".join(i.text for i in allitems if i.kind in ("合", "生", "同")) or "無"
        bad = "；".join(i.text for i in allitems if i.kind in ("沖", "剋")) or "無"
        return f"（離線示範）{s.summary}\n契合：{good}\n張力：{bad}\n相處建議：張力處靠溝通與分工化解，契合處多加運用。\n{persona.closing}"
    import re
    text = llm.complete(sysmsg, user, fallback=fallback, max_tokens=800).text
    text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)          # 模型偶爾還是會加粗，拿掉
    return re.sub(r"(?<!\n)(契合|張力|相處建議)[：:]", r"\n\1：", text).strip()
