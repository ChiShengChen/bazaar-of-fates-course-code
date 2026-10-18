"""命令列：
  python -m fortune                 啟動網站（http://localhost:8000）
  python -m fortune cast 1990-06-15 14:30 female   在終端機直接排盤
  python -m fortune reading bazi 1990-06-15 14:30 female
  python -m fortune name 陳美玲 1990-06-15 14:30 女    姓名學（五格、三才、81 數理、配八字喜用）
  python -m fortune reading xingming 陳美玲 1990-06-15 14:30 女
  python -m fortune bot             啟動 Telegram 機器人（需 TELEGRAM_BOT_TOKEN）
"""

from __future__ import annotations

import sys


def _birth(args: list[str]):
    """參數順序不拘：日期（1990-06-15）、時間（14:30）、性別（男/女/male/female）、姓名（中文，姓名學用）。"""
    from fortune.birth import BirthInput
    genders = ("male", "female", "男", "女")
    d = next(a for a in args if a[:4].isdigit() and "-" in a)
    t = next((a for a in args if ":" in a), None)
    g = next((a for a in args if a in genders), None)
    n = next((a for a in args if a not in genders and any("一" <= ch <= "鿿" for ch in a)), None)
    return BirthInput(birth_date=d, birth_time=t, gender=g, longitude=121.5, full_name=n)


def main(argv: list[str] | None = None) -> None:
    argv = sys.argv[1:] if argv is None else argv
    cmd = argv[0] if argv else "serve"
    if cmd == "serve":
        import uvicorn
        from fortune.config import get_settings
        from fortune.reading.providers import resolve
        s = get_settings()
        p = resolve()
        print(f"→ AI 命理師啟動：http://localhost:{s.listen_port}  （解讀後端：{p.label + '・' + p.model if p.ready else 'mock 離線模式'}）")
        uvicorn.run("fortune.api.main:app", host=s.api_host, port=s.listen_port, reload="--reload" in argv)
    elif cmd == "cast":
        from fortune.chart import cast
        from fortune.ziwei.engine import NeedsBirthTime
        b = _birth(argv[1:])
        print(cast("bazi", b).facts_text())
        try:
            print("\n" + cast("ziwei", b).facts_text())
        except NeedsBirthTime as e:
            print("\n紫微需要時辰；候選命宮：")
            for c in e.candidates:
                print(f"  {c['hour_branch']}時 {c['clock']} → 命宮{c['life_branch']} {'、'.join(c['life_major'])}")
    elif cmd == "name":
        from fortune.chart import cast
        from fortune.xingming.engine import NameInputError
        try:
            print(cast("xingming", _birth(argv[1:])).facts_text())
        except NameInputError as e:
            print(f"姓名學：{e}")
    elif cmd == "reading":
        from fortune.reading.report import make_reading
        system = argv[1]
        r, _ = make_reading(system, _birth(argv[2:]))
        for s in r.sections:
            print(f"\n## {s.title}（{s.direction}）\n{s.text}\n依據：{', '.join(s.evidence)}\n知識卡：{', '.join(s.cards) or '無'}")
        print("\n查核：", r.checks["summary"])
    elif cmd == "bot":
        from fortune.bot.telegram import run
        run()
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
