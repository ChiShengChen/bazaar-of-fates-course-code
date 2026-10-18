"""FastAPI 後端 — 契約見 docs/api.md。根路徑直接提供 web/ 靜態網頁。"""

from __future__ import annotations

import json
from collections.abc import Iterator
from typing import Any

from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from fortune.api import limits
from fortune.bazi.synastry import synastry as do_synastry
from fortune.birth import BirthInput
from fortune.chart import cast
from fortune.chat.session import chat as do_chat
from fortune.chat.session import delete_session
from fortune.config import ROOT, get_settings
from fortune.knowledge.store import get_card, load_cards
from fortune.reading.checks import run_checks
from fortune.reading.consistency import consistency_report
from fortune.reading.persona import load_persona
from fortune.reading.report import Reading, make_reading, stream_reading
from fortune.xingming.engine import NameInputError
from fortune.xingming.engine import analyze as analyze_name
from fortune.ziwei.engine import NeedsBirthTime

app = FastAPI(title="AI 命理師（課程版）", version="0.1.0")


# ---------------------------------------------------------------- 共通
def _err(status: int, code: str, message: str, **extra: Any) -> JSONResponse:
    return JSONResponse(status_code=status, content={"error": code, "message": message, **extra})


def _name_error(e: NameInputError) -> JSONResponse:
    return _err(422, e.code, str(e))


def _name_guard(system: str, birth: BirthInput) -> JSONResponse | None:
    """姓名學在扣用量之前先驗姓名（沒填、非中文、查不到筆畫），錯了直接回 422。"""
    if system != "xingming":
        return None
    try:
        analyze_name(birth.full_name or "")
    except NameInputError as e:
        return _name_error(e)
    return None


@app.middleware("http")
async def maintenance_gate(request: Request, call_next):
    """緊急開關（8-3）：MAINTENANCE=1 時所有 /api 回 503，靜態頁仍可開。"""
    if get_settings().maintenance and request.url.path.startswith("/api") and request.url.path != "/api/health":
        return _err(503, "maintenance", "命理師暫時休息中，請稍後再來")
    return await call_next(request)


def _ip(request: Request) -> str:
    return request.headers.get("x-forwarded-for", request.client.host if request.client else "?").split(",")[0].strip()


def _count(request: Request, weight: int = 1) -> JSONResponse | None:
    try:
        limits.check_and_count(_ip(request), weight=weight)
    except limits.LimitExceeded as e:
        return _err(429, "rate_limited", e.reason)
    return None


class LLMOverride(BaseModel):
    """使用者自帶金鑰、自選模型（只用於這一個請求，不存伺服器、不進日誌）。"""
    backend: str
    api_key: str = ""
    model: str = ""
    base_url: str = ""
    thinking: str = ""


class SchoolMixin(BaseModel):
    school: str | None = None                                    # schools/<name>.yaml
    overrides: dict[str, dict[str, str]] | None = None           # {"bazi": {"late_zi": "same_day"}, ...}
    llm: LLMOverride | None = None                               # 自帶金鑰／自選模型


class _LLMCtx:
    """把請求的 llm 覆寫放進 contextvar；離開時還原。"""

    def __init__(self, llm: LLMOverride | None):
        from fortune.reading import providers
        self._cv = providers.REQUEST_LLM
        self._val = llm.model_dump() if llm else None
        if self._val:
            try:
                providers.from_override(self._val)             # 先驗證，錯就 400
            except ValueError as e:
                raise _SchoolError(f"AI 設定有誤：{e}")

    def __enter__(self):
        self._tok = self._cv.set(self._val)
        return self

    def __exit__(self, *a):
        self._cv.reset(self._tok)


class CastRequest(SchoolMixin):
    system: str = "bazi"
    birth: BirthInput


class AllRequest(SchoolMixin):
    birth: BirthInput


class ReadingRequest(SchoolMixin):
    system: str = "bazi"
    birth: BirthInput
    focus: str | None = None


class SynastryRequest(SchoolMixin):
    a: BirthInput
    b: BirthInput


class ChatRequest(SchoolMixin):
    session_id: str | None = None
    birth: BirthInput | None = None
    message: str


def _school(req: SchoolMixin):
    from fortune.school import resolve
    try:
        return resolve(req.school, req.overrides)
    except (KeyError, ValueError) as e:
        raise _SchoolError(str(e))


class _SchoolError(Exception):
    pass


@app.exception_handler(_SchoolError)
async def _school_error(request: Request, exc: _SchoolError):
    msg = str(exc)
    return _err(400, "bad_llm" if msg.startswith("AI 設定") else "bad_school", msg if msg.startswith("AI 設定") else f"流派設定有誤：{msg}")


class CheckRequest(BaseModel):
    reading: dict[str, Any]
    chart: dict[str, Any]


class ConsistencyRequest(SchoolMixin):
    system: str = "bazi"
    birth: BirthInput
    runs: int = Field(default=3, ge=2, le=5)


# ---------------------------------------------------------------- 端點
@app.get("/api/health")
def health() -> dict[str, Any]:
    from fortune.reading.providers import describe, resolve
    s = get_settings()
    p = resolve()
    return {"status": "ok", "maintenance": s.maintenance, "backend": p.backend if p.ready else "mock",
            "provider": p.label if p.ready else "離線模式", "model": p.model if p.ready else None,
            "model_info": describe(p) if p.ready else None, "cards": len(load_cards())}


@app.post("/api/llm/models")
def api_llm_models(req: LLMOverride):
    """自帶金鑰：驗證金鑰並列出可用模型（金鑰只用於這次呼叫）。"""
    from fortune.reading.providers import PRESETS, list_models
    try:
        return list_models(req.model_dump())
    except ValueError as e:
        return _err(400, "bad_llm", f"AI 設定有誤：{e}", backends=list(PRESETS))


@app.get("/api/llm/backends")
def api_llm_backends() -> dict[str, Any]:
    from fortune.reading.providers import PRESETS
    return {"backends": [{"name": k, "label": v["label"], "default_model": v["model"], "base_url": v["base_url"],
                          "needs_key": k != "openai_compatible"} for k, v in PRESETS.items()],
            "thinking": ["default", "off", "low", "high"]}


@app.get("/api/geo")
def api_geo(place: str, date: str | None = None) -> dict[str, Any]:
    """出生地 → 經緯度、時區（台灣日光節約時間依出生日自動加一小時並說明）。"""
    from datetime import date as _d
    from fortune.geo import lookup
    hit = lookup(place, _d.fromisoformat(date) if date else None)
    return hit or {"name": None, "message": f"查不到「{place}」，請手動填經度與時區"}


@app.get("/api/cities")
def api_cities() -> list[dict[str, Any]]:
    from fortune.geo import cities
    return cities()


@app.get("/api/schools")
def api_schools() -> dict[str, Any]:
    from fortune.school import list_schools, resolve, schema
    return {"schools": list_schools(), "default": resolve().name, "schema": schema()}


@app.post("/api/cast")
def api_cast(req: CastRequest):
    try:
        return cast(req.system, req.birth, school=_school(req))
    except NeedsBirthTime as e:
        return _err(422, "needs_birth_time", "紫微斗數需要出生時辰，請對照候選命宮補填", candidates=e.candidates)
    except NameInputError as e:
        return _name_error(e)
    except KeyError as e:
        return _err(400, "bad_request", str(e))


@app.post("/api/cast/all")
def api_cast_all(req: AllRequest):
    sch = _school(req)
    out: dict[str, Any] = {"bazi": cast("bazi", req.birth, school=sch), "ziwei": None, "ziwei_candidates": None,
                           "xingming": None, "xingming_error": None}
    try:
        out["ziwei"] = cast("ziwei", req.birth, school=sch)
    except NeedsBirthTime as e:
        out["ziwei_candidates"] = e.candidates
    if req.birth.full_name:                       # 姓名學只在填了完整姓名時排
        try:
            out["xingming"] = cast("xingming", req.birth, school=sch)
        except NameInputError as e:
            out["xingming_error"] = str(e)
    return out


@app.post("/api/reading")
def api_reading(req: ReadingRequest, request: Request):
    if (r := _name_guard(req.system, req.birth) or _count(request)):
        return r
    try:
        with _LLMCtx(req.llm):
            reading, _chart = make_reading(req.system, req.birth, focus=req.focus, school=_school(req))
    except NeedsBirthTime as e:
        return _err(422, "needs_birth_time", "紫微斗數需要出生時辰", candidates=e.candidates)
    _charge(reading, "reading")
    return reading


def _charge(reading: Reading, kind: str) -> None:
    u = reading.usage or {}
    limits.add_cost(reading.cost_usd, kind=kind, backend=reading.backend, model=reading.model, byok=reading.byok,
                    input_tokens=u.get("input_tokens", 0), output_tokens=u.get("output_tokens", 0), cache_read_tokens=u.get("cache_read_tokens", 0))


def _sse(event: str, data: Any) -> str:
    return f"event: {event}\ndata: {json.dumps(data, ensure_ascii=False, default=str)}\n\n"


@app.post("/api/reading/stream")
def api_reading_stream(req: ReadingRequest, request: Request):
    if (r := _name_guard(req.system, req.birth) or _count(request)):
        return r

    _LLMCtx(req.llm)                     # 先驗證設定（錯就 400，而不是串流中才失敗）
    school = _school(req)
    from fortune.reading import providers as _prov
    provider = _prov.from_override(req.llm.model_dump()) if req.llm else None   # 串流跨執行緒，明確傳 provider

    def gen() -> Iterator[str]:
        try:
            for item in stream_reading(req.system, req.birth, focus=req.focus, school=school, provider=provider):
                if isinstance(item, tuple):
                    reading, _chart = item
                    _charge(reading, "reading_stream")
                    yield _sse("done", reading.model_dump(mode="json"))
                else:
                    yield _sse("delta", {"text": item})
        except NeedsBirthTime as e:
            yield _sse("error", {"error": "needs_birth_time", "message": "紫微斗數需要出生時辰", "candidates": e.candidates})
        except Exception as e:  # noqa: BLE001
            yield _sse("error", {"error": "internal", "message": str(e)})

    return StreamingResponse(gen(), media_type="text/event-stream", headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"})


@app.post("/api/synastry")
def api_synastry(req: SynastryRequest, request: Request):
    if (r := _count(request)):
        return r
    with _LLMCtx(req.llm):
        return do_synastry(req.a, req.b, school=_school(req))


@app.post("/api/chat")
def api_chat(req: ChatRequest, request: Request):
    if (r := _count(request)):
        return r
    try:
        with _LLMCtx(req.llm):
            out = do_chat(req.session_id, req.message, req.birth, school=_school(req) if (req.school or req.overrides) else None)
    except KeyError as e:
        return _err(404, "session_not_found", str(e))
    if out.get("action") == "refuse":
        return JSONResponse(status_code=400, content={"error": "refused", "message": f"此類問題（{out.get('topic', '越界')}）不在服務範圍", **out})
    if out.get("usage") and out.get("backend"):
        from fortune.reading.providers import MODEL_PRICES, resolve
        pin, pout = MODEL_PRICES.get(out.get("model", ""), resolve().price())
        usd = round(out["usage"]["input_tokens"] * pin / 1e6 + out["usage"]["output_tokens"] * pout / 1e6, 6)
        out["cost_usd"] = usd
        out["byok"] = bool(req.llm)
        limits.add_cost(usd, kind="chat", backend=out["backend"], model=out.get("model", ""), byok=bool(req.llm),
                        input_tokens=out["usage"]["input_tokens"], output_tokens=out["usage"]["output_tokens"])
    return out


@app.delete("/api/chat/{session_id}")
def api_chat_delete(session_id: str):
    """使用者刪除自己的對話與命盤（8-3 個資）。"""
    return {"deleted": delete_session(session_id)}


@app.post("/api/check")
def api_check(req: CheckRequest):
    from fortune.chart import ChartData
    reading = Reading.model_validate(req.reading)
    chart = ChartData.model_validate(req.chart)
    return run_checks(reading, chart)


@app.post("/api/consistency")
def api_consistency(req: ConsistencyRequest, request: Request):
    if (r := _name_guard(req.system, req.birth) or _count(request, weight=req.runs)):
        return r
    try:
        with _LLMCtx(req.llm):
            rep = consistency_report(req.system, req.birth, runs=req.runs, school=_school(req))
        for r in rep.get("readings", []):
            _charge(Reading.model_validate(r), "consistency")
        rep.pop("readings", None)
        return rep
    except NeedsBirthTime as e:
        return _err(422, "needs_birth_time", "紫微斗數需要出生時辰", candidates=e.candidates)


@app.get("/api/cards")
def api_cards() -> list[dict[str, Any]]:
    return [{"id": c.id, "name": c.name, "type": c.type, "system": c.system} for c in load_cards().values()]


@app.get("/api/cards/{card_id}")
def api_card(card_id: str):
    c = get_card(card_id)
    return c.as_dict() if c else _err(404, "card_not_found", f"沒有 {card_id} 這張卡")


@app.get("/api/persona")
def api_persona() -> dict[str, Any]:
    return load_persona().public()


@app.get("/api/usage")
def api_usage() -> dict[str, Any]:
    return limits.usage()


# 靜態網頁放最後，才不會蓋掉 /api
app.mount("/", StaticFiles(directory=str(ROOT / "web"), html=True), name="web")
