# 部署（第 8 章）

第 8-1 節先用 Render 建立能公開排盤的離線教學站。若已有 Ubuntu 或 Debian 主機及網域，可看 [自管主機手冊](self-hosted/README.md)。另有 Docker 和 [Vercel](vercel.md) 路線。

## 方式一：Render 教學站

1. 從學員版建立自己的 GitHub repo。打開該 repo 的 `main`，確認根目錄有 `render.yaml` 和 `.python-version`。本機的 `git check-ignore .env` 應只印出 `.env` 檔名。
2. 在 Render 選 New → Blueprint，連接 GitHub，選取自己的 repo 和 `main` 分支。檢查預覽只建立一個 Free Web Service，接著按 Deploy Blueprint。
3. 點進剛建立的服務，等部署狀態顯示 Live。複製服務頁的網址，在無痕視窗開首頁。另開同網址的 `/api/health`，確認 `status` 為 `ok`、`maintenance` 為 `false`、`backend` 為 `mock`。回首頁用範例生辰 `1990-06-15 14:30`、女、台北，確認排得出盤。
4. 先完成用量、個資及關站檢查，再決定是否啟用真 AI。要啟用時到服務頁的 Environment 將 `LLM_BACKEND` 改成要用的供應商，再新增 `LLM_API_KEY`。重新部署後，用範例生辰跑一份完整解讀。健康檢查回報的模型資訊可用來核對設定。
5. 免費服務可能休眠，重新開啟約需一分鐘。重啟、休眠或重新部署可能清掉本機的用量、成本與對話檔案。教材設定 `SESSION_TTL_HOURS=0`，練習時使用範例資料。 [Render 免費服務說明](https://render.com/docs/free)

## 方式二：任何能跑 Docker 的地方
```bash
docker build -f deploy/Dockerfile -t fortune .
docker run -p 8000:8000 --env-file .env fortune
```

## 緊急開關
把環境變數 `MAINTENANCE` 改成 `1` 重新部署（Render 面板改完會自動重啟），所有 `/api` 立刻回 503，網頁會顯示「命理師暫時休息中」。

## Telegram 機器人（選做）
1. 在 Telegram 開啟官方 `@BotFather`，用 `/newbot` 建立自己的測試 bot。在專案根目錄的 `.env` 填 `TELEGRAM_BOT_TOKEN`，錄影或分享畫面時遮住值。第一次練習保留 `LLM_BACKEND=mock`。
2. 在 VS Code 另開一個終端機，確認目前是相同專案。Windows PowerShell 執行 `.\.venv\Scripts\python.exe -m fortune bot`。macOS 或 Linux 執行 `.venv/bin/python -m fortune bot`。
3. 在 Telegram 開啟自己剛建立的 bot，送 `/start`，再送 `/birth 1990-06-15 14:30 女 測試` 和 `/chart`。看到四柱、日主和命宮後，送 `/forget` 清掉這次資料。
4. 關閉終端機會停止回覆。同一把 token 同時間只交給一個程式輪詢。正式常駐可依 [自管主機手冊](self-hosted/README.md) 啟動 `fortune-bot` 服務，或選用 Render Background Worker。

## 本機尚未驗證的部分
- Dockerfile 在這台機器沒有 Docker，未實際 build 過；第一次請跑 `docker build -f deploy/Dockerfile -t fortune .`，若 `pip install -e ".[llm]"` 卡在 `ephem` 編譯，把基底映像改成 `python:3.12`（非 slim）即可。
