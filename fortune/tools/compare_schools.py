"""同一張盤、不同流派逐格比對（4-3「流派不是對錯，是可查的選擇」）。

用法：
  python -m fortune.tools.compare_schools 1990-06-15 14:30 女 --schools default clock-time zhongqi-tianfu
  python -m fortune.tools.compare_schools 2000-01-07 23:30 男 --schools default clock-time --system bazi
  python -m fortune.tools.compare_schools 1990-06-15 14:30 女 --system ziwei --schools default my-school --detail
只印出值不同的事實；全部相同就說「兩派在這張盤上排出來一樣」。
--detail：連事實的備註一起比（紫微各宮的吉星、煞星記在備註裡，例如天魁天鉞換宮）；格數照值與備註算。
參數順序不拘：--schools 後面接到下一個 -- 開頭的參數為止。
"""

from __future__ import annotations

import sys


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    if "--schools" not in argv:
        print(__doc__)
        return 1
    i = argv.index("--schools")
    names = []
    for a in argv[i + 1:]:
        if a.startswith("--"):
            break
        names.append(a)
    systems = ["bazi", "ziwei"]
    if "--system" in argv:
        systems = [argv[argv.index("--system") + 1]]
    detail = "--detail" in argv
    skip = set(range(i, i + 1 + len(names)))
    if "--system" in argv:
        skip |= {argv.index("--system"), argv.index("--system") + 1}
    rest = [a for k, a in enumerate(argv) if k not in skip and a != "--detail"]
    from fortune.chart import cast
    from fortune.cli import _birth
    from fortune.school import load_school
    from fortune.ziwei.engine import NeedsBirthTime

    birth = _birth(rest)
    print(f"命例：{birth.label()}\n")
    for sch in names:
        s = load_school(sch)
        print(f"- {s.name}：{s.summary()}")
    print()
    any_diff = False
    for system in systems:
        charts = {}
        for sch in names:
            try:
                charts[sch] = cast(system, birth, school=load_school(sch), with_alternatives=False)
            except NeedsBirthTime:
                print(f"[{system}] 需要時辰，略過")
                charts = {}
                break
        if not charts:
            continue
        base = charts[names[0]]
        rows = []
        for f in base.facts:
            facts = [charts[n].fact(f.id) for n in names]
            vals = [(x.value + (f"（{x.note}）" if detail and x.note else "")) if x else "—" for x in facts]
            if len(set(vals)) > 1:
                rows.append((f.id, f.label, vals))
        print(f"## {base.system_zh}：{len(rows)} 格不同")
        if rows:
            any_diff = True
            print("| 事實 | " + " | ".join(names) + " |")
            print("|---|" + "---|" * len(names))
            for fid, label, vals in rows:
                print(f"| {label}（{fid}） | " + " | ".join(vals) + " |")
        print()
    if not any_diff:
        print("這幾派在這張盤上排出來一樣。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
