# 課程預設模型為什麼是 DeepSeek Flash（9-1 講稿素材）

決定日期：2026-10-09。範例專案 `.env.example` 的建議設定改為 `LLM_BACKEND=deepseek`（模型 `deepseek-flash`＝DeepSeek-V4.1-Flash）；離線模式仍是不填金鑰時的預設。

## 先看數據：同一張盤、同一份 prompt、六段解讀

| 模型 | 一份費用 | 耗時 | 查核 | 備註 |
|---|---:|---:|---|---|
| **deepseek-flash（開思考）** | **$0.0047** | 19 s | 3/3 | 課程預設 |
| claude-haiku-5-5 | $0.0034 | 26 s | 3/3 | 最便宜，但見下文 |
| gemini-2.5-flash（開思考） | $0.0064 | 22 s | 3/3 | |
| deepseek-flash（關思考） | $0.0030 | 8 s | 2/3 | 最快 |
| claude-sonnet-5-5 | $0.0872 | 50 s | 2/3 | |
| claude-opus-5-5 | $0.1374 | 49 s | 3/3 | 原本的預設 |

（命例 1990-06-15 14:30 女；每格 n=1，查核有隨機波動；完整表與各家 token 數在 `docs/validation-models.md`。）

## 為什麼不是最貴的

Opus 5.5 一份 $0.14，是 DeepSeek Flash 的 **30 倍**，查核通過率一樣。這堂課的架構決定了大模型沒有用武之地：

1. **材料都給好了**：AI 拿到的是程式算好的盤面事實與知識卡，不需要它「知道」命理。
2. **格式固定、方向先定**：六段、每段方向由規則判定，AI 只負責措辭。
3. **查核在後面**：盤面核對、引用核對、越界檢查會攔下亂寫；模型強弱影響的是「被攔幾次」，不是「最後對不對」。

這正是 2-3「四層模型」的回報：把推演留在程式，解讀這一層就可以用便宜的模型。這句話值得在 9-1 講三次。

## 為什麼不是最便宜的

Haiku 5.5 這次比 DeepSeek Flash 還便宜一點，也 3/3。沒選它的原因：

- **思考不能關**：Claude 5 系列一律思考，輸出 token 裡大半是推理；n=1 的 $0.0034 不一定穩。
- **一家一把金鑰**：課程主線用 Claude Code（Anthropic），學員的 Claude 金鑰給 Claude Code 用；解讀用另一家，學員比較容易分清「寫程式的 AI」和「寫解讀的 AI」是兩回事（3-2 的教學點）。
- **DeepSeek 的 /models 會回 context window、最大輸出、效果等級**，示範「設定的模型名可能是別名、以回覆為準」（`deepseek-chat` → `deepseek-flash`）很直觀。

## 課程裡要誠實講的三件事

1. **資料去哪裡**：盤面事實（生辰、干支、星曜）會送到你選的供應商。DeepSeek 是中國公司、Gemini 是 Google、Claude 是 Anthropic——各家的資料政策與所在法域不同。生辰是個資（8-3），**學員要替自己的使用者做這個判斷**；範例專案五家都能用、也支援「使用者自帶金鑰」，就是為了不替學員決定這件事。離線模式則完全不出門。
2. **便宜不代表永遠便宜**：DeepSeek 的別名 `deepseek-chat` 已經悄悄指到 V4.1-Flash；單價表 `providers.py` 裡的數字是估計值，正式數字看官方頁。成本紀錄 `data/cost_log.csv` 才是真的。
3. **會思考的模型連思考都算錢**：V4-Pro 開思考一次吐 16k token、$0.035 還被截斷；Flash 開思考 $0.0047、關思考 $0.003。`LLM_THINKING` 可調，預設跟各家的預設走。

## 什麼時候該換

- 查核連續不過、依據亂引：先試同家開思考，再試 Gemini Flash 或 Haiku。
- 要給付費客人、需要更穩的措辭：Sonnet／Opus，費用算進定價（9-2）。
- 使用者資料不能出境：自帶金鑰讓使用者自己選，或換到可接受的供應商、或離線模式。

## 對範例專案的影響

- `.env.example`：`LLM_BACKEND=mock` 仍是不填金鑰的預設；註解寫明「接 AI 建議 `deepseek`」與各家一份費用。
- `deploy/render.yaml`：`LLM_BACKEND=deepseek`。
- 3-2 示範畫面：頁首會顯示「AI 解讀：DeepSeek・deepseek-flash（DeepSeek-V4.1-Flash）」。
- 9-1 示範：先跑 `compare_models` 讓表自己長出來，再講上面三段。
