"""排盤驗收（4-2）— 拿標準命例逐格比對引擎排出的盤，對不上的自動列出。

用法：python -m fortune.tools.chart_check [tests/cases/standard_cases.yaml] [--json]
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import yaml

from fortune.birth import BirthInput
from fortune.config import ROOT

DEFAULT = ROOT / "tests" / "cases" / "standard_cases.yaml"


def run_case(case: dict) -> dict:
    from fortune.bazi import engine as B
    from fortune.ziwei import engine as Z
    from fortune.ziwei.engine import NeedsBirthTime

    from fortune.school import resolve as _resolve_school
    birth = BirthInput.model_validate(case["birth"])
    school = _resolve_school(case.get("school"), case.get("overrides"))
    exp = case.get("expect", {})
    diffs: list[dict] = []
    got: dict = {}

    if "bazi" in exp:
        c = B.cast(birth, school=school)
        got["bazi"] = {k: p.gz for k, p in c.pillars.items()}
        for k, want in exp["bazi"].items():
            if k in ("year", "month", "day", "hour"):
                have = got["bazi"].get(k, "（無）")
                if have != want:
                    diffs.append({"system": "bazi", "field": k, "want": want, "got": have})
            elif k == "strength":
                have = c.strength["label"].split("（")[0]
                if have != want:
                    diffs.append({"system": "bazi", "field": k, "want": want, "got": have})
    if "ziwei" in exp:
        try:
            z = Z.cast(birth, school=school)
            life = z.palace("命宮")
            got["ziwei"] = {"life_branch": z.life_branch, "body_branch": z.body_branch, "five_class": z.five_class,
                            "life_major": life.major, "ziwei_branch": next(p.branch for p in z.palaces if "紫微" in p.major)}
            for k, want in exp["ziwei"].items():
                have = got["ziwei"].get(k)
                if k == "life_major":
                    if sorted(have) != sorted(want):
                        diffs.append({"system": "ziwei", "field": k, "want": want, "got": have})
                elif k == "palace":            # {宮名: [星…]} 子集合比對
                    for pname, stars in want.items():
                        p = z.palace(pname)
                        have_stars = p.major + p.lucky + p.unlucky + p.other
                        missing = [s for s in stars if s not in have_stars]
                        if missing:
                            diffs.append({"system": "ziwei", "field": f"palace.{pname}", "want": stars, "got": have_stars})
                elif have != want:
                    diffs.append({"system": "ziwei", "field": k, "want": want, "got": have})
        except NeedsBirthTime:
            if exp["ziwei"] != "needs_birth_time":
                diffs.append({"system": "ziwei", "field": "cast", "want": exp["ziwei"], "got": "needs_birth_time"})
            got["ziwei"] = "needs_birth_time"
    if "xingming" in exp:
        from fortune.xingming import engine as N
        nc = N.analyze(birth.full_name or "", N.Rules(**school.xingming.model_dump()))
        got["xingming"] = {"strokes": [c.strokes for c in nc.chars], "sancai": nc.sancai,
                           **{N.GRID_IDS[k]: g.number for k, g in nc.grids.items()}}
        for k, want in exp["xingming"].items():
            have = got["xingming"].get(k)
            if have != want:
                diffs.append({"system": "xingming", "field": k, "want": want, "got": have})
    return {"id": case["id"], "title": case.get("title", ""), "note": case.get("note", ""), "ok": not diffs, "diffs": diffs, "got": got}


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    if "--help" in argv or "-h" in argv:
        print(__doc__)
        return 0
    path = Path(next((a for a in argv if not a.startswith("--")), DEFAULT))
    cases = yaml.safe_load(path.read_text(encoding="utf-8"))
    results = [run_case(c) for c in cases]
    if "--json" in argv:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        for r in results:
            mark = "✓" if r["ok"] else "✗"
            print(f"{mark} {r['id']}  {r['title']}")
            for d in r["diffs"]:
                print(f"    {d['system']}.{d['field']}: 期望 {d['want']}，實得 {d['got']}")
            if not r["ok"] and r["note"]:
                print(f"    提示：{r['note']}")
        bad = sum(1 for r in results if not r["ok"])
        print(f"\n{len(results) - bad}/{len(results)} 命例通過")
    return 0 if all(r["ok"] for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
