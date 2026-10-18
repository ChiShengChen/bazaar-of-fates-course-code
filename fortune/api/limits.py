"""用量上限與緊急開關（8-2）— 公開之後任何人都能用，帳單不能被陌生人刷爆。

- 每個 IP 每日次數（RATE_LIMIT_PER_IP_PER_DAY）
- 全站每日解讀次數（DAILY_READING_CAP）
- 每日預算（DAILY_BUDGET_USD；用 LLM 回報的 token 估算）
- MAINTENANCE=1 → 全站回 503
計數存在 data/usage.json，重啟不歸零；每天自動換日。
"""

from __future__ import annotations

import json
import threading
from datetime import date
from typing import Any

from fortune.config import get_settings

_lock = threading.Lock()
_state: dict[str, Any] = {"day": "", "per_ip": {}, "total": 0, "cost_usd": 0.0}


def _path():
    return get_settings().data_dir / "usage.json"


def _load() -> None:
    p = _path()
    if p.exists():
        try:
            _state.update(json.loads(p.read_text(encoding="utf-8")))
        except Exception:  # noqa: BLE001
            pass


def _save() -> None:
    p = _path()
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(_state), encoding="utf-8")


def _roll() -> None:
    today = date.today().isoformat()
    if _state["day"] != today:
        _state.update({"day": today, "per_ip": {}, "total": 0, "cost_usd": 0.0})


_load()


class LimitExceeded(Exception):
    def __init__(self, reason: str):
        super().__init__(reason)
        self.reason = reason


def check_and_count(ip: str, *, weight: int = 1) -> None:
    """解讀類請求進來先呼叫；超限丟 LimitExceeded。ip 也可以是 Telegram user id 之類的識別字串。"""
    s = get_settings()
    with _lock:
        _roll()
        if _state["per_ip"].get(ip, 0) + weight > s.rate_limit_per_ip_per_day:
            raise LimitExceeded(f"今日次數已達上限（每人每日 {s.rate_limit_per_ip_per_day} 次），明天再來")
        if _state["total"] + weight > s.daily_reading_cap:
            raise LimitExceeded("今日全站解讀次數已達上限，命理師休息中")
        if _state["cost_usd"] >= s.daily_budget_usd:
            raise LimitExceeded("今日 AI 預算已用完，命理師休息中")
        _state["per_ip"][ip] = _state["per_ip"].get(ip, 0) + weight
        _state["total"] += weight
        _save()


def add_cost(usd: float, *, kind: str = "", backend: str = "", model: str = "",
             input_tokens: int = 0, output_tokens: int = 0, cache_read_tokens: int = 0, byok: bool = False) -> None:
    """累加今日花費，並把每一筆寫進 data/cost_log.csv（第 9 章成本試算表的原始資料）。
    使用者自帶金鑰（byok）的費用照樣記錄（kind 加 :byok），但不算進站台每日預算。"""
    if backend and backend != "mock":
        log_cost(kind=kind + (":byok" if byok else ""), backend=backend, model=model, input_tokens=input_tokens,
                 output_tokens=output_tokens, cache_read_tokens=cache_read_tokens, usd=usd)
    if usd <= 0 or byok:
        return
    with _lock:
        _roll()
        _state["cost_usd"] = round(_state["cost_usd"] + usd, 5)
        _save()


COST_LOG_HEADER = "time,kind,backend,model,input_tokens,output_tokens,cache_read_tokens,usd"


def log_cost(**row: Any) -> None:
    from datetime import datetime
    p = get_settings().data_dir / "cost_log.csv"
    p.parent.mkdir(parents=True, exist_ok=True)
    new = not p.exists()
    with _lock, p.open("a", encoding="utf-8") as f:
        if new:
            f.write(COST_LOG_HEADER + "\n")
        f.write(",".join(str(x) for x in (datetime.now().isoformat(timespec="seconds"), row.get("kind", ""), row.get("backend", ""),
                                          row.get("model", ""), row.get("input_tokens", 0), row.get("output_tokens", 0),
                                          row.get("cache_read_tokens", 0), f"{row.get('usd', 0):.6f}")) + "\n")


def cost_log_summary(limit: int = 20) -> dict[str, Any]:
    """最近幾筆與各模型平均成本，給 /api/usage。"""
    p = get_settings().data_dir / "cost_log.csv"
    if not p.exists():
        return {"rows": [], "by_model": {}}
    rows = [ln.split(",") for ln in p.read_text(encoding="utf-8").splitlines()[1:] if ln.strip()]
    by: dict[str, dict[str, float]] = {}
    for r in rows:
        if len(r) < 8:
            continue
        key = f"{r[2]}/{r[3]}"
        d = by.setdefault(key, {"count": 0, "usd": 0.0, "input_tokens": 0, "output_tokens": 0})
        d["count"] += 1; d["usd"] += float(r[7]); d["input_tokens"] += int(r[4]); d["output_tokens"] += int(r[5])
    for d in by.values():
        d["avg_usd"] = round(d["usd"] / d["count"], 5) if d["count"] else 0
        d["usd"] = round(d["usd"], 5)
    return {"rows": [dict(zip(COST_LOG_HEADER.split(","), r)) for r in rows[-limit:]], "by_model": by}


def usage() -> dict[str, Any]:
    s = get_settings()
    with _lock:
        _roll()
        return {"day": _state["day"], "total_readings": _state["total"], "cap": s.daily_reading_cap,
                "cost_usd": _state["cost_usd"], "budget_usd": s.daily_budget_usd,
                "per_ip_limit": s.rate_limit_per_ip_per_day, "distinct_ips": len(_state["per_ip"]),
                "maintenance": s.maintenance, "cost_log": cost_log_summary()}
