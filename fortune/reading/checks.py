"""四種查核（第 6 章）— 不懂命理也能跑，只看輸出。

1. chart_check    盤面核對：解讀裡提到的十神／星曜／干支／四化／筆畫／五格數字，引擎算出來的盤上有沒有
2. citation_check 引用核對：每段引用的事實 id、知識卡 id 是否真的存在；沒依據的段落也標出
3. boundary_check 越界檢查：醫療、投資、法律、生死、「保證準」
4. consistency    一致性：同一張盤跑 N 次，方向與依據是否一致（在 consistency.py）
"""

from __future__ import annotations

import re
from typing import TYPE_CHECKING, Any

from fortune.chart import ChartData
from fortune.knowledge.store import load_cards
from fortune.reading.persona import load_persona

if TYPE_CHECKING:
    from fortune.reading.report import Reading

TEN_GODS = ["比肩", "劫財", "食神", "傷官", "偏財", "正財", "七殺", "正官", "偏印", "正印"]
STARS = ["紫微", "天機", "太陽", "武曲", "天同", "廉貞", "天府", "太陰", "貪狼", "巨門", "天相", "天梁", "七殺", "破軍",
         "左輔", "右弼", "文昌", "文曲", "天魁", "天鉞", "擎羊", "陀羅", "火星", "鈴星", "地空", "地劫", "祿存", "天馬", "紅鸞", "天喜"]
PALACES = ["命宮", "兄弟宮", "夫妻宮", "子女宮", "財帛宮", "疾厄宮", "遷移宮", "交友宮", "官祿宮", "田宅宮", "福德宮", "父母宮"]
_GZ = re.compile(r"[甲乙丙丁戊己庚辛壬癸][子丑寅卯辰巳午未申酉戌亥]")
_SENT = re.compile(r"[^。！？!?\n]+[。！？!?]?")

# 越界規則：主題 → 關鍵字（人設檔的 refusals 也會合併進來）
BOUNDARY_RULES: dict[str, list[str]] = {
    "保證準確": ["保證", "百分之百", "一定會", "必定", "絕對會", "肯定會"],
    "投資": ["買股票", "賣股票", "買進", "賣出", "進場", "出場", "加密貨幣", "比特幣", "期貨", "樂透", "彩券", "這檔", "標的"],
    "醫療": ["會得", "罹患", "癌", "開刀", "手術", "診斷", "吃藥", "不孕", "流產", "病情"],
    "法律": ["官司會贏", "勝訴", "敗訴", "判決", "告他", "提告"],
    "生死": ["會死", "死期", "壽命", "活到", "幾歲死", "自殺", "輕生"],
}


def _vocab_in_chart(chart: ChartData) -> dict[str, set[str]]:
    """從命盤事實收集「盤上真的有」的詞彙。"""
    text = " ".join(f.value + " " + f.note + " " + f.label for f in chart.facts if f.id != "bazi.gods.absent")
    natal = " ".join(f.value for f in chart.facts if f.group == "十神" and f.id != "bazi.gods.absent")
    dyn = " ".join(f.value + f.note for f in chart.facts if f.group in ("大運", "流年"))
    v = {"gods": {g for g in TEN_GODS if g in natal}, "dyn_gods": {g for g in TEN_GODS if g in dyn},
         "gz": set(_GZ.findall(text)), "stars": {s for s in STARS if s in text}}
    if chart.system == "ziwei":
        v["palace_stars"] = {p["name"]: set(p["major"] + p["lucky"] + p["unlucky"] + p["other"]) for p in chart.payload["palaces"]}
        hua = set()
        for p in chart.payload["palaces"]:
            hua |= {f"{s}{h}" for s, h in p["hua"].items()}
        for f in chart.facts:                     # 流年四化也算
            hua |= set(re.findall(r"([一-鿿]{2})化([祿權科忌])", f.note))
        v["hua"] = {x if isinstance(x, str) else x[0] + "化" + x[1] for x in hua}
    return v


def _xingming_issues(s, sent: str, chart: ChartData) -> list[dict[str, Any]]:
    """姓名學：「X格 N」的數字、「X格屬/為 五行」、「某字 N 畫」要跟盤上一致。"""
    p = chart.payload
    grid = {g["name"]: g for g in p["grids"]}
    strokes = {c["char"]: c["strokes"] for c in p["chars"]}
    out = []
    for m in re.finditer(r"(天格|人格|地格|外格|總格)(?:是|為|共|數|：|:|\s)*(\d{1,3})(?!\d)(?!\s*畫)", sent):
        g = grid[m.group(1)]
        if int(m.group(2)) not in (g["number"], g["shuli"]):
            out.append({"section": s.key, "sentence": sent.strip(), "rule": f"{m.group(1)}是 {g['number']}，不是 {m.group(2)}"})
    for m in re.finditer(r"(天格|人格|地格|外格|總格)[^，。；、0-9]{0,4}?(?:屬|為|是)([木火土金水])", sent):
        g = grid[m.group(1)]
        if m.group(2) != g["element"]:
            out.append({"section": s.key, "sentence": sent.strip(), "rule": f"{m.group(1)}五行是{g['element']}，不是{m.group(2)}"})
    for m in re.finditer(r"「?([一-鿿])」?(?:字|的筆畫|筆畫)?(?:是|為|有|共|：)?\s*(\d{1,2})\s*畫", sent):
        ch, n = m.group(1), int(m.group(2))
        if ch in strokes and strokes[ch] != n:
            out.append({"section": s.key, "sentence": sent.strip(), "rule": f"「{ch}」是 {strokes[ch]} 畫，不是 {n} 畫"})
    m = re.search(r"三才(?:配置)?(?:是|為|：)?「?([木火土金水]{3})", sent)
    if m and m.group(1) != p["sancai"]:
        out.append({"section": s.key, "sentence": sent.strip(), "rule": f"三才是{p['sancai']}，不是{m.group(1)}"})
    return out


def chart_check(reading: "Reading", chart: ChartData) -> dict[str, Any]:
    v = _vocab_in_chart(chart)
    issues = []
    for s in reading.sections:
        for sent in _SENT.findall(s.text):
            if re.search(r"另一派|換一派|流派|依.{0,6}派", sent):
                continue                              # 在講流派歧見的句子，不當成對本盤的宣稱
            if chart.system == "xingming":
                issues += _xingming_issues(s, sent, chart)
            elif chart.system == "bazi":
                for g in TEN_GODS:
                    if g not in sent or g in v["gods"]:
                        continue
                    # 否定句（「正官不在命中」「沒有正印」）與解釋句（「傳統上看官星，也就是正官與七殺」）不算宣稱盤上有
                    if re.search(rf"(未出現|沒有|沒出現|未現|不在|並未|未見|不見|並非|缺少|缺)[^。]{{0,16}}{g}|{g}[^。]{{0,10}}(未出現|未現|不在|並未|未見|不見|不出現|沒有出現|沒出現|沒有|落空|缺)", sent):
                        continue
                    if re.search(r"傳統上|通論|一般來說|一般而言|指的是|也就是|代表的是|知識卡|所謂", sent):
                        continue
                    if g in v["dyn_gods"] and re.search(r"流年|大運|\d{4}|今年|明年|後年", s.text):
                        continue                      # 大運／流年帶來的十神，該段有講到大運／流年就算（模型常前一句講大運、下一句接著論）
                    issues.append({"section": s.key, "sentence": sent.strip(), "rule": f"十神「{g}」不在本命四柱上（只在大運／流年出現時須說明）" if g in v["dyn_gods"] else f"十神「{g}」不在命盤上"})
                for gz in set(_GZ.findall(sent)):
                    if gz not in v["gz"]:
                        issues.append({"section": s.key, "sentence": sent.strip(), "rule": f"干支「{gz}」不在四柱、大運或流年裡"})
            else:
                for star in STARS:
                    if star in sent and star not in v["stars"] and star not in ("七殺",):
                        issues.append({"section": s.key, "sentence": sent.strip(), "rule": f"星曜「{star}」不在命盤上"})
                # 「某宮…某星」：星要真的在那一宮
                for pname in PALACES:
                    # 「流年命宮」「大限命宮」不是本命命宮，跳過；只看到下一個標點為止
                    m = re.search(rf"(?<!流年)(?<!大限)(?<!本命){pname}(?!主星)", sent) or re.search(rf"本命{pname}", sent)
                    if not m:
                        continue
                    seg = re.split(r"[；;。]|四化|流年|大限", sent[m.end():], 1)[0][:30]
                    seg = re.sub(r"[\u4e00-\u9fff]{2}化[祿權科忌]", "", seg)   # 「天同化祿」是四化陳述，另外核對
                    for star in STARS:
                        if star in seg and star not in v["palace_stars"].get(pname, set()) and "對宮" not in seg and "借" not in seg:
                            issues.append({"section": s.key, "sentence": sent.strip(), "rule": f"「{star}」不在{pname}"})
                for m in re.finditer(r"([一-鿿]{2})化([祿權科忌])", sent):
                    if m.group(0) not in v["hua"] and m.group(1) in STARS:
                        issues.append({"section": s.key, "sentence": sent.strip(), "rule": f"「{m.group(0)}」不在生年或流年四化裡"})
    # 去重
    seen, uniq = set(), []
    for i in issues:
        k = (i["section"], i["rule"])
        if k not in seen:
            seen.add(k)
            uniq.append(i)
    return {"ok": not uniq, "issues": uniq, "label": "盤面核對"}


def citation_check(reading: "Reading", chart: ChartData) -> dict[str, Any]:
    fids = chart.fact_ids()
    cids = set(load_cards().keys())
    issues = []
    for s in reading.sections:
        for e in s.evidence:
            if e not in fids:
                issues.append({"section": s.key, "item": e, "rule": "引用的事實 id 不存在"})
        for c in s.cards:
            if c not in cids:
                issues.append({"section": s.key, "item": c, "rule": "引用的知識卡不存在"})
        if not s.evidence and "缺漏" not in s.text:
            issues.append({"section": s.key, "item": "", "rule": "本段沒有任何依據"})
    return {"ok": not issues, "issues": issues, "label": "引用核對"}


def boundary_check(reading: "Reading", chart: ChartData | None = None) -> dict[str, Any]:
    rules = {k: list(v) for k, v in BOUNDARY_RULES.items()}
    for r in load_persona().refusals:
        rules.setdefault(r.topic, []).extend(p for p in r.patterns if len(p) >= 2)
    issues = []
    for s in reading.sections:
        for sent in _SENT.findall(s.text):
            for topic, words in rules.items():
                hit = next((w for w in words if w in sent), None)
                if hit and not re.search(rf"(不談|不討論|不涉及|非|並非|不是|不保證|無法保證|不會告訴)[^。]{{0,8}}{re.escape(hit)}", sent):
                    issues.append({"section": s.key, "sentence": sent.strip(), "rule": f"{topic}（命中「{hit}」）"})
    return {"ok": not issues, "issues": issues, "label": "越界檢查"}


def run_checks(reading: "Reading", chart: ChartData) -> dict[str, Any]:
    cc, ci, cb = chart_check(reading, chart), citation_check(reading, chart), boundary_check(reading, chart)
    passed = sum(1 for c in (cc, ci, cb) if c["ok"])
    return {"passed": passed == 3, "chart_check": cc, "citation_check": ci, "boundary_check": cb,
            "summary": f"{passed}/3 通過（一致性另以 /api/consistency 檢查）"}
