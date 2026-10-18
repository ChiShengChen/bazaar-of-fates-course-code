# 模型對照：同一張盤、不同模型／思考深度（第 9 章挑模型）

工具：`python -m fortune.tools.compare_models bazi 1990-06-15 14:30 女 --models deepseek-flash@default deepseek-flash@off deepseek-v4-pro@off`
（`@off` 等於 `LLM_THINKING=off`；換家用 `--backend anthropic --models claude-sonnet-5-5 claude-haiku-5-5`）

命例：小美，1990-06-15 14:30，女，台北。日期：2026-10-08。每列只跑一次，查核結果有隨機波動（同模型重跑過 1/3 → 3/3），看趨勢不看單格。

## DeepSeek（實測）

| 設定模型 | 思考 | in tok | out tok | 費用 | 耗時 | 查核 | 總字數 | 曾截斷 |
|---|---|---:|---:|---:|---:|---|---:|---|
| deepseek-flash（V4.1-Flash） | 預設（會思考） | 5,219 | 4,130 | $0.0047 | 19 s | 3/3 | 1,293 | 否 |
| deepseek-flash | 關閉 | 5,194 | 1,597 | $0.0030 | 8 s | 2/3（1 個盤面核對問題） | 1,825 | 否 |
| deepseek-v4-pro | 關閉 | 5,193 | 1,314 | $0.0057 | 30 s | 2/3（1 個問題） | 1,396 | 否 |
| deepseek-v4-pro | 預設（會思考） | 5,272 | 15,997 | $0.0353 | 379 s | — | — | **是**（16k 仍截斷） |

觀察：
1. **思考 token 算在輸出費用裡**：Flash 開思考 out 4,130 中約 2,800 是推理；V4-Pro 開思考一次推理超過 16k token，六分鐘、七倍價錢，對命理解讀這種「材料都給好了」的任務是浪費。
2. 關掉思考便宜約三分之一、快一倍，但查核偶爾少過一項（n=1，可能是波動）。課程預設 `LLM_THINKING=default`，要省錢再切 `off`。
3. 字數：關思考反而寫得長（1,825 字），不代表品質高；看查核與依據數比看字數可靠。
4. 更大的模型不一定更好：V4-Pro 關思考 2/3、比 Flash 貴一倍、慢三倍。對有固定格式、有事實清單的任務，小模型夠用。

## Gemini（實測，2026-10-08 稍晚）

| 設定模型 | 思考 | in tok | out tok | 費用 | 耗時 | 查核 | 總字數 | 曾截斷 |
|---|---|---:|---:|---:|---:|---|---:|---|
| gemini-2.5-flash | 預設 | 8,044 | 1,600 | $0.0064 | 22 s | 3/3（修查核後） | 1,200 | 否 |
| gemini-2.5-flash | 關閉（reasoning_effort=none） | 8,044 | 1,293 | $0.0056 | 8 s | 2/3（1 個） | 1,367 | 否 |

另測：紫微串流 30 個片段、六段齊全、$0.0068；對話 tool use 正常（2030 年 → `recast_year`；化忌 → `lookup_card`）。

觀察：
1. 同一份 prompt，Gemini 算 8,044 個輸入 token，DeepSeek 算 5,219——**各家 tokenizer 不同，成本表要各家分開算**。
2. 它的 `/models` 回的 id 帶 `models/` 前綴（`models/gemini-2.5-flash`），已在 `providers.describe()` 去掉。
3. 查核誤判一例：模型前一句講「目前走戊寅大運，天干戊土為正印」、下一句接著論「正印屬土…」，原本要求同一句出現「大運」才放行，已改為同一段即可。
4. Gemini 會在內文夾 `[shishen.zhengyin]` 這種 id（DeepSeek 不會），不影響解析但畫面稍亂；可在 prompt 再強調。

## Claude（實測，2026-10-08 稍晚；官方 SDK 路徑）

| 設定模型 | 思考 | in tok | out tok | 費用 | 耗時 | 查核 | 總字數 | 曾截斷 |
|---|---|---:|---:|---:|---:|---|---:|---|
| claude-opus-5-5 | 預設（adaptive） | 9,717 | 4,928 | $0.1374 | 49 s | 3/3 | 983 | 否 |
| claude-sonnet-5-5 | 預設 | 9,717 | 6,776 | $0.0872 | 50 s | 2/3（1 個） | 868 | 否 |
| claude-haiku-5-5 | 預設 | 9,717 | 4,858 | $0.0034 | 26 s | 3/3 | 1,072 | 否 |

另測（sonnet）：對話 tool use 正常（2030 年 → `recast_year`，引用 `bazi.liunian.2030`、`ziwei.liunian.2030`、知識卡 `shishen.jiecai`、`hua.ji`）；投資問題婉拒；紫微串流 224 個片段、六段齊全、`cache_read_input_tokens` 1,144（prompt cache 有命中）、$0.08。

觀察：
1. **Opus 5.5 一份 $0.14**，是 DeepSeek Flash 的 28 倍、Haiku 5.5 的 40 倍；Claude 5 系列無法關閉思考，out token 裡大半是推理。品質上 Opus 與 Haiku 這次都 3/3，Sonnet 2/3（n=1）。對「材料都給好、格式固定」的任務，**Haiku 5.5 是 Claude 家最划算的選擇**。
2. 同一份 prompt 三家 tokenizer 算出來：Claude 9,717、Gemini 8,044、DeepSeek 5,219。成本試算表要分家算。
3. Claude 的 `models.list` 回 12 個模型（含 claude-fable-5-1、claude-opus-4-x），BYOK 面板會全部列出。
4. 課程建議預設改為 `LLM_BACKEND=deepseek`（DeepSeek Flash），理由與資料政策考量見 `docs/model-choice.md`。

## 五家總表（一份八字解讀，同一命例）

| 模型 | 費用 | 耗時 | 查核 |
|---|---:|---:|---|
| claude-haiku-5-5 | $0.0034 | 26 s | 3/3 |
| deepseek-flash（開思考） | $0.0047 | 19 s | 3/3 |
| gemini-2.5-flash（關思考） | $0.0056 | 8 s | 2/3 |
| gemini-2.5-flash（開思考） | $0.0064 | 22 s | 3/3 |
| claude-sonnet-5-5 | $0.0872 | 50 s | 2/3 |
| claude-opus-5-5 | $0.1374 | 49 s | 3/3 |

（OpenAI 未測。每格 n=1，查核有隨機波動。）

## 怎麼解讀這張表

- **費用**：`/api/usage` 的 `cost_log` 累積實際數字；`docs/templates/cost_sheet.csv` 用「每份 in/out token × 單價」就能算，這裡的 in ≈ 5,200（盤面事實＋知識卡＋規則），out 視模型 1,300–4,100。
- **品質**：查核 3/3 ＋ 六段齊全 ＋ 每段依據 ≥ 3 條，是最低標；再看人設口吻與有沒有順著規則方向寫。
- **延遲**：串流下使用者看到第一個字的時間比總耗時重要；思考型模型在吐正文前會「空等」推理的那段時間（DeepSeek 的 reasoning 不在 `content` 串流裡）。

## 尚未跑的

OpenAI 沒有金鑰未實測；拿到金鑰後 `--backend openai --models gpt-4o-mini` 即可補上。
