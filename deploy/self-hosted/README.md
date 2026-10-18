# 自管主機部署（Ubuntu／Debian，含你的網域與 HTTPS）

適合：自己的機器（例如那台 3090）、有一個網域、能開 80/443。整套約 20 分鐘。
3090 另一個用途：跑本機模型（Ollama），第 9 章示範「AI 費用 0」。

## 0. 前置
- 網域的 **A 記錄** 指到這台機器的對外 IP（例如 `fortune.example.com → 1.2.3.4`）
- 路由器／防火牆開 **80、443**（Caddy 用）；8000 **不要**對外開（只給本機反向代理）
- 機器上有 Python 3.10–3.13、git

## 1. 建使用者與目錄
```bash
sudo useradd -r -m -d /opt/fortune -s /usr/sbin/nologin fortune
sudo mkdir -p /opt/fortune/app && sudo chown fortune:fortune /opt/fortune/app
sudo -u fortune git clone https://github.com/ChiShengChen/bazaar-of-fates-course-code.git /opt/fortune/app
cd /opt/fortune/app
sudo -u fortune python3 -m venv .venv
sudo -u fortune .venv/bin/pip install -e ".[llm,oracles]"
sudo -u fortune cp .env.example .env
sudo -u fortune chmod 600 .env          # 金鑰只有這個使用者讀得到
sudo -u fortune nano .env               # LLM_BACKEND=deepseek、LLM_API_KEY=…；上線用的上限見下方
sudo -u fortune mkdir -p data
```
私有 repo 要先在機器上設 GitHub 存取（deploy key 或 token）。

建議的上線 `.env`：
```
LLM_BACKEND=deepseek
LLM_API_KEY=sk-…
RATE_LIMIT_PER_IP_PER_DAY=10
DAILY_READING_CAP=300
DAILY_BUDGET_USD=5
SESSION_TTL_HOURS=24
MAINTENANCE=0
```

## 2. systemd（開機自動啟動、掛掉自動重啟）
```bash
sudo cp deploy/self-hosted/fortune.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now fortune
systemctl status fortune --no-pager
curl -s http://127.0.0.1:8000/api/health
```
看到 `"backend":"deepseek"` 就對了。日誌：`journalctl -u fortune -f`。

## 3. Caddy（反向代理＋自動 HTTPS）
```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
sudo cp deploy/self-hosted/Caddyfile /etc/caddy/Caddyfile
sudo sed -i 's/fortune.example.com/你的網域/' /etc/caddy/Caddyfile
sudo systemctl reload caddy
```
Caddy 會自動向 Let's Encrypt 申請憑證（需要 80/443 通、DNS 已生效）。打開 `https://你的網域/`，頁首應顯示綠點 DeepSeek。
`Caddyfile` 裡 `flush_interval -1` 是給解讀串流用的，少了會變成一次吐完。

## 4. Telegram 機器人（選做）
```bash
echo 'TELEGRAM_BOT_TOKEN=…' | sudo -u fortune tee -a .env
sudo cp deploy/self-hosted/fortune-bot.service /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now fortune-bot
journalctl -u fortune-bot -f
```
long polling 只需要對外連線，不用開 port。

## 5. 更新
```bash
sudo -u fortune /opt/fortune/app/deploy/self-hosted/update.sh
```
會 `git pull`、裝相依、跑測試（失敗就不重啟）、重啟服務、打 health。

## 6. 緊急開關與備份
- 關站：`.env` 改 `MAINTENANCE=1` → `sudo systemctl restart fortune`；所有 `/api` 回 503，網頁顯示「命理師暫時休息中」
- 備份：`data/cost_log.csv`（成本紀錄）、`data/usage.json`（今日用量）、`data/sessions/`（對話，24 小時自動清）；`.env` 另外存
- 防火牆：`sudo ufw allow 80,443/tcp && sudo ufw enable`（8000 不開）

## 7. 用 3090 跑本機模型（第 9 章「AI 費用 0」的示範，選做）
```bash
curl -fsSL https://ollama.com/install.sh | sh
ollama pull qwen2.5:14b          # 24GB 顯存可跑 14b；32b 用 q4 量化也可
```
`.env` 改：
```
LLM_BACKEND=openai_compatible
LLM_BASE_URL=http://127.0.0.1:11434/v1
LLM_MODEL=qwen2.5:14b
LLM_API_KEY=
```
重啟後頁首顯示「OpenAI 相容端點・qwen2.5:14b」。品質未實測：跑 `python -m fortune.tools.compare_models bazi 1990-06-15 14:30 女 --models qwen2.5:14b` 看查核通過率，結果貼到 `docs/validation-models.md`。
使用者也可以在網頁「AI 設定」自帶金鑰指到別家，站台用本機模型當預設。

## 常見問題
| 症狀 | 看哪裡 |
|---|---|
| `systemctl status fortune` failed | `journalctl -u fortune -n 50`；多半是 `.env` 權限或 venv 路徑 |
| 網域打不開、Caddy 申請憑證失敗 | DNS 還沒生效（`dig 你的網域`）、80/443 沒開、`journalctl -u caddy` |
| 解讀不是逐字出現 | Caddyfile 少了 `flush_interval -1` |
| 頁首黃點「離線示範模式」 | `.env` 的 `LLM_API_KEY` 沒填或 service 沒讀到（`EnvironmentFile` 路徑） |
