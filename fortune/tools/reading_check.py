"""解讀查核（第 6 章）— 對一份解讀跑三種查核，把結果用白話列出，交給人決定怎麼改。

用法：
  python -m fortune.tools.reading_check reading.json chart.json
  python -m fortune.tools.reading_check --demo bazi 1990-06-15 14:30 female   （現場產一份再查）
"""

from __future__ import annotations

import json
import sys


def explain(checks: dict) -> str:
    lines = [f"查核結果：{checks['summary']}"]
    for key in ("chart_check", "citation_check", "boundary_check"):
        c = checks[key]
        lines.append(f"\n[{'通過' if c['ok'] else '未通過'}] {c['label']}")
        for i in c["issues"]:
            where = i.get("section", "")
            what = i.get("sentence") or i.get("item") or ""
            lines.append(f"  - 段落「{where}」：{i['rule']}\n      → {what}")
    return "\n".join(lines)


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    if argv and argv[0] == "--demo":
        from fortune.cli import _birth
        from fortune.reading.report import make_reading
        r, chart = make_reading(argv[1], _birth(argv[2:]))
        checks = r.checks
    else:
        from fortune.chart import ChartData
        from fortune.reading.checks import run_checks
        from fortune.reading.report import Reading
        r = Reading.model_validate(json.loads(open(argv[0], encoding="utf-8").read()))
        chart = ChartData.model_validate(json.loads(open(argv[1], encoding="utf-8").read()))
        checks = run_checks(r, chart)
    print(explain(checks))
    return 0 if checks["passed"] else 1


if __name__ == "__main__":
    sys.exit(main())
