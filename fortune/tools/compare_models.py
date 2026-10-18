"""同一張盤跑多個模型，比品質（查核、字數、是否截斷）與費用（9-1 挑模型）。

用法：
  python -m fortune.tools.compare_models bazi 1990-06-15 14:30 女 --models deepseek-flash deepseek-v4-pro
  python -m fortune.tools.compare_models bazi 1990-06-15 14:30 女 --backend anthropic --models claude-sonnet-5-5 claude-haiku-5-5
  --thinking off|low|high|default 可指定思考深度；模型名後加 @off／@high 可逐一指定，例如 deepseek-flash@default deepseek-flash@off
會印出 Markdown 表格，可直接貼進 docs/validation-models.md。
"""

from __future__ import annotations

import os
import sys
import time


def main(argv: list[str] | None = None) -> int:
    argv = sys.argv[1:] if argv is None else argv
    if "--models" not in argv:
        print(__doc__)
        return 1
    i = argv.index("--models")
    models = argv[i + 1:]
    rest = argv[:i]
    backend = None
    if "--backend" in rest:
        j = rest.index("--backend")
        backend = rest[j + 1]
        rest = rest[:j] + rest[j + 2:]
    from fortune.cli import _birth
    from fortune.config import get_settings
    from fortune.reading import providers
    from fortune.reading.report import make_reading

    system, birth = rest[0], _birth(rest[1:])
    rows = []
    if "--thinking" in rest:
        j = rest.index("--thinking")
        os.environ["LLM_THINKING"] = rest[j + 1]
        rest = rest[:j] + rest[j + 2:]
    for spec in models:
        m, _, think = spec.partition("@")
        if think:
            os.environ["LLM_THINKING"] = think
        os.environ["LLM_MODEL"] = m
        if backend:
            os.environ["LLM_BACKEND"] = backend
        get_settings.cache_clear()
        providers.LAST_SERVED.clear()
        t0 = time.time()
        r, _ = make_reading(system, birth)
        dt = time.time() - t0
        chars = sum(len(s.text) for s in r.sections)
        missing = sum(1 for s in r.sections if "缺漏" in s.text)
        issues = sum(len(r.checks[k]["issues"]) for k in ("chart_check", "citation_check", "boundary_check"))
        served = providers.LAST_SERVED.get("model") or m
        rows.append((spec, served, r.backend, r.usage.get("input_tokens", 0), r.usage.get("output_tokens", 0), r.cost_usd, f"{dt:.1f}s",
                     r.checks["summary"].split("（")[0], issues, chars, missing, "是" if any("截斷" in w or "重試" in w for w in r.warnings) else "否"))
    print(f"命例：{birth.label()}　系統：{system}\n")
    print("| 設定模型 | 實際模型 | 後端 | in tok | out tok | 費用 | 耗時 | 查核 | 問題數 | 總字數 | 缺段 | 曾截斷 |")
    print("|---|---|---|---:|---:|---:|---:|---|---:|---:|---:|---|")
    for row in rows:
        m, served, be, i_, o_, usd, dt, chk, iss, chars, miss, trunc = row
        print(f"| {m} | {served} | {be} | {i_:,} | {o_:,} | ${usd:.4f} | {dt} | {chk} | {iss} | {chars} | {miss} | {trunc} |")
    return 0


if __name__ == "__main__":
    sys.exit(main())
