"""同一張盤問三次（6-5）。用法：python -m fortune.tools.consistency bazi 1990-06-15 14:30 female [runs]"""

from __future__ import annotations

import sys


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    from fortune.cli import _birth
    from fortune.reading.consistency import consistency_report
    runs = int(argv[-1]) if argv and argv[-1].isdigit() and len(argv[-1]) == 1 else 3
    rep = consistency_report(argv[0], _birth(argv[1:]), runs=runs)
    print(f"後端：{rep['backend']}，跑 {rep['runs']} 次，{'一致' if rep['ok'] else '不一致'}（最低分 {rep['worst_score']}）")
    for s in rep["sections"]:
        print(f"  {s['title']}：方向 {'/'.join(s['directions'])} {'✓' if s['direction_consistent'] else '✗'}  依據相似 {s['evidence_similarity']}  用詞相似 {s['mention_similarity']}  → {s['score']}")
    print(rep["note"])
    return 0 if rep["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
