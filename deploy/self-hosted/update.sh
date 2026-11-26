#!/usr/bin/env bash
# 以 fortune 更新程式並執行離線驗收。通過後由管理者另行重啟服務。
set -euo pipefail
cd "$(dirname -- "${BASH_SOURCE[0]}")/../.."
git pull --ff-only
.venv/bin/python -m pip install -q -e ".[dev,llm,oracles]"
export LLM_BACKEND=mock LLM_API_KEY= ANTHROPIC_API_KEY=
.venv/bin/python -m pytest -q --ignore=tests/e2e -x
.venv/bin/python -m fortune.tools.chart_check
printf '%s\n' '驗收通過。請由管理者重啟 fortune，再確認服務狀態和 /api/health。'
