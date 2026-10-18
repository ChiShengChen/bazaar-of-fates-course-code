"""一致性（6-5）— 同一張盤問 N 次：措辭可以不同，方向與依據不能亂飄。"""

from __future__ import annotations

import re
from datetime import date
from typing import Any

from fortune.birth import BirthInput
from fortune.reading.checks import STARS, TEN_GODS, _GZ
from fortune.reading.report import make_reading


def _mentions(text: str) -> set[str]:
    return {g for g in TEN_GODS if g in text} | {s for s in STARS if s in text} | set(_GZ.findall(text))


def _jaccard(a: set, b: set) -> float:
    return 1.0 if not a and not b else len(a & b) / len(a | b)


def consistency_report(system: str, birth: BirthInput, runs: int = 3, today: date | None = None, school=None) -> dict[str, Any]:
    readings = [make_reading(system, birth, today=today, school=school)[0] for _ in range(max(2, runs))]
    per_section = []
    worst = 1.0
    for i, sec in enumerate(readings[0].sections):
        dirs = [r.sections[i].direction for r in readings]
        evs = [set(r.sections[i].evidence) for r in readings]
        ments = [_mentions(r.sections[i].text) for r in readings]
        ev_sim = min(_jaccard(evs[0], e) for e in evs[1:])
        m_sim = min(_jaccard(ments[0], m) for m in ments[1:])
        same_dir = len(set(dirs)) == 1
        score = round((1.0 if same_dir else 0.0) * 0.6 + ev_sim * 0.25 + m_sim * 0.15, 2)
        worst = min(worst, score)
        per_section.append({"key": sec.key, "title": sec.title, "directions": dirs, "direction_consistent": same_dir,
                            "evidence_similarity": round(ev_sim, 2), "mention_similarity": round(m_sim, 2), "score": score})
    return {
        "runs": len(readings), "backend": readings[0].backend,
        "ok": all(p["direction_consistent"] for p in per_section) and worst >= 0.6,
        "worst_score": worst, "sections": per_section,
        "note": "方向由程式規則決定，應永遠一致；依據與提及詞彙允許些微差異，低於 0.6 代表模型在亂飄",
        "texts": [[s.text for s in r.sections] for r in readings],
        "cost_usd": round(sum(r.cost_usd for r in readings), 5),
        "readings": [r.model_dump(mode="json") for r in readings],   # API 層記帳後會拿掉
    }
