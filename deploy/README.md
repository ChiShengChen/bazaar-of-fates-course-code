# 部署（第 8 章）

三種方式擇一：**自管主機（有自己網域）→ `self-hosted/README.md`**；Render（根目錄 `render.yaml`）；Docker。另外也可以部署到 Vercel，步驟與限制見 [vercel.md](vercel.md)。

## 方式一：Render（推薦，免費方案可跑；用原生 Python 環境，不需 Docker）
1. 把 repo 推上 GitHub（先確認 `.env` 沒被加進去：`git check-ignore .env` 會印出 `.env`）
2. Render → New → Blueprint → 選這個 repo，它會讀根目錄的 `render.yaml`（build：`pip install -e ".[llm]"`；start：`python -m fortune`；程式會聽 Render 給的 `PORT`）
3. 在 Environment 面板填 `LLM_API_KEY`（`LLM_BACKEND` 預設 deepseek，可改 anthropic / openai / gemini）
4. 部署完成後打開網址，先看 `/api/health` 的 `backend` 是不是你設的那家（不是 `mock`）；再排一張盤、解讀一次
5. 免費方案閒置 15 分鐘會休眠，第一次打開要等 30–60 秒；對話 session 寫在磁碟 `data/`，重啟後 24 小時內仍在

## 方式二：任何能跑 Docker 的地方
```bash
docker build -f deploy/Dockerfile -t fortune .
docker run -p 8000:8000 --env-file .env fortune
```

## 緊急開關
把環境變數 `MAINTENANCE` 改成 `1` 重新部署（Render 面板改完會自動重啟），所有 `/api` 立刻回 503，網頁會顯示「命理師暫時休息中」。

## Telegram 機器人（選做）
1. 跟 @BotFather 要一個 token，填到 `TELEGRAM_BOT_TOKEN`
2. 另開一個 Background Worker（Render）或本機跑：`python -m fortune bot`
3. 機器人與網站共用同一套引擎、解讀、人設與用量邏輯

## 本機尚未驗證的部分
- Dockerfile 在這台機器沒有 Docker，未實際 build 過；第一次請跑 `docker build -f deploy/Dockerfile -t fortune .`，若 `pip install -e ".[llm]"` 卡在 `ephem` 編譯，把基底映像改成 `python:3.12`（非 slim）即可。
- Render 部署需要你的帳號；步驟如上，部署完先看 `/api/health`。免費方案的磁碟不保證持久，`data/cost_log.csv` 可能在重新部署後消失，要留的成本數據先下載一份。
