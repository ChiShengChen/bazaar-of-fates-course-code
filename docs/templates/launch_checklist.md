# 上線前檢核（8-3）

> 上線不是「部署成功」，是「出事時你知道要按哪個鈕」。
> 七項全部勾完再把網址貼出去。每項下面有本專案對應的設定，大多在 `.env`（從 `.env.example` 複製）。

---

## 1. 個資：存什麼、存多久、怎麼刪

- [ ] 我列得出系統存了哪些個人資料（出生日期、時辰、性別、出生地、稱呼、對話內容）
- [ ] 我知道這些資料存在哪裡（記憶體？`data/sessions/`？資料庫？）
- [ ] 保存期限已設定，而且跟隱私說明寫的一致
- [ ] 使用者要求刪除時，我知道要刪哪個檔案或執行哪個指令
- [ ] 隱私說明已放上網站（`docs/templates/privacy_notice.md`）

**本專案對應**
- `SESSION_TTL_HOURS=24`：對話與命盤 session 保存 24 小時後自動清除；設 `0` 則只放記憶體、重啟即清，最省事。
- session 檔案位置 `data/sessions/`（已在 `.gitignore`），刪除某人資料 = 刪掉對應的 session 檔。
- 用量統計 `data/usage.json` 只記次數與金額，不含個資。
- 排盤本身不落地：`POST /api/cast` 算完即回，不存。

---

## 2. 免責

- [ ] 頁尾有一句短版免責
- [ ] 每份解讀報告尾端有長版免責（`Reading.disclaimer` 欄位）
- [ ] 免責內容涵蓋：僅供參考、不替代醫療法律財務專業、不保證準確、AI 生成
- [ ] Telegram 機器人的 `/start` 開場白也帶到免責

**本專案對應**
- 範本：`docs/templates/disclaimer.md`（短版給 `web/index.html` 頁尾，長版給 `fortune/reading/report.py` 的 `disclaimer` 欄位）。
- 人設開場白在 `persona/master.yaml`，`GET /api/persona` 會回傳。

---

## 3. 用量上限

- [ ] 每人（每 IP）每日次數上限已設定
- [ ] 全站每日解讀總數上限已設定
- [ ] 每日金額預算已設定，超過就停
- [ ] 我試過打到上限，確認回的是 `429 rate_limited` 而不是 500
- [ ] 上限數字跟成本試算表（`docs/templates/cost_sheet.csv`）對得起來

**本專案對應**
- `RATE_LIMIT_PER_IP_PER_DAY=20`：每個 IP 每日 20 次。
- `DAILY_READING_CAP=500`：全站每日 500 份解讀。
- `DAILY_BUDGET_USD=5`：每日 AI 花費超過 5 美元即停。
- 實作在 `fortune/api/limits.py`；`GET /api/usage` 可看今日用量與上限。
- `READING_MAX_TOKENS=8000`：單份解讀輸出 token 上限（含思考型模型的推理 token）；被截斷會自動加倍重試一次。

---

## 4. 緊急開關

- [ ] 我知道怎麼在 1 分鐘內讓全站暫停
- [ ] 暫停時使用者看到的是「維護中」而不是錯誤堆疊
- [ ] 我試過開、關各一次
- [ ] 開關不需要重新部署程式（改環境變數即可）

**本專案對應**
- `MAINTENANCE=1`：全站回 `503 maintenance`，網頁顯示維護訊息。
- Render 後台 Environment 改這個變數後重啟服務；`GET /api/health` 的 `maintenance` 欄位可確認狀態。

---

## 5. 金鑰

- [ ] `LLM_API_KEY` 只在 `.env` 或部署平台的環境變數，不在任何 `.py`、`.js`、`.yaml` 裡
- [ ] `.env` 在 `.gitignore`（已預設排除，確認沒被改掉）
- [ ] `git log -p | grep -i api_key` 搜不到金鑰（曾經 commit 過就要換新的）
- [ ] 金鑰在 Anthropic Console 設了花費上限
- [ ] `TELEGRAM_BOT_TOKEN` 同樣處理
- [ ] 我知道金鑰外洩時去哪裡撤銷、換新

**本專案對應**
- `.env.example` 是範本（可 commit）；`.env` 是實際值（不可 commit）。
- `LLM_BACKEND=mock` 時完全不需要金鑰，可先用這個模式上線測流程。
- `deploy/render.yaml` 不要寫入金鑰值，改用 Render 的 Environment 設定。

---

## 6. 錯誤頁

- [ ] 排盤失敗（日期格式錯、年份超出 1900–2100）回的是中文訊息，不是 traceback
- [ ] 紫微缺時辰回 `422 needs_birth_time`，網頁有顯示十二時辰候選
- [ ] 越界問題回 `400 refused`，顯示的是命理師的婉拒語
- [ ] AI 後端逾時或失敗時，網頁有「稍後再試」而不是空白
- [ ] 我故意輸入 `1800-01-01` 試過一次

**本專案對應**
- 錯誤格式統一 `{"error": "<code>", "message": "<中文說明>"}`，見 `docs/api.md`。
- 處理位置 `fortune/api/main.py`；網頁端 `web/app.js` 依 `error` 欄位顯示對應訊息。

---

## 7. 備份

- [ ] 知識卡（`fortune/knowledge/cards/`）與人設（`persona/master.yaml`）都在 git 裡
- [ ] 標準命例（`tests/cases/standard_cases.yaml`）在 git 裡
- [ ] `.env` 的內容另外存在密碼管理工具（不在 git，但也不能只存在那台機器上）
- [ ] 若 `SESSION_TTL_HOURS > 0` 且需要保留 session，`data/` 目錄有定期備份；若不需要，確認隱私說明寫的是「不保留」
- [ ] 我可以在一台新電腦上用 `git clone` ＋ `.env` 在 10 分鐘內把服務重新跑起來

**本專案對應**
- 程式與知識庫：git。
- 設定：`.env`（手動備份）。
- 使用資料：`data/sessions/`、`data/usage.json`（視隱私說明決定要不要備份）。

---

## 最後一關

- [ ] 用 `LLM_BACKEND=mock` 跑過一次完整流程（排盤 → 解讀 → 查核 → 對話）
- [ ] 切到 `anthropic` 後跑一次 `python -m fortune.tools.reading_check` 確認四種查核都通過
- [ ] `pytest` 全綠
- [ ] 隱私說明、免責、成本試算表三份文件都更新成跟 `.env` 一致的數字

全部勾完的日期：__________  簽名：__________
