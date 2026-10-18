# 部署到 Vercel

Vercel 會把整個 FastAPI 程式變成一個 Vercel Function，從 GitHub 匯入就能部署，之後每次 push 自動重新部署。repo 裡已經設好：

| 檔案 | 設定 |
|---|---|
| `pyproject.toml` 的 `[tool.vercel]` | 進入點 `fortune.api.main:app` |
| `vercel.json` | 機房在東京（`hnd1`，離台灣近）、函式最長 300 秒（解讀約 20–40 秒，同盤問三次更久）、`docs/`、`tests/` 這類執行時用不到的資料夾不打包 |
| `fortune/config.py` | 偵測到 Vercel 時，資料寫到 `/tmp/fortune`（Vercel 上只有 `/tmp` 能寫） |

## 步驟

1. 用 GitHub 帳號登入 [vercel.com](https://vercel.com)。
2. **Add New → Project**，選這個 repo，按 Import。
3. Framework 會自動認成 FastAPI，不用改。
4. **Environment Variables** 填下面幾個，再按 **Deploy**：

   | 名稱 | 值 |
   |---|---|
   | `LLM_BACKEND` | `deepseek` |
   | `LLM_API_KEY` | 你的 DeepSeek 金鑰 |
   | `RATE_LIMIT_PER_IP_PER_DAY` | `10` |
   | `DAILY_READING_CAP` | `300` |
   | `DAILY_BUDGET_USD` | `2` |

5. 部署好會拿到 `https://<專案名>.vercel.app`。先開 `/api/health` 確認 `backend` 是 `deepseek`，再排一張盤、解讀一次。
6. 想用自己的網域：專案的 **Settings → Domains** 加上網域，照畫面到網域商加一筆 DNS 記錄，HTTPS 憑證自動處理。

## 跟自管主機、Render 不一樣的地方

- **用量與對話紀錄不持久**：寫在 `/tmp`，每個執行個體各一份，閒置後回收或重新部署就清空。每人每日次數、每日預算是「每個執行個體」各算各的，流量小時差不多，流量大時會比設定值寬鬆。對話的 session 可能在追問到一半時消失，使用者重新開始就好。
- **費用紀錄**：`cost_log.csv` 也在 `/tmp`，看不到長期紀錄；要看用量請到 DeepSeek 的後台。
- **黃曆、廟旺不會出現**：這兩個靠選用套件（`.[oracles]`），Vercel 只裝 `pyproject.toml` 的基本相依套件。排盤、解讀、查核都不受影響。
- **緊急開關**：在 Vercel 的 Environment Variables 把 `MAINTENANCE` 設成 `1`，再到 Deployments 重新部署一次才會生效。

## 免費方案的限制

Vercel 免費方案（Hobby）只限**個人、非商業**使用。Vercel 對「商業使用」的定義包括：用來推銷產品或服務、或製作這個網站的任何人因此獲利。如果這個網址會放在課程的銷售頁或宣傳影片上，請改用 Pro 方案（每月 20 美元），或改用自管主機、Render（見 `README.md`）。
