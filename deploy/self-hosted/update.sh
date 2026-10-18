#!/usr/bin/env bash
# 更新到 GitHub 最新版並重啟：sudo -u fortune /opt/fortune/app/deploy/self-hosted/update.sh
set -euo pipefail
cd /opt/fortune/app
git pull --ff-only
.venv/bin/pip install -q -e ".[llm,oracles]"
.venv/bin/python -m pytest -q --ignore=tests/e2e -x >/dev/null && echo "✓ tests ok" || { echo "✗ tests failed, not restarting"; exit 1; }
sudo systemctl restart fortune
systemctl is-active fortune-bot >/dev/null 2>&1 && sudo systemctl restart fortune-bot || true
sleep 2
curl -fsS http://127.0.0.1:8000/api/health | head -c 200; echo
