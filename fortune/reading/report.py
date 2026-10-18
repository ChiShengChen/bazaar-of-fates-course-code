"""解讀報告（第 5、6 章）— 組 prompt → 叫 LLM（或離線版）→ 解析成六段 → 跑查核。

離線版（mock）不是隨便塞字：它照同一個格式、同一套事實與卡、同一個方向規則，用模板把句子組出來，
所以沒有金鑰也能示範「每段有依據、可查核」的整條流程。
"""

from __future__ import annotations

import re
from collections.abc import Iterator
from datetime import date
from typing import Any

from pydantic import BaseModel, Field

from fortune.birth import BirthInput
from fortune.chart import ChartData, cast
from fortune.config import get_settings
from fortune.knowledge.store import Card, select_cards
from fortune.reading import llm
from fortune.reading.persona import Persona, load_persona
from fortune.reading.prompt import system_prompt, user_prompt
from fortune.reading.sections import Direction, directions, sections_for


class Section(BaseModel):
    key: str
    title: str
    direction: str = "平"
    direction_reason: str = ""
    text: str = ""
    evidence: list[str] = Field(default_factory=list)
    cards: list[str] = Field(default_factory=list)


class Reading(BaseModel):
    system: str
    system_zh: str
    subject: str
    persona: str
    sections: list[Section]
    disclaimer: str
    checks: dict[str, Any] = Field(default_factory=dict)
    raw_text: str = ""
    cost_usd: float = 0.0
    backend: str = "mock"
    model: str = ""
    byok: bool = False                                        # 使用者自帶金鑰
    usage: dict[str, int] = Field(default_factory=dict)      # input/output/cache_read tokens
    warnings: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------- 解析固定格式
def parse_sections(text: str, dirs: list[Direction], system: str = "bazi") -> list[Section]:
    """把「## 標題 / 方向：/ 內文 / 依據：/ 知識卡：」解析成 Section。缺段就補空段並標示。"""
    sections = sections_for(system)
    titles = dict(sections)
    title_to_key = {t: k for k, t in sections}
    dmap = {d.key: d for d in dirs}
    found: dict[str, Section] = {}
    for block in re.split(r"^##\s*", text.strip(), flags=re.M)[1:]:
        title, _, body = block.partition("\n")
        key = title_to_key.get(title.strip())
        if not key:
            continue
        direction = re.search(r"^方向[：:]\s*([吉平凶])", body, re.M)
        ev = re.search(r"^依據[：:]\s*(.*)$", body, re.M)
        cd = re.search(r"^知識卡[：:]\s*(.*)$", body, re.M)
        content = re.sub(r"^(方向|依據|知識卡)[：:].*$", "", body, flags=re.M).strip()
        content = re.sub(r"\n{3,}", "\n\n", content)
        split = lambda s: [x.strip() for x in re.split(r"[,，、\s]+", s) if x.strip() and x.strip() != "無"]  # noqa: E731
        found[key] = Section(
            key=key, title=titles[key],
            direction=direction.group(1) if direction else dmap[key].direction,
            direction_reason=dmap[key].reason, text=content,
            evidence=split(ev.group(1)) if ev else [], cards=split(cd.group(1)) if cd else [],
        )
    out = []
    for key, title in sections:
        out.append(found.get(key) or Section(key=key, title=title, direction=dmap[key].direction,
                                             direction_reason=dmap[key].reason, text="（本段缺漏：模型未依格式輸出）"))
    return out


# ---------------------------------------------------------------- 離線版
_SHULI_ID = {"吉": "ji", "半吉": "banji", "凶": "xiong"}
_WUXING_ID = {"木": "mu", "火": "huo", "土": "tu", "金": "jin", "水": "shui"}
_REL_ID = {"相生": "xiangsheng", "比和": "bihe", "相剋": "xiangke"}


def mock_reading(chart: ChartData, cards: list[Card], dirs: list[Direction], persona: Persona, focus: str | None = None) -> str:
    f = {x.id: x for x in chart.facts}
    cmap = {c.id: c for c in cards}
    by_kw = {kw: c for c in cards for kw in c.keywords}
    titles = dict(sections_for(chart.system))

    def card_for(*words: str) -> list[str]:
        return [by_kw[w].id for w in words if w in by_kw]

    def sec(key: str, body: str, ev: list[str], cd: list[str]) -> str:
        d = next(x for x in dirs if x.key == key)
        ev = [e for e in ev if e in f]
        cd = [c for c in dict.fromkeys(cd) if c in cmap]
        return (f"## {titles[key]}\n方向：{d.direction}\n{body}\n"
                f"依據：{', '.join(ev) if ev else '無'}\n知識卡：{', '.join(cd) if cd else '無'}\n")

    tone = {"吉": "整體順勢", "平": "平穩中有起伏", "凶": "阻力較多，宜守不宜攻"}
    parts = [f"（離線示範解讀・{persona.name}）\n"]

    if chart.system == "bazi":
        dm, st, fav = f["bazi.day_master"], f["bazi.strength"], f["bazi.favourable"]
        present = f["bazi.gods.present"].value.split("、")
        absent = f["bazi.gods.absent"].value
        cur = f.get("bazi.dayun.current")
        ln = next((x for x in chart.facts if x.id.startswith("bazi.liunian.") and "今年" in x.note), None)
        strength_card = "wangshuai.shenqiang" if "身強" in st.value else "wangshuai.shenruo"
        d0 = next(x for x in dirs if x.key == "overview")
        parts.append(sec("overview",
            f"你的日主是{dm.value}，{st.value.split('（')[0]}，喜用五行為{fav.value}。"
            f"{('目前' + cur.value + '，') if cur and '尚未起運' in cur.value else ('目前走' + cur.value + '大運，') if cur and '資料不足' not in cur.value else ''}{tone[d0.direction]}。"
            f"這一段的方向來自：{d0.reason}。",
            ["bazi.day_master", "bazi.strength", "bazi.favourable"] + (["bazi.dayun.current"] if cur else []),
            [strength_card]))
        gods_txt = "、".join(present[:4])
        parts.append(sec("personality",
            f"命中出現的十神有{f['bazi.gods.present'].value}，未出現的是{absent}。"
            f"以{gods_txt}為主的組合，性格面向可參考知識卡所述的正面與負面特質；未出現的十神代表那一類經驗較少從內在自然生出，需要後天補足。",
            ["bazi.gods.present", "bazi.gods.absent", "bazi.day_master"], card_for(*present[:4])))
        off = [g for g in present if g in ("正官", "七殺")]
        seal = [g for g in present if g in ("正印", "偏印")]
        d = next(x for x in dirs if x.key == "career")
        parts.append(sec("career",
            f"事業看官殺與印星：命中{'有' + '、'.join(off) if off else '沒有官殺'}，{'有' + '、'.join(seal) if seal else '沒有印星'}。"
            f"{tone[d.direction]}；判定規則：{d.reason}。",
            ["bazi.gods.present", "bazi.gods.absent"], card_for(*off, *seal)))
        g = chart.birth.get("gender")
        love_star = [x for x in present if x in (("正財", "偏財") if g == "male" else ("正官", "七殺") if g == "female" else ("正財", "偏財", "正官", "七殺"))]
        d = next(x for x in dirs if x.key == "love")
        parts.append(sec("love",
            f"感情通論{'男命看財星' if g == 'male' else '女命看官星' if g == 'female' else '看財官'}：命中{'有' + '、'.join(love_star) if love_star else '相關星曜未現，感情的課題較需主動經營'}。"
            f"{tone[d.direction]}。{'性別未填，此段僅以通論描述。' if not g else ''}",
            ["bazi.gods.present", "bazi.day_master"], card_for(*love_star)))
        wealth = [x for x in present if x in ("正財", "偏財")]
        outp = [x for x in present if x in ("食神", "傷官")]
        d = next(x for x in dirs if x.key == "wealth")
        parts.append(sec("wealth",
            f"財運看財星與食傷：命中{'有' + '、'.join(wealth) if wealth else '財星未現'}，{'有' + '、'.join(outp) + '可生財' if outp else '食傷未現'}。"
            f"喜用五行為{fav.value}，遇到這些五行的大運流年較順。{tone[d.direction]}。",
            ["bazi.gods.present", "bazi.favourable"], card_for(*wealth, *outp)))
        d = next(x for x in dirs if x.key == "year")
        if ln:
            parts.append(sec("year",
                f"{ln.label}為{ln.value}，{ln.note.replace('・今年', '')}。{tone[d.direction]}。"
                f"{'大運' + cur.value + '疊加流年一起看。' if cur and '資料不足' not in cur.value and '尚未起運' not in cur.value else ''}",
                [ln.id, "bazi.favourable"] + (["bazi.dayun.current"] if cur else []),
                card_for(*[x for x in ln.value.split("・")[-1].split("/")])))
    elif chart.system == "xingming":
        grid = {g["name"]: g for g in chart.payload["grids"]}
        rel = chart.payload["relations"]
        name, sc = f["xingming.name"], f["xingming.sancai"]
        gtxt = lambda n: f"{n} {grid[n]['shuli']}（{grid[n]['element']}・{grid[n]['luck']}）"  # noqa: E731
        d0 = next(x for x in dirs if x.key == "overview")
        parts.append(sec("overview",
            f"「{name.value}」的三才配置是{sc.value}，{gtxt('總格')}。{rel['成功運']['text']}，{rel['基礎運']['text']}。"
            f"{tone[d0.direction]}。這一段的方向來自：{d0.reason}。",
            ["xingming.name", "xingming.sancai", "xingming.yun.success", "xingming.yun.base", "xingming.ge.zong"],
            ["sancai.peizhi", "wuge.zong", f"shuli.{_SHULI_ID[grid['總格']['luck']]}"]))
        parts.append(sec("personality",
            f"性格以人格為主軸：{gtxt('人格')}。人格是姓的最後一字加名的第一字，代表姓名的核心；{grid['人格']['element']}的人格特質見知識卡。",
            ["xingming.ge.ren", "xingming.sancai"], ["wuge.ren", f"wuxing.{_WUXING_ID[grid['人格']['element']]}"]))
        for key, gname, yun, ev in (("career", "人格", "成功運", "success"), ("love", "地格", "基礎運", "base")):
            d = next(x for x in dirs if x.key == key)
            parts.append(sec(key,
                f"{'事業看人格與成功運' if key == 'career' else '感情與家庭看地格與基礎運'}：{gtxt(gname)}，{yun}{rel[yun]['kind']}（{rel[yun]['text']}）。"
                f"{tone[d.direction]}；判定規則：{d.reason}。",
                [f"xingming.ge.{'ren' if gname == '人格' else 'di'}", f"xingming.yun.{ev}"],
                [f"wuge.{'ren' if gname == '人格' else 'di'}", f"sancai.{_REL_ID[rel[yun]['kind']]}"]))
        d = next(x for x in dirs if x.key == "wealth")
        parts.append(sec("wealth",
            f"財運看人格與總格：{gtxt('人格')}、{gtxt('總格')}。{tone[d.direction]}。",
            ["xingming.ge.ren", "xingming.ge.zong"], ["wuge.zong", f"shuli.{_SHULI_ID[grid['總格']['luck']]}"]))
        d = next(x for x in dirs if x.key == "year")
        link, fav = f["xingming.bazi.link"], f["xingming.bazi.favourable"]
        parts.append(sec("year",
            f"八字喜用五行為{fav.value}（{fav.note}）。姓名這邊{link.value}；各格對照：{link.note}。{tone[d.direction]}。"
            "姓名不隨年份變，這一段看的是名字與八字的配合，不是流年。",
            ["xingming.bazi.link", "xingming.bazi.favourable"], ["sancai.bazi"]))
    else:
        life, soul, five = f["ziwei.palace.命宮"], f["ziwei.soul_star"], f["ziwei.five_class"]
        d0 = next(x for x in dirs if x.key == "overview")
        parts.append(sec("overview",
            f"命宮在{life.label.split('（')[1].rstrip('）')}，主星{life.value}（{life.note}）；{five.value}，命主星{soul.value}。"
            f"{tone[d0.direction]}。方向判定：{d0.reason}。",
            ["ziwei.palace.命宮", "ziwei.five_class", "ziwei.soul_star"], card_for(*life.value.split("、"), "命宮")))
        body = f["ziwei.body_palace"]
        parts.append(sec("personality",
            f"性格以命宮主星{life.value}為主軸，身宮{body.value}則是後天著力之處（{body.note}）。主星的正面與負面特質見知識卡。",
            ["ziwei.palace.命宮", "ziwei.body_palace", "ziwei.soul_star"], card_for(*life.value.split("、"))))
        for key, pname in (("career", "官祿宮"), ("love", "夫妻宮"), ("wealth", "財帛宮")):
            p = f[f"ziwei.palace.{pname}"]
            d = next(x for x in dirs if x.key == key)
            parts.append(sec(key,
                f"{pname}主星{p.value}，{p.note}。{tone[d.direction]}；判定規則：{d.reason}。",
                [p.id], card_for(pname, *p.value.split("、"))))
        ln = next((x for x in chart.facts if x.id.startswith("ziwei.liunian.") and "今年" in x.note), None)
        d = next(x for x in dirs if x.key == "year")
        if ln:
            parts.append(sec("year", f"{ln.label}{ln.value}；{ln.note.replace('・今年', '')}。{tone[d.direction]}。",
                             [ln.id] + d.evidence[1:], card_for("化忌", "化祿")))
    return "\n".join(parts)


# ---------------------------------------------------------------- 主流程
def _prepare(system: str, birth: BirthInput, focus: str | None, today: date | None, school=None):
    chart = cast(system, birth, today=today, school=school)
    cards = select_cards(chart)
    dirs = directions(chart)
    persona = load_persona()
    return chart, cards, dirs, persona, system_prompt(persona, chart.system), user_prompt(chart, cards, dirs, focus)


def _finish(chart: ChartData, cards: list[Card], dirs: list[Direction], persona: Persona, res: llm.LLMResult) -> Reading:
    from fortune.reading.checks import run_checks
    sections = parse_sections(res.text, dirs, chart.system)
    r = Reading(system=chart.system, system_zh=chart.system_zh, subject=chart.subject, persona=persona.name,
                sections=sections, disclaimer=persona.disclaimer, raw_text=res.text,
                cost_usd=res.cost_usd, backend=res.backend, model=res.model, byok=res.byok,
                usage={"input_tokens": res.input_tokens, "output_tokens": res.output_tokens, "cache_read_tokens": res.cache_read_tokens},
                warnings=chart.warnings)
    if res.truncated:
        r.warnings = r.warnings + [f"模型輸出達 token 上限被截斷（已重試一次），缺漏段落請提高 READING_MAX_TOKENS（目前 {get_settings().reading_max_tokens}）"]
    elif res.retried:
        r.warnings = r.warnings + ["模型第一次輸出被 token 上限截斷，已自動加倍重試成功"]
    r.checks = run_checks(r, chart)
    return r


def make_reading(system: str, birth: BirthInput, *, focus: str | None = None, today: date | None = None, school=None) -> tuple[Reading, ChartData]:
    chart, cards, dirs, persona, sp, up = _prepare(system, birth, focus, today, school)
    res = llm.complete(sp, up, fallback=lambda: mock_reading(chart, cards, dirs, persona, focus))
    return _finish(chart, cards, dirs, persona, res), chart


def stream_reading(system: str, birth: BirthInput, *, focus: str | None = None, today: date | None = None, school=None,
                   provider=None) -> Iterator[str | tuple[Reading, ChartData]]:
    """逐字 yield 文字；最後 yield (Reading, ChartData)。provider：自帶金鑰時明確傳入（串流跨執行緒，不能靠 contextvar）。"""
    chart, cards, dirs, persona, sp, up = _prepare(system, birth, focus, today, school)
    for item in llm.stream(sp, up, fallback=lambda: mock_reading(chart, cards, dirs, persona, focus), provider=provider):
        if isinstance(item, llm.LLMResult):
            yield _finish(chart, cards, dirs, persona, item), chart
        else:
            yield item
