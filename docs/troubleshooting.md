# 3-4 跑不起來時，要貼哪段錯誤訊息

> 十個真實情境。每個都分四段：**症狀**（你看到什麼）、**關鍵訊息**（錯誤長什麼樣）、**貼哪幾行給 AI**、**通常怎麼解**。
> 文末有「貼錯誤訊息的三個原則」。貼給 Claude Code 的提示詞模板在 `docs/templates/prompts.md` 第 2-2 條。

所有指令都假設你在專案目錄、而且已經 `source .venv/bin/activate`（Windows：`.venv\Scripts\activate`）。

---

## 1. `python -m fortune` 說 port 8000 被佔用

**症狀**：終端機印出「→ AI 命理師啟動：http://localhost:8000」之後馬上一串紅字，程式結束。

**關鍵訊息**（macOS／Linux 是 Errno 48，Windows 是 Errno 10048 或「通常每個通訊端位址只能使用一次」）：

```
ERROR:    [Errno 48] error while attempting to bind on address ('0.0.0.0', 8000): address already in use
```

**貼給 AI**：上面那一行，加上你執行的指令。

**通常怎麼解**：找出誰佔了 8000，多半是你上一次沒關掉的 `python -m fortune`。

```bash
lsof -nP -iTCP:8000 -sTCP:LISTEN        # macOS / Linux：看 PID 與程式名
kill <PID>                              # 是自己的舊程序就關掉
```

Windows：`netstat -ano | findstr :8000` 找 PID，再 `taskkill /PID <PID> /F`。

或者不關它、換一個 port：`.env` 改 `API_PORT=8001`，瀏覽器改開 `http://localhost:8001`。

---

## 2. 網頁打開是 404、或是別的程式的畫面

**症狀**：`python -m fortune` 看起來正常啟動，但瀏覽器開 `http://localhost:8000` 出現 `{"detail":"Not Found"}`、另一個專案的首頁、或是一個你沒看過的 API 文件頁。

**關鍵訊息**：瀏覽器沒有錯誤；要看終端機——如果你的 `python -m fortune` 視窗裡**沒有任何請求紀錄**（沒有 `GET / HTTP/1.1 200`），代表瀏覽器連到的不是它。

**貼給 AI**：`lsof -nP -iTCP:8000 -sTCP:LISTEN` 的輸出（會看到兩個程序、或是一個不是 fortune 的 uvicorn）、加上瀏覽器看到的內容。

**通常怎麼解**：另一個 uvicorn（例如你另一個課程專案）綁在 `127.0.0.1:8000`，而本專案綁 `0.0.0.0:8000`，兩者在某些系統上可以同時存在，瀏覽器會先連到 127.0.0.1 那個。關掉另一個，或把本專案換 port（見情境 1）。

確認方法：`curl http://localhost:8000/api/health` 應該回 `{"status":"ok", ...,"cards":...}`，不是的話就是連錯程式。

---

## 3. 金鑰錯或沒填：頁首黃點「離線示範模式」、紅點「AI 連線失敗：401」

**症狀 A（黃點）**：頁首狀態列顯示「離線示範模式：未接 AI 金鑰，解讀由程式依盤面事實組出」。解讀照樣出得來，但是是離線版（`LLM_BACKEND=mock`）。這**不是錯誤**，是預設；只是你以為已經接上 AI 了。

**症狀 B（紅點）**：狀態列顯示「AI 連線失敗（OpenAI・gpt-4o-mini）：401 ...」或類似訊息；解讀會自動退回離線版，網站不會掛。

**關鍵訊息**：`curl http://localhost:8000/api/health` 的回傳。黃點時 `"backend":"mock"`；紅點時 `model_info.error` 裡有東西，例如：

```
"error": "Error code: 401 - {'error': {'message': 'Incorrect API key provided: sk-abc...', 'type': 'invalid_request_error', ...}}"
```

Anthropic 的長這樣：`authentication_error: invalid x-api-key`。

**貼給 AI**：`/api/health` 的整段 JSON（**先把金鑰遮掉**，雖然 health 不會印金鑰，但你自己貼 `.env` 時要小心），加上 `.env` 裡 `LLM_BACKEND=` 那行。

**通常怎麼解**：
- 黃點：`.env` 的 `LLM_BACKEND` 還是 `mock`，或根本沒有 `.env`（`cp .env.example .env`）。改完要**重新啟動** `python -m fortune`，設定只在啟動時讀一次。
- 紅點 401：金鑰貼錯、多了空白或引號、或是該家的金鑰貼到另一家（`LLM_BACKEND=openai` 卻貼 Anthropic 的 `sk-ant-...`）。重新從該家主控台複製一次。
- 紅點 402／429 配「insufficient_quota」字樣：帳戶沒餘額，不是程式問題。

---

## 4. 模型名打錯：`/api/health` 的 `model_info.note` 說不在清單

**症狀**：狀態列是綠的（「AI 解讀：DeepSeek・deepseek-v4-flsh」），但按解讀出現「AI 連線失敗 … 404 model not found」，或解讀退回離線版。

**關鍵訊息**：`/api/health` 回傳裡：

```
"note": "deepseek-v4-flsh 不在 /models 清單裡（可能是別名；以實際回覆的 model 欄位為準）"
```

以及 `"available": [...]` 列出該家真正提供的模型 id。

**貼給 AI**：`model_info` 這一段（`configured`、`note`、`available` 三個欄位）。

**通常怎麼解**：對著 `available` 把 `LLM_MODEL` 改成存在的 id；或**乾脆留空**，程式會用該家預設（anthropic→`claude-opus-5-5`、openai→`gpt-4o-mini`、deepseek→`deepseek-flash`、gemini→`gemini-2.5-flash`）。注意：`note` 說「不在清單」不一定是錯——有些是別名（DeepSeek 的 `deepseek-chat`），這時看 `served` 欄位，有實際回覆的模型名就沒問題。

---

## 5. 解讀只出現半段，其餘「本段缺漏」

**症狀**：解讀頁的總論只有一半，接下來五段都顯示「（本段缺漏：模型未依格式輸出）」；警示欄可能寫「模型輸出達 token 上限被截斷（已重試一次）…」。

**關鍵訊息**：終端機裡有：

```
[llm:deepseek] 輸出被截斷（max_tokens=2500，思考型模型的推理 token 也算在內），加倍重試
```

以及解讀 JSON 的 `warnings` 裡：

```
模型輸出達 token 上限被截斷（已重試一次），缺漏段落請提高 READING_MAX_TOKENS（目前 2500）
```

**貼給 AI**：終端機那一行 `[llm:...]`、`warnings` 那一句、你用的 `LLM_BACKEND` 與 `LLM_MODEL`。

**通常怎麼解**：思考型模型（DeepSeek V4、Claude、OpenAI 的 o 系列）會把「思考」的 token 也算進 `max_tokens`，預算太小就沒有空間寫六段。`.env` 的 `READING_MAX_TOKENS` 調到 8000 以上（新版預設已是 8000），重啟。程式偵測到截斷會自動加倍重試一次，所以偶爾一次截斷不用管；每次都截斷才調。上限高不會變貴，只付實際產生的 token。背景見 `docs/validation-deepseek.md` 的追記。

---

## 6. 紫微顯示「需要出生時辰」

**症狀**：切到「紫微」分頁出現「紫微需要出生時辰」和十二張時辰小卡；API 回 `422 needs_birth_time`。

**關鍵訊息**：

```
{"error":"needs_birth_time","message":"紫微斗數需要出生時辰，請對照候選命宮補填","candidates":[...]}
```

**貼給 AI**：不用貼，這不是錯誤。

**通常怎麼解**：這是設計（4-4）：命宮由時辰決定，沒時辰整張紫微盤不存在，程式不硬猜，改列十二個時辰各自的命宮主星讓使用者對照。八字會照排三柱。要繼續，就在表單補時辰、或點一張候選卡。用法見 `docs/guide-ziwei.md`「缺時辰」一節。

---

## 7. `ModuleNotFoundError: No module named 'fortune'`

**症狀**：執行任何 `python -m fortune ...` 或 `pytest` 時：

```
Traceback (most recent call last):
  File "<frozen runpy>", line 198, in _run_module_as_main
  ...
ModuleNotFoundError: No module named 'fortune'
```

或是 `/usr/bin/python: No module named fortune`。

**貼給 AI**：最後三行，加上 `which python`（Windows：`where python`）和 `pip list | grep -i fortune` 的輸出。

**通常怎麼解**：兩個原因，各占一半。
- **沒進 venv**：提示字元前面沒有 `(.venv)`。執行 `source .venv/bin/activate`。`which python` 應該指到專案底下的 `.venv/bin/python`。
- **進了 venv 但沒安裝專案**：`pip install -e ".[dev,llm]"`。`-e` 是「可編輯安裝」，改程式不用重裝。

如果錯的是別的套件名（`No module named 'ephem'`、`'yaml'`、`'uvicorn'`），同樣是沒裝或裝到別的 Python，解法同上。

---

## 8. `ValueError: 出生年須在 1900–2100 之間`

**症狀**：排盤時 API 回 400；終端機或回傳裡：

```
1 validation error for BirthInput
birth_date
  Value error, 出生年須在 1900–2100 之間（節氣算法的可靠範圍） [type=value_error, input_value='1850-01-01', input_type=str]
```

**貼給 AI**：這三行，加上你輸入的日期。

**通常怎麼解**：日期打錯（常見：年份少打一位、或把民國年當西元年——民國 79 年要填 1990）。範圍限制是刻意的：節氣用天文算法算，1900–2100 外沒有驗證過精度（`fortune/birth.py`）。真的需要更早的年份，是改規格不是修 bug。

同一類的還有 `gender 須為 male/female（或 男/女）`，通常是表單值打錯。

---

## 9. 429「今日次數已達上限」

**症狀**：網頁顯示「今日次數已達上限，明天再來吧。」；API 回 429：

```
{"error":"rate_limited","message":"今日次數已達上限（每人每日 20 次），明天再來"}
```

另兩種同為 429 的訊息：「今日全站解讀次數已達上限，命理師休息中」、「今日 AI 預算已用完，命理師休息中」。

**貼給 AI**：那一行 JSON，加上 `.env` 裡 `RATE_LIMIT_PER_IP_PER_DAY`、`DAILY_READING_CAP`、`DAILY_BUDGET_USD` 三行。

**通常怎麼解**：不是壞掉，是 8-2 的用量上限在工作。本機測試時把 `RATE_LIMIT_PER_IP_PER_DAY` 調高（例如 1000）再重啟；上線後維持預設。三個上限分別是「每個 IP 每天幾次」「全站每天幾份解讀」「全站每天花幾美元」，哪一個先到都會擋。`GET /api/usage` 可以看今天用了多少。

---

## 10. 503「命理師暫時休息中」

**症狀**：首頁打得開，但任何排盤／解讀都回「命理師暫時休息中，請稍後再試。」；狀態列顯示「命理師暫時休息中（維護模式）」。

**關鍵訊息**：

```
{"error":"maintenance","message":"命理師暫時休息中，請稍後再來"}
```

**貼給 AI**：這一行，加上 `.env` 的 `MAINTENANCE=` 那行。

**通常怎麼解**：`.env` 裡 `MAINTENANCE=1`——這是 8-3 的緊急開關，上線後帳單失控、或 AI 那邊出事時拿來一鍵暫停。改回 `MAINTENANCE=0` 重啟。如果是部署在 Render，要去 Render 的環境變數改，不是本機的 `.env`。

---

## 貼錯誤訊息的三個原則

1. **貼最後 10 行，不是第 1 行。** Python 的 Traceback 真正的錯誤在最底下那行（`XxxError: ...`），上面是呼叫路徑。太長就從 `Traceback (most recent call last)` 整段貼，AI 會自己找；但千萬不要只貼第一行或自己摘要。
2. **含指令。** 你打了什麼才出現這個錯：`python -m fortune`、`pytest`、`curl ...`、還是在瀏覽器按了哪個鈕。同一個錯誤訊息在不同指令下原因不同。
3. **含你改了什麼。** 「剛才改了 `.env` 的 `LLM_BACKEND`」「剛加了一張知識卡」「剛 `pip install` 了某個套件」。十次有八次，錯誤就是你最後改的那一件事造成的；說出來，AI 不用猜。

另外兩個小習慣：貼之前把金鑰遮掉（`sk-****`）；問完之後把解法記在自己的筆記裡，下一次同樣的錯會更快。
