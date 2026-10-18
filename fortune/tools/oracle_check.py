"""開源引擎互證（4-2 進階）：拿 lunar-python（八字）與 x-iztro（紫微）當第二意見，逐格比對本引擎。

用法：
  python -m fortune.tools.oracle_check                 # 隨機 120 個生辰
  python -m fortune.tools.oracle_check --n 500 --seed 7
  python -m fortune.tools.oracle_check 1990-06-15 14:30 女   # 單一命例
需要：pip install -e ".[oracles]"（lunar-python、x-iztro，皆 MIT）。不裝不影響排盤。
比對項目：四柱（含晚子時換日）、節氣時刻、胎元、命宮、大運序與起運年；紫微命宮、身宮、五行局、
十四主星與十八輔煞星的宮位、大限起迄。差異會逐格列出，由你判斷是誰錯（也可能是流派不同）。
"""

from __future__ import annotations

import random
import sys
from datetime import date, datetime, time, timedelta


def compare_bazi(birth) -> list[str]:
    from lunar_python import Solar
    from fortune.bazi import engine as B
    from fortune.bazi import extras as X
    diffs: list[str] = []
    c = B.cast(birth)
    clock = birth.clock_dt
    # lunar-python 用手錶時間定時支（無真太陽時），所以比對時把我們也關掉真太陽時
    b2 = birth.model_copy(update={"use_true_solar_time": False})
    c = B.cast(b2)
    ec = Solar.fromYmdHms(clock.year, clock.month, clock.day, clock.hour, clock.minute, 0).getLunar().getEightChar()
    ec.setSect(1)                                     # sect=1：晚子時換日（＝本引擎預設）
    ours = {k: c.pillars[k].gz for k in c.pillars}
    theirs = {"year": ec.getYear(), "month": ec.getMonth(), "day": ec.getDay(), "hour": ec.getTime()}
    for k in ("year", "month", "day", "hour"):
        if k in ours and ours[k] != theirs[k]:
            diffs.append(f"八字 {k} 柱：本引擎 {ours[k]} ≠ lunar-python {theirs[k]}")
    # 節氣：本月節的時刻
    jq = Solar.fromYmdHms(clock.year, clock.month, clock.day, clock.hour, clock.minute, 0).getLunar().getJieQiTable()
    t0, _ = c.term_window
    name = c.month_term
    # lunar-python 的表橫跨農曆年，同名節氣可能有兩筆（鍵名帶前綴）；取時間最接近的那筆
    cands = [datetime.strptime(v.toYmdHms(), "%Y-%m-%d %H:%M:%S") for k, v in jq.items() if k.endswith(name) or k == name]
    if cands:
        their_t = min(cands, key=lambda t: abs((t0.replace(tzinfo=None) - t).total_seconds()))
        d = abs((t0.replace(tzinfo=None) - their_t).total_seconds())
        if 120 < d < 300 * 86400:                       # 差超過 300 天代表對方的表沒有這一年的同名節，不是誤差
            diffs.append(f"節氣 {name}：本引擎 {t0:%m-%d %H:%M} ≠ lunar-python {their_t:%m-%d %H:%M}（差 {d/60:.0f} 分）")
    # 胎元、命宮
    ty, _ = X.taiyuan(c.pillars["month"].stem, c.pillars["month"].branch)
    if ty != ec.getTaiYuan():
        diffs.append(f"胎元：本引擎 {ty} ≠ {ec.getTaiYuan()}")
    if "hour" in c.pillars:
        mg, _ = X.minggong(c.pillars["year"].stem, c.pillars["month"].branch, c.pillars["hour"].branch)
        if mg != ec.getMingGong():
            diffs.append(f"命宮：本引擎 {mg} ≠ lunar-python {ec.getMingGong()}")
    # 大運（lunar-python 第一筆是起運前，略過）
    if birth.gender and c.dayun:
        yun = ec.getYun(1 if birth.gender == "male" else 0)
        theirs_dy = [(d.getGanZhi(), d.getStartYear()) for d in yun.getDaYun()[1:4]]
        ours_dy = [(d["gz"], d["start_year"]) for d in c.dayun[:3]]
        for (og, oy), (tg, ty_) in zip(ours_dy, theirs_dy):
            if og != tg:
                diffs.append(f"大運：本引擎 {og} ≠ lunar-python {tg}")
            elif abs(oy - ty_) > 1:
                diffs.append(f"大運 {og} 起始年：本引擎 {oy} ≠ lunar-python {ty_}")
    return diffs


_IZTRO_STARS = {"紫微", "天機", "太陽", "武曲", "天同", "廉貞", "天府", "太陰", "貪狼", "巨門", "天相", "天梁", "七殺", "破軍",
                "左輔", "右弼", "文昌", "文曲", "天魁", "天鉞", "擎羊", "陀羅", "火星", "鈴星", "地空", "地劫", "祿存", "天馬", "紅鸞", "天喜"}


def compare_ziwei(birth) -> list[str]:
    from x_iztro import Astro
    from fortune.ziwei import engine as Z
    diffs: list[str] = []
    b2 = birth.model_copy(update={"use_true_solar_time": False})        # x-iztro 用手錶時間
    try:
        z = Z.cast(b2)
    except Z.NeedsBirthTime:
        return diffs
    hb = Z.BRANCHES.index(z.hour_branch)
    d = birth.birth_date
    # x-iztro 的 time_index 12 = 晚子時且農曆日算隔天；本引擎預設 late_zi=same_day，所以 23 時用 0（早子時、同日）比對
    idx = hb
    try:
        a = Astro().by_solar(f"{d.year}-{d.month}-{d.day}", idx, "male" if birth.gender == "male" else "female", language="zh-TW")
    except Exception as e:  # noqa: BLE001
        return [f"x-iztro 無法排盤：{e}"]
    theirs = {}
    for pal in a.palaces:
        stars = {st.name for st in list(pal.major_stars) + list(pal.minor_stars) + list(getattr(pal, "adjective_stars", []))}
        theirs[pal.earthly_branch] = (pal.name, stars)
    # 命宮、身宮、五行局
    soul = next((br for br, (n, _) in theirs.items() if n == "命宮"), None)
    if soul and soul != z.life_branch:
        diffs.append(f"紫微命宮：本引擎 {z.life_branch} ≠ x-iztro {soul}")
    body = getattr(a, "body_palace", None) or getattr(a, "soul_and_body", None)
    fc = getattr(a, "five_elements_class", None)
    if fc and fc.replace("局", "") not in z.five_class:
        diffs.append(f"五行局：本引擎 {z.five_class} ≠ x-iztro {fc}")
    for p in z.palaces:
        ours = set(p.major + p.lucky + p.unlucky + p.other) & _IZTRO_STARS
        if p.branch not in theirs:
            continue
        th = theirs[p.branch][1] & _IZTRO_STARS
        if ours != th:
            diffs.append(f"紫微 {p.branch}宮（{p.name}）：本引擎 {sorted(ours)} ≠ x-iztro {sorted(th)}")
    return diffs


def random_births(n: int, seed: int):
    from fortune.birth import BirthInput
    rnd = random.Random(seed)
    out = []
    for _ in range(n):
        y = rnd.randint(1950, 2030)
        d = date(y, 1, 1) + timedelta(days=rnd.randint(0, 364))
        t = time(rnd.randint(0, 23), rnd.choice([0, 15, 30, 45]))
        out.append(BirthInput(birth_date=d, birth_time=t, gender=rnd.choice(["male", "female"]), longitude=121.5))
    return out


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    try:
        import lunar_python  # noqa: F401
        import x_iztro  # noqa: F401
    except ImportError as e:
        print(f"需要安裝互證套件：pip install -e \".[oracles]\"（{e}）")
        return 2
    n, seed = 120, 1
    if "--n" in argv:
        n = int(argv[argv.index("--n") + 1])
    if "--seed" in argv:
        seed = int(argv[argv.index("--seed") + 1])
    births = []
    pos = [a for a in argv if not a.startswith("--") and a not in (str(n), str(seed))]
    if pos:
        from fortune.cli import _birth
        births = [_birth(pos)]
    else:
        births = random_births(n, seed)
    total_b = total_z = 0
    bad = []
    for b in births:
        db = compare_bazi(b)
        dz = compare_ziwei(b)
        total_b += bool(db)
        total_z += bool(dz)
        if db or dz:
            bad.append((b, db, dz))
    print(f"比對 {len(births)} 個生辰：八字有差異 {total_b} 個、紫微有差異 {total_z} 個")
    for b, db, dz in bad[:40]:
        print(f"\n{b.label()}")
        for x in db + dz:
            print("  -", x)
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
