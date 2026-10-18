# 提示詞清單

> 依課程流程分五類。每條：**使用時機**（一句）＋**提示詞全文**（可直接貼進 Claude Code）。
> 提示詞都綁定本專案的檔名、端點與 id 格式；改專案時把這些名稱換掉即可。
> 原則：先讓 Claude 讀文件再動手、一次只做一件事、改完要它自己跑驗證。

---

## 一、規格（第 3 章）

### 1-1 從一句話開始寫規格
**使用時機**：你只有一個想法，還沒有規格。
```
我想做一個專看感情的命理師。請用 spec skill 一題一題問我六個欄位（輸入資料、支援系統、報告段落、依據標示、不回答的問題、上線形態），每題給我 2–3 個選項和說明。全部確認後寫到 SPEC.md。確認前不要改任何程式。
```

### 1-2 把現有專案反推成規格
**使用時機**：你拿到範例專案，想先知道它「現在」的規格是什麼。
```
請讀 docs/api.md、fortune/birth.py、fortune/chart.py、.env.example，依 docs/templates/spec_template.md 的六個欄位，把這個專案目前的實際行為整理成一份 SPEC.md。每個欄位只寫程式真的有做到的事，不確定的標「待確認」。不要改任何程式。
```

### 1-3 檢查規格有沒有漏
**使用時機**：規格寫完，想知道 AI 還會在哪裡猜。
```
請讀 SPEC.md，列出你在實作時「還是得自己猜」的地方，每個地方寫：猜的點、你會預設怎麼做、後果。不要補寫規格，只列清單讓我決定。
```

### 1-4 把規格的段落定義對到程式
**使用時機**：規格的「報告段落」改了（例如六段裁成四段），想知道要動哪些檔案。
```
SPEC.md 的報告段落改成：overview、love、partner、year 四段。請列出 fortune/reading/report.py、fortune/reading/prompt.py、fortune/reading/checks.py、web/app.js 各要改哪裡（檔名＋函式名＋改什麼），先列清單給我確認，不要動手。
```

### 1-5 規格與 .env 對齊
**使用時機**：規格的「上線形態」寫了數字，要確定設定檔一致。
```
SPEC.md 第 6 欄寫的用量上限與保存期限，請對照 .env.example 的 RATE_LIMIT_PER_IP_PER_DAY、DAILY_READING_CAP、DAILY_BUDGET_USD、SESSION_TTL_HOURS、MAINTENANCE，列出不一致的地方。只回報，不改檔案。
```

---

## 二、寫程式（第 3、4、5、7 章）

### 2-1 第一次跑起來
**使用時機**：剛 clone 下來，什麼都還沒跑。
```
請幫我把這個專案跑起來：讀 pyproject.toml 與 .env.example，告訴我要執行哪些指令（建虛擬環境、安裝、複製 .env、啟動 python -m fortune），一步一步來，每步跑完告訴我預期看到什麼。先用 LLM_BACKEND=mock，不要碰金鑰。
```

### 2-2 貼錯誤訊息
**使用時機**：跑不起來，有一段紅字。
```
執行 python -m fortune 出現以下錯誤，請先判斷是環境問題（套件、Python 版本、.env）還是程式問題，再告訴我要改什麼。如果是程式問題，先說明原因再改，一次只改一個檔案。

（貼上從 Traceback 開始到最後一行的完整錯誤）
```

### 2-3 新增一張知識卡
**使用時機**：第 5 章，把命理書的一段內容變成卡。
```
請依 fortune/knowledge/README.md 的格式，在 fortune/knowledge/cards/ 新增一張知識卡 star.tanlang（貪狼）。內容用以下文字改寫成「意義／正面／負面／常見組合／出處」五段，keywords 填 [貪狼]，source 寫「課程編寫」。寫完用 python -c "from fortune.knowledge.store import load_cards; print([c.id for c in load_cards()])" 確認讀得到。

（貼上你整理的貪狼內容）
```

### 2-4 加一條越界規則
**使用時機**：第 6-4，發現有一類問題沒被擋。
```
boundary_check 目前擋醫療／投資／法律／生死四類。請在 fortune/reading/checks.py 加第五類「保證準」：命中「一定」「必定」「保證」「百分之百」就回 issue，rule 填「保證準」。加完在 tests/test_checks.py 補一個測試案例，然後跑 pytest tests/test_checks.py。
```

### 2-5 改人設
**使用時機**：第 7-2，想換命理師的口吻或婉拒語。
```
請讀 persona/master.yaml，把命理師名字改成「月老」，開場白改成專看感情的口吻，婉拒語加一條「不判對方有沒有外遇」。改完用 curl http://localhost:8000/api/persona 確認回傳正確。不要改 fortune/ 底下任何檔案。
```

### 2-6 一次只做一件事
**使用時機**：任何時候 Claude 想「順便」改別的東西。
```
停。你剛才改了我沒要求的檔案。請把 (檔名) 還原，只保留 (我要的那個改動)。改完列出 git diff --stat 讓我看。
```

---

## 三、排盤驗收（第 4 章）

### 3-1 跑標準命例
**使用時機**：第 4-2，引擎改過或第一次驗收。
```
請用 chart-check skill 跑 python -m fortune.tools.chart_check，對照 tests/cases/standard_cases.yaml 逐格比對。用白話告訴我哪幾個命例哪幾格對不上、最可能的原因（時區、真太陽時、節氣交界、閏月、晚子時）、建議下一步。不要改引擎，先回報。
```

### 3-2 加一個標準命例
**使用時機**：你手上有一張確定正確的命盤（書上的、老師排的）。
```
請在 tests/cases/standard_cases.yaml 加一個命例，id 用 (例如 book_ziping_case3)，birth 填 {birth_date, birth_time, gender, longitude}，expect.bazi 填四柱、expect.ziwei 填 life_branch / five_class / life_major，note 寫出處。格式照檔案裡現有的案例。加完跑 python -m fortune.tools.chart_check 看這個命例過不過。

命例資料：（貼上）
```

### 3-3 節氣交界測試
**使用時機**：第 4-3，確認立春前後年柱會不會切錯。
```
請用 fortune/calendar/solar_terms.py 算出 2024 年立春的精確時刻，然後分別用立春前 1 小時、後 1 小時各排一次八字（POST /api/cast 或直接呼叫 fortune.chart.bazi_chart），確認年柱一個是癸卯、一個是甲辰。把兩次的 bazi.pillar.year 與 payload.month_term 貼給我。
```

### 3-4 真太陽時測試
**使用時機**：第 4-3，確認經度有沒有真的影響時柱。
```
同一組生辰 1990-06-15 23:10，分別用 longitude=121.5（台北）和 longitude=114.1（香港）排八字，比較 payload.true_solar_time、payload.solar_correction_min、bazi.pillar.day、bazi.pillar.hour。告訴我哪個案例跨了晚子時換日、warnings 有沒有正確標示。
```

### 3-5 無時辰流程
**使用時機**：第 4-4，確認缺時辰時系統不會硬排。
```
請用沒有 birth_time 的資料呼叫 POST /api/cast/all，確認：bazi 的 bazi.pillar.hour value 是「資料不足（時辰不明）」、missing 含 hour、ziwei 為 null、ziwei_candidates 列出十二時辰的命宮主星。把實際回傳貼給我，有任何一項不符就回報，不要改程式。
```

### 3-6 合盤追溯
**使用時機**：第 4-5，確認合盤每一項都追得回兩張盤。
```
請用兩組生辰呼叫 POST /api/synastry，對 items 裡每一項的 evidence[]，去 a 與 b 的 facts 裡找對應的 fact_id，確認存在而且 value 跟 text 描述一致（例如 text 說「辛金」，a 的 bazi.day_master 就要是辛金）。列出對不上的項目。
```

---

## 四、解讀查核（第 6 章）

### 4-1 跑一份解讀並查核
**使用時機**：第 6-1 到 6-4，第一次看查核結果。
```
請用 reading-check skill：先 POST /api/reading 拿一份八字解讀，再 POST /api/check 帶 {reading, chart}，把 chart_check、citation_check、boundary_check 的結果翻成白話，標出可疑段落與句子。交給我決定怎麼改，不要自動改。
```

### 4-2 盤面核對失敗時
**使用時機**：`chart_check` 回 issue，想知道是 AI 錯還是程式錯。
```
chart_check 回了這個 issue：(貼上)。請比對解讀該段的 text 與命盤 facts 裡對應的 id（bazi.god.* 或 ziwei.palace.*），告訴我是 AI 寫錯符號（例如正官寫成七殺）、還是 fortune/reading/prompt.py 給 AI 的事實文字本身有誤。只分析，不改。
```

### 4-3 引用核對失敗時
**使用時機**：`citation_check` 說某個 id 不存在。
```
citation_check 說 (id) 不存在。請分三種情況判斷：(a) AI 拼錯了，正確 id 應該是什麼（對照 fortune/knowledge/README.md 的 id 表）；(b) 這張卡本來就該有但 fortune/knowledge/cards/ 沒有，要補；(c) 這是 AI 自創的概念，應該從 prompt 禁止。告訴我是哪一種，我決定後你再動。
```

### 4-4 同盤問三次
**使用時機**：第 6-5，確認方向不會飄。
```
請 POST /api/consistency 帶 {system: "bazi", birth: (貼上), runs: 3}，把三次六段的 direction 列成表。若有任何一段三次不一致，告訴我是命盤每次算得不同（比對三次的 facts）還是 direction 被 AI 覆蓋（看 fortune/reading/report.py）。不要改程式。
```

### 4-5 用驗收清單人工抽查
**使用時機**：第 6-6，程式查核過了，想再用人眼掃一次。
```
請讀 docs/templates/reading_review_checklist.md，對這份解讀（貼上 Reading JSON）逐項做六項檢查，每項寫通過／不通過＋理由＋對應段落。特別注意 ⑥：這張盤 missing 含 (hour / gender)，解讀有沒有硬講時柱或大運。
```

### 4-6 看起來像投資建議
**使用時機**：`boundary_check` 沒擋到，但你讀起來覺得越界。
```
這句「(貼上)」boundary_check 沒擋，但我覺得像投資建議。請判斷：(a) 它確實越界，要在 fortune/reading/checks.py 加關鍵字；(b) 它只是描述財運傾向，不算越界；(c) 灰色地帶，應該改 persona/master.yaml 的措辭規則。給我你的判斷和理由，我決定後再改。
```

---

## 五、上線（第 8、9 章）

### 5-1 用量上限煙霧測試
**使用時機**：第 8-2，確認上限真的會擋。
```
請把 .env 的 RATE_LIMIT_PER_IP_PER_DAY 暫時改成 3，重啟 python -m fortune，用 curl 連打 4 次 POST /api/reading，確認第 4 次回 429 rate_limited 且 message 是中文。然後 GET /api/usage 看數字對不對。測完把 .env 改回 20。
```

### 5-2 緊急開關測試
**使用時機**：第 8-3，確認 MAINTENANCE 有效。
```
請把 .env 的 MAINTENANCE 改成 1，重啟後 GET /api/health 確認 maintenance 為 true，POST /api/cast 確認回 503 maintenance。再改回 0 重啟確認恢復。把兩次的回傳貼給我。
```

### 5-3 金鑰外洩掃描
**使用時機**：push 到 GitHub 之前。
```
請執行 git log -p --all | grep -iE "sk-ant|LLM_API_KEY=.{10}|TELEGRAM_BOT_TOKEN=.{10}"，確認歷史紀錄裡沒有金鑰。再確認 .gitignore 有 .env 且 git status 不會列出 .env。有任何命中就停下來告訴我，不要自己處理。
```

### 5-4 部署到 Render
**使用時機**：第 8-1，第一次部署。
```
請讀 deploy/render.yaml 與 deploy/Dockerfile，告訴我：(1) 要在 Render 後台手動設哪些環境變數（列名稱，不要值）；(2) 健康檢查路徑是不是 /api/health；(3) 免費方案休眠後第一次請求會多久。不要把任何金鑰寫進 render.yaml。
```

### 5-5 上線前走檢核表
**使用時機**：第 8-3，貼網址出去前。
```
請讀 docs/templates/launch_checklist.md，對照目前的 .env 與程式狀態，逐項告訴我哪些可以勾、哪些還不行、不行的原因。只回報，不改任何設定。
```

### 5-6 算一份解讀的成本
**使用時機**：第 9-1，填成本試算表。
```
請用 LLM_BACKEND=anthropic（或 openai / deepseek / gemini） 跑 3 份八字解讀與 3 份紫微解讀，記下每份的 Reading.cost_usd 與 /api/usage 的 token 數，算平均的輸入 token、輸出 token、快取讀取 token。把數字填進 docs/templates/cost_sheet.csv 的「每份解讀用量」欄，單價欄保持變數不要填金額。
```
