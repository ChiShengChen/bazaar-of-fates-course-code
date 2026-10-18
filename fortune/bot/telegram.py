"""Telegram 機器人（8-1）— 同一個命理師，排盤與解讀都不用重寫。

只用 httpx 做 long polling，不另裝套件。指令：
  /start                         說明
  /birth 1990-06-15 14:30 女 陳美玲   設定生辰（時間、性別、姓名可省略；姓名給姓名學用）
  /chart                         看八字四柱＋紫微命宮（有姓名再加五格）
  /reading bazi|ziwei|xingming   六段解讀（含查核結果）
  其他文字                        追問（走 /api/chat 同一套邏輯）
  /forget                        刪除自己的資料
"""

from __future__ import annotations

import time

import httpx

from fortune.api import limits
from fortune.birth import BirthInput
from fortune.chart import cast
from fortune.chat.session import chat, delete_session, start_session
from fortune.config import get_settings
from fortune.reading.report import make_reading
from fortune.xingming.engine import NameInputError, analyze
from fortune.ziwei.engine import NeedsBirthTime

_users: dict[int, dict] = {}       # telegram user id → {"birth": ..., "session_id": ...}


_SYSTEMS = ("bazi", "ziwei", "xingming")


def _parse_birth(text: str) -> BirthInput:
    parts = text.split()
    d = parts[0]
    genders = ("男", "女", "male", "female")
    t = next((p for p in parts[1:] if ":" in p), None)
    g = next((p for p in parts[1:] if p in genders), None)
    n = next((p for p in parts[1:] if p not in genders and any("一" <= ch <= "鿿" for ch in p)), None)
    return BirthInput(birth_date=d, birth_time=t, gender=g, longitude=121.5, full_name=n)


def handle(uid: int, text: str) -> str:
    text = text.strip()
    if text.startswith("/start"):
        return "你好，我是 AI 命理師。先用 /birth 1990-06-15 14:30 女 設定生辰，再用 /chart 看盤、/reading bazi 看解讀，或直接問我問題。\n本服務提供有依據、可查核的命理解讀，僅供參考。"
    if text.startswith("/forget"):
        u = _users.pop(uid, None)
        if u and u.get("session_id"):
            delete_session(u["session_id"])
        return "已刪除你的生辰與對話紀錄。"
    if text.startswith("/birth"):
        try:
            b = _parse_birth(text[len("/birth"):].strip())
        except Exception as e:  # noqa: BLE001
            return f"格式不對：{e}\n範例：/birth 1990-06-15 14:30 女"
        sess = start_session(b)
        _users[uid] = {"birth": b, "session_id": sess["id"]}
        return f"已記下：{b.label()}。用 /chart 看盤或直接提問。"
    u = _users.get(uid)
    if not u:
        return "請先用 /birth 設定生辰，例如：/birth 1990-06-15 14:30 女"
    b: BirthInput = u["birth"]
    system = (text.split()[1:2] or ["bazi"])[0] if text.startswith("/reading") else ""
    if text.startswith("/reading"):                # 扣次數之前先擋掉打錯的系統與缺姓名
        if system not in _SYSTEMS:
            return "用法：/reading bazi、/reading ziwei 或 /reading xingming"
        if system == "xingming":
            try:
                analyze(b.full_name or "")
            except NameInputError as e:
                return f"{e}。請用 /birth 把姓名加在最後，例如：/birth 1990-06-15 14:30 女 陳美玲"
    # 解讀與對話會花 AI 費用：跟網站一樣走每人每日次數、全站上限、預算（8-2）
    if text.startswith("/reading") or not text.startswith("/"):
        try:
            limits.check_and_count(f"tg:{uid}")
        except limits.LimitExceeded as e:
            return str(e.reason)
    if text.startswith("/chart"):
        bz = cast("bazi", b)
        out = "八字：" + " ".join(p["gz"] for p in bz.payload["pillars"]) + f"\n日主 {bz.fact('bazi.day_master').value}，{bz.fact('bazi.strength').value.split('（')[0]}，喜用 {bz.fact('bazi.favourable').value}"
        try:
            zw = cast("ziwei", b)
            out += f"\n紫微：命宮{zw.payload['life_branch']}，{zw.fact('ziwei.palace.命宮').value}，{zw.payload['five_class']}"
        except NeedsBirthTime:
            out += "\n紫微：需要出生時辰"
        if b.full_name:
            try:
                xm = cast("xingming", b).payload
                out += f"\n姓名：{xm['surname']}{xm['given']}，" + "、".join(f"{g['name']}{g['number']}" for g in xm["grids"]) + f"，三才{xm['sancai']}"
            except NameInputError as e:
                out += f"\n姓名學：{e}"
        return out
    if text.startswith("/reading"):
        try:
            r, _ = make_reading(system, b)
        except NeedsBirthTime:
            return "紫微需要出生時辰，請用 /birth 補上時間。"
        u = r.usage or {}
        limits.add_cost(r.cost_usd, kind="tg_reading", backend=r.backend, model=r.model,
                        input_tokens=u.get("input_tokens", 0), output_tokens=u.get("output_tokens", 0), cache_read_tokens=u.get("cache_read_tokens", 0))
        body = "\n\n".join(f"【{s.title}・{s.direction}】\n{s.text}\n依據：{', '.join(s.evidence) or '無'}" for s in r.sections)
        return f"{body}\n\n查核：{r.checks['summary']}\n{r.disclaimer}"
    out = chat(u["session_id"], text, b)
    u["session_id"] = out["session_id"]
    if out.get("usage") and out.get("backend"):
        limits.add_cost(0.0, kind="tg_chat", backend=out["backend"], model=out.get("model", ""),
                        input_tokens=out["usage"]["input_tokens"], output_tokens=out["usage"]["output_tokens"])
    tail = f"\n依據：{', '.join(out['evidence'])}" if out.get("evidence") else ""
    return out["reply"] + tail


def run() -> None:
    token = get_settings().telegram_bot_token
    if not token:
        raise SystemExit("請在 .env 設定 TELEGRAM_BOT_TOKEN")
    base = f"https://api.telegram.org/bot{token}"
    offset = None
    print("→ Telegram 機器人啟動（long polling）")
    with httpx.Client(timeout=40) as c:
        while True:
            try:
                r = c.get(f"{base}/getUpdates", params={"timeout": 30, **({"offset": offset} if offset else {})}).json()
                for upd in r.get("result", []):
                    offset = upd["update_id"] + 1
                    msg = upd.get("message") or {}
                    if "text" not in msg:
                        continue
                    reply = handle(msg["from"]["id"], msg["text"])
                    c.post(f"{base}/sendMessage", json={"chat_id": msg["chat"]["id"], "text": reply[:4000]})
            except Exception as e:  # noqa: BLE001
                print(f"[bot] {e}")
                time.sleep(3)
