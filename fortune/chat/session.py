"""對話（7-1、7-2）— 命盤只算一次，追問時讓 AI 自己判斷要重算流年、查知識卡，還是直接回答。

- Session 存命盤與對話紀錄（記憶體＋可選的 data/sessions/*.json，依 SESSION_TTL_HOURS 過期）
- 越界問題先由人設的 refusals 擋下（不會送到模型）
- 離線模式用關鍵字決定動作；接 Anthropic 時由模型以 tool use 決定
"""

from __future__ import annotations

import json
import re
import time
import uuid
from datetime import date
from typing import Any

from fortune.birth import BirthInput
from fortune.chart import ChartData, cast
from fortune.config import get_settings
from fortune.knowledge.store import get_card, load_cards, select_cards
from fortune.reading import llm
from fortune.reading.persona import load_persona
from fortune.ziwei.engine import NeedsBirthTime

_SESSIONS: dict[str, dict[str, Any]] = {}

TOOLS = [
    {"name": "recast_year", "description": "重算某一年的流年（八字流年干支與十神、紫微流年命宮與四化）。使用者問到特定年份、明年、後年時用。",
     "input_schema": {"type": "object", "properties": {"year": {"type": "integer", "description": "公曆年"}}, "required": ["year"], "additionalProperties": False},
     "strict": True},
    {"name": "lookup_card", "description": "查一張知識卡的完整內容（十神、宮位、主星、四化）。使用者問某個名詞是什麼意思時用。",
     "input_schema": {"type": "object", "properties": {"card_id": {"type": "string", "description": "知識卡 id，例如 shishen.zhengguan、star.ziwei"}}, "required": ["card_id"], "additionalProperties": False},
     "strict": True},
]


# ---------------------------------------------------------------- session
def _persist(sid: str) -> None:
    s = get_settings()
    if s.session_ttl_hours <= 0:
        return
    d = s.data_dir / "sessions"
    d.mkdir(parents=True, exist_ok=True)
    (d / f"{sid}.json").write_text(json.dumps(_SESSIONS[sid], ensure_ascii=False, default=str), encoding="utf-8")


def _load(sid: str) -> dict[str, Any] | None:
    if sid in _SESSIONS:
        return _SESSIONS[sid]
    p = get_settings().data_dir / "sessions" / f"{sid}.json"
    if p.exists():
        data = json.loads(p.read_text(encoding="utf-8"))
        if time.time() - data.get("created", 0) < get_settings().session_ttl_hours * 3600:
            _SESSIONS[sid] = data
            return data
        p.unlink(missing_ok=True)
    return None


def purge_expired() -> int:
    ttl = get_settings().session_ttl_hours * 3600
    now = time.time()
    gone = [k for k, v in _SESSIONS.items() if now - v.get("created", 0) > ttl]
    for k in gone:
        _SESSIONS.pop(k, None)
        (get_settings().data_dir / "sessions" / f"{k}.json").unlink(missing_ok=True)
    return len(gone)


def delete_session(sid: str) -> bool:
    """使用者要求刪除自己的資料（8-3）。"""
    existed = _SESSIONS.pop(sid, None) is not None
    p = get_settings().data_dir / "sessions" / f"{sid}.json"
    if p.exists():
        p.unlink()
        existed = True
    return existed


def start_session(birth: BirthInput, today: date | None = None, school=None) -> dict[str, Any]:
    from fortune.school import resolve as _resolve_school
    school = school or _resolve_school()
    charts: dict[str, ChartData] = {"bazi": cast("bazi", birth, today=today, school=school)}
    try:
        charts["ziwei"] = cast("ziwei", birth, today=today, school=school)
    except NeedsBirthTime:
        pass
    sid = uuid.uuid4().hex[:12]
    _SESSIONS[sid] = {"id": sid, "created": time.time(), "birth": birth.model_dump(mode="json"),
                      "school": {"name": school.name, "settings": {"bazi": school.bazi.model_dump(), "ziwei": school.ziwei.model_dump()}},
                      "charts": {k: v.model_dump(mode="json") for k, v in charts.items()}, "history": []}
    _persist(sid)
    return _SESSIONS[sid]


# ---------------------------------------------------------------- tools
def _charts(sess: dict[str, Any]) -> dict[str, ChartData]:
    return {k: ChartData.model_validate(v) for k, v in sess["charts"].items()}


def _session_school(sess: dict[str, Any]):
    from fortune.school import School, resolve as _resolve_school
    sc = sess.get("school")
    if not sc:
        return _resolve_school()
    return School.model_validate({"name": sc["name"], **sc["settings"]})


def tool_recast_year(sess: dict[str, Any], year: int) -> tuple[str, list[str]]:
    birth = BirthInput.model_validate(sess["birth"])
    lines, ev = [], []
    for system in sess["charts"]:
        c = cast(system, birth, today=date(year, 6, 1), years_ahead=0, school=_session_school(sess), with_alternatives=False)
        for f in c.facts:
            if f.id == f"{system}.liunian.{year}":
                lines.append(f"[{f.id}] {f.label}：{f.value}（{f.note.replace('・今年', '')}）")
                ev.append(f.id)
                # 把新事實加進 session 的盤，之後引用核對才找得到
                if f.id not in {x["id"] for x in sess["charts"][system]["facts"]}:
                    sess["charts"][system]["facts"].append(f.model_dump())
    return "\n".join(lines) or f"查無 {year} 年的流年資料", ev


def tool_lookup_card(card_id: str) -> tuple[str, list[str]]:
    c = get_card(card_id)
    if not c:
        return f"知識庫裡沒有 {card_id} 這張卡", []
    return c.brief(), [c.id]


# ---------------------------------------------------------------- 主流程
def _facts_block(sess: dict[str, Any]) -> str:
    return "\n\n".join(f"=== {c.system_zh} ===\n{c.facts_text()}" for c in _charts(sess).values())


def _card_prose(c) -> str:
    """把知識卡的 Markdown 段落變成一段給人看的話（離線模式用）。"""
    def items(sec: str) -> list[str]:
        return [re.sub(r"^[-*・]\s*", "", ln).strip().rstrip("。") for ln in c.sections.get(sec, "").splitlines() if ln.strip()]
    out = [f"{c.name}（{c.type}）：{c.sections.get('意義', '').strip()}"]
    if items("正面"):
        out.append("正面：" + "；".join(items("正面")))
    if items("負面"):
        out.append("負面：" + "；".join(items("負面")))
    if items("常見組合"):
        out.append("常見組合：" + "；".join(items("常見組合")[:3]))
    return "\n".join(out)


# 離線模式的主題路由：問句含這些詞 → 回六段解讀裡對應的那一段
TOPIC_WORDS = {
    "love": ["桃花", "感情", "愛情", "戀愛", "結婚", "婚姻", "對象", "另一半", "伴侶", "姻緣", "脫單", "交往"],
    "career": ["工作", "事業", "升遷", "換工作", "轉職", "老闆", "創業", "考試", "讀書", "學業", "職場", "離職"],
    "wealth": ["錢", "財運", "財", "薪水", "收入", "理財", "存款", "買房", "偏財", "正財"],
    "personality": ["性格", "個性", "優點", "缺點", "什麼樣的人", "脾氣", "特質", "適合我"],
    "year": ["運勢", "流年", "最近", "這陣子", "近期"],
    "overview": ["整體", "總論", "命好", "命格", "大運", "格局"],
}


def _mock_section(chart: ChartData, key: str):
    """用離線解讀產生器組出六段，取 key 那一段（與 /api/reading 的離線版同一套規則與事實）。"""
    from fortune.reading.persona import load_persona as _lp
    from fortune.reading.report import mock_reading, parse_sections
    from fortune.reading.sections import directions
    dirs = directions(chart)
    text = mock_reading(chart, select_cards(chart), dirs, _lp())
    return next((s for s in parse_sections(text, dirs, chart.system) if s.key == key), None)


def _mock_reply(sess: dict[str, Any], message: str) -> dict[str, Any]:
    charts = _charts(sess)
    persona = load_persona()
    today = date.today()
    m = re.search(r"(20\d\d)\s*年?", message)
    rel = {"今年": 0, "明年": 1, "後年": 2, "去年": -1}
    year = int(m.group(1)) if m else next((today.year + v for k, v in rel.items() if k in message), None)
    if year:
        _, ev = tool_recast_year(sess, year)
        lines = []
        for system, c in _charts(sess).items():
            f = c.fact(f"{system}.liunian.{year}")
            if f:
                lines.append(f"・{c.system_zh}：{f.value}。{f.note.replace('・今年', '')}")
        return {"action": "recast", "reply": f"（離線示範）{year} 年的流年我重新算了一次：\n" + "\n".join(lines) + f"\n\n{persona.closing}",
                "evidence": ev, "cards": []}
    # 查知識卡：只在「解釋型」問句（是什麼／什麼意思／代表／解釋）才觸發；「最近有桃花嗎」是問運勢，不是問名詞
    if re.search(r"是什麼|什麼是|意思|代表|解釋|怎麼看|指的是|何謂", message):
        for c in load_cards().values():
            if any(k and k in message for k in c.keywords):
                return {"action": "lookup", "reply": f"（離線示範）{_card_prose(c)}\n\n{persona.closing}", "evidence": [], "cards": [c.id]}
    # 直接回答：依問題主題，從六段解讀裡挑對應的段落（八字＋紫微都有就兩段都給）
    key = next((k for k, words in TOPIC_WORDS.items() if any(w in message for w in words)), "overview")
    reply, ev, cd = [], [], []
    for system, c in charts.items():
        sec = _mock_section(c, key)
        if sec:
            reply.append(f"【{c.system_zh}・{sec.title}・{sec.direction}】\n{sec.text}")
            ev += sec.evidence
            cd += sec.cards
    if not reply:
        bz = charts.get("bazi")
        ev = [f.id for f in bz.facts if f.id in ("bazi.day_master", "bazi.strength", "bazi.favourable")] if bz else []
        reply = ["我只能依盤面事實回答。目前能確定的是：\n" + "\n".join(f"{bz.fact(i).label}：{bz.fact(i).value}" for i in ev)]
    return {"action": "answer", "reply": "（離線示範）" + "\n\n".join(reply) + f"\n\n{persona.closing}",
            "evidence": list(dict.fromkeys(ev)), "cards": list(dict.fromkeys(cd)), "topic": key}


def _run_tool(sess: dict[str, Any], name: str, args: dict[str, Any]) -> tuple[str, str, list[str], list[str]]:
    """執行一個工具 → (action, 給模型看的文字, evidence, cards)。"""
    if name == "recast_year":
        text, ev = tool_recast_year(sess, int(args.get("year", date.today().year)))
        return "recast", text, ev, []
    text, cd = tool_lookup_card(str(args.get("card_id", "")))
    return "lookup", text, [], cd


def _chat_system(sess: dict[str, Any], persona) -> tuple[str, str]:
    """(固定規則, 盤面與知識卡) 兩段：前者各家都一樣、可快取。"""
    cards = []
    for c in _charts(sess).values():
        cards += select_cards(c, limit=10)
    rules = "\n".join(f"- {r}" for r in persona.tone_rules)
    fixed = (f"你是命理師「{persona.name}」。{persona.style}\n硬規則：\n{rules}\n"
             "- 只根據盤面事實與知識卡回答；程式算得出來的不要自己算，需要某年流年就呼叫 recast_year，需要名詞解釋就呼叫 lookup_card。\n"
             "- 不談醫療、投資標的、法律結論、生死；不用「保證」「一定」。資料不足就說資料不足。\n"
             "- 內文不要夾帶任何 id；只在回答末尾用一行「依據：id, id」列出用到的事實 id，再一行「知識卡：id」列出用到的卡，沒有就寫無。繁體中文，200 字內。")
    context = "=== 盤面事實 ===\n" + _facts_block(sess) + "\n\n=== 知識卡 ===\n" + "\n\n".join(c.brief() for c in cards)
    return fixed, context


def _parse_tail(text: str) -> tuple[list[str], list[str]]:
    m1 = re.search(r"依據[：:]\s*(.*)", text)
    m2 = re.search(r"知識卡[：:]\s*(.*)", text)
    split = lambda s: [x.strip() for x in re.split(r"[,，、\s]+", s) if x.strip() and x.strip() != "無"]  # noqa: E731
    return (split(m1.group(1)) if m1 else []), (split(m2.group(1)) if m2 else [])


def _llm_reply(sess: dict[str, Any], message: str) -> dict[str, Any]:
    from fortune.reading import providers
    p = providers.resolve()
    persona = load_persona()
    fixed, context = _chat_system(sess, persona)
    history = [{"role": h["role"], "content": h["content"]} for h in sess["history"][-10:]]
    history.append({"role": "user", "content": message})
    if p.kind == "anthropic":
        out = _anthropic_loop(sess, p, fixed, context, history)
    else:
        out = _openai_loop(sess, p, fixed, context, history)
    if out.get("action") == "refuse":
        return out
    ev, cd = _parse_tail(out["reply"])
    reply, inline_ev, inline_cd = _strip_ids(out["reply"])
    out["reply"] = reply
    out["evidence"] = list(dict.fromkeys(out["evidence"] + ev + inline_ev))
    out["cards"] = list(dict.fromkeys(out["cards"] + cd + inline_cd))
    return out


_ID = r"(?:bazi|ziwei)\.[\w.\u4e00-\u9fff]+|(?:shishen|wangshuai|gong|star|hua)\.[a-z_]+"


def _strip_ids(text: str) -> tuple[str, list[str], list[str]]:
    """把回覆裡的 id 拿掉（畫面只用下方的標籤顯示依據）：
    - 結尾的「依據：…」「知識卡：…」整行
    - 內文裡只含 id 的括號，例如「（wangshuai.shenqiang、shishen.bijian）」
    拿掉的 id 仍回傳，併進 evidence / cards。"""
    ev, cd = [], []
    def collect(ids: list[str]):
        for i in ids:
            (ev if i.startswith(("bazi.", "ziwei.")) else cd).append(i)
    # 內文括號
    def repl(m):
        ids = re.findall(_ID, m.group(0))
        if ids and not re.sub(_ID + r"|[（）()、,，\s]", "", m.group(0)):
            collect(ids)
            return ""
        return m.group(0)
    text = re.sub(r"[（(][^（）()]*[）)]", repl, text)
    # 結尾兩行
    lines = []
    for ln in text.splitlines():
        if re.match(r"^\s*(依據|知識卡)[：:]", ln):
            collect(re.findall(_ID, ln))
            continue
        lines.append(ln)
    text = "\n".join(lines).strip()
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text, ev, cd


def _anthropic_loop(sess, p, fixed: str, context: str, messages: list[dict[str, Any]]) -> dict[str, Any]:
    import anthropic
    client = anthropic.Anthropic(api_key=p.api_key)
    system = [{"type": "text", "text": fixed, "cache_control": {"type": "ephemeral"}},
              {"type": "text", "text": context, "cache_control": {"type": "ephemeral"}}]
    action, ev, cd = "answer", [], []
    usage_in = usage_out = 0
    for _ in range(4):
        from fortune.reading.llm import _anthropic_extra
        resp = client.messages.create(model=p.model, max_tokens=1500, system=system, tools=TOOLS, messages=messages, **_anthropic_extra())
        u = resp.usage
        usage_in += u.input_tokens + (getattr(u, "cache_read_input_tokens", 0) or 0) + (getattr(u, "cache_creation_input_tokens", 0) or 0)
        usage_out += u.output_tokens
        if resp.stop_reason == "refusal":
            persona = load_persona()
            return {"action": "refuse", "reply": persona.refusals[0].reply if persona.refusals else "這個問題我不方便回答。", "evidence": [], "cards": []}
        if resp.stop_reason != "tool_use":
            break
        messages.append({"role": "assistant", "content": resp.content})
        results = []
        for blk in resp.content:
            if blk.type != "tool_use":
                continue
            action, text, e, c = _run_tool(sess, blk.name, dict(blk.input))
            ev += e
            cd += c
            results.append({"type": "tool_result", "tool_use_id": blk.id, "content": text})
        messages.append({"role": "user", "content": results})
    text = "".join(b.text for b in resp.content if b.type == "text").strip()
    return {"action": action, "reply": text, "evidence": ev, "cards": cd,
            "usage": {"input_tokens": usage_in, "output_tokens": usage_out}, "backend": p.backend, "model": p.model}


def _openai_loop(sess, p, fixed: str, context: str, messages: list[dict[str, Any]]) -> dict[str, Any]:
    """OpenAI / DeepSeek / Gemini / 本機模型：OpenAI 相容的 function calling。"""
    from fortune.reading import providers
    client = providers.OpenAICompatible(p)
    system = fixed + "\n\n" + context
    action, ev, cd = "answer", [], []
    usage_in = usage_out = 0
    r = None
    for _ in range(4):
        r = client.complete(system, messages, max_tokens=1500, tools=TOOLS)
        usage_in += r.input_tokens
        usage_out += r.output_tokens
        if not r.tool_calls:
            break
        messages.append(r.raw_message)
        for tc in r.tool_calls:
            action, text, e, c = _run_tool(sess, tc["name"], tc["arguments"])
            ev += e
            cd += c
            messages.append({"role": "tool", "tool_call_id": tc["id"], "content": text})
    return {"action": action, "reply": (r.text if r else ""), "evidence": ev, "cards": cd,
            "usage": {"input_tokens": usage_in, "output_tokens": usage_out}, "backend": p.backend, "model": p.model}


def chat(session_id: str | None, message: str, birth: BirthInput | None = None, school=None) -> dict[str, Any]:
    sess = _load(session_id) if session_id else None
    if sess is None:
        if birth is None:
            raise KeyError("session 不存在或已過期，請重新提供出生資料")
        sess = start_session(birth, school=school)
    persona = load_persona()
    refusal = persona.match_refusal(message)
    if refusal:
        out = {"action": "refuse", "reply": refusal.reply, "evidence": [], "cards": [], "topic": refusal.topic}
    elif get_settings().llm_ready:
        try:
            out = _llm_reply(sess, message)
        except Exception as e:  # noqa: BLE001
            print(f"[chat] 退回離線模式：{e}")
            out = _mock_reply(sess, message)
    else:
        out = _mock_reply(sess, message)
    # 引用核對：回覆引用的 id 要真的存在
    valid_f = {f["id"] for c in sess["charts"].values() for f in c["facts"]}
    out["evidence"] = [e for e in out["evidence"] if e in valid_f]
    out["cards"] = [c for c in out["cards"] if get_card(c)]
    sess["history"] += [{"role": "user", "content": message}, {"role": "assistant", "content": out["reply"]}]
    _persist(sess["id"])
    charts = _charts(sess)
    out.update({"session_id": sess["id"], "persona": persona.name,
                "chart_summary": {k: (f"命宮{c.payload['life_branch']}・{c.fact('ziwei.palace.命宮').value}" if k == "ziwei"
                                      else f"日主{c.fact('bazi.day_master').value}・{c.fact('bazi.strength').value.split('（')[0]}") for k, c in charts.items()}})
    return out
