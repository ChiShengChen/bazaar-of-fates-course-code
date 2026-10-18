---
name: reading-check
description: 使用者要查核一份 AI 解讀、問「這份解讀有沒有問題」、或要看 chart_check / citation_check / boundary_check / consistency 結果時使用。跑查核、翻成白話、標出可疑段落，交給使用者決定怎麼改。
---

# 解讀查核（6-1 到 6-5）

這支 skill 把四種程式查核的結果翻成人看得懂的話。
**不自動修改解讀、不改 prompt、不改 checks.py。** 標出問題，由使用者決定。

## 步驟

### 1. 拿到解讀與命盤

兩種來源擇一：

**(a) 伺服器正在跑（`python -m fortune`）**
```bash
# 先排盤
curl -s -X POST http://localhost:8000/api/cast -H 'Content-Type: application/json' \
  -d '{"system":"bazi","birth":{...}}' > /tmp/chart.json
# 再解讀（回傳已含 checks）
curl -s -X POST http://localhost:8000/api/reading -H 'Content-Type: application/json' \
  -d '{"system":"bazi","birth":{...}}' > /tmp/reading.json
# 獨立再跑一次查核（教學用，結果應與 reading.json 的 checks 相同）
curl -s -X POST http://localhost:8000/api/check -H 'Content-Type: application/json' \
  -d "{\"reading\": $(cat /tmp/reading.json), \"chart\": $(cat /tmp/chart.json)}"
```

**(b) 已有兩個 JSON 檔**
```bash
python -m fortune.tools.reading_check <reading.json> <chart.json>
```

一致性（同盤三次）另外跑：
```bash
curl -s -X POST http://localhost:8000/api/consistency -H 'Content-Type: application/json' \
  -d '{"system":"bazi","birth":{...},"runs":3}'
# 或
python -m fortune.tools.consistency
```

使用者直接貼 JSON 給你也可以，存到暫存檔再跑 (b)。

### 2. 翻譯四種查核

每種查核的 `issues[]` 逐條翻成白話，格式固定：

```
## 解讀查核結果　<subject>　<system_zh>　backend: <backend>

程式判定：<checks.summary>（例：3/4 通過）

### 盤面核對 chart_check　<通過／不通過>
- [段落 love] 解讀寫「月干正官透出」，但命盤 bazi.god.month_stem 是「七殺」。
  → AI 把七殺寫成正官，符號同類但性質相反，這段的結論不可信。

### 引用核對 citation_check　<通過／不通過>
- [段落 wealth] 引用知識卡 shishen.zhengquan，但 fortune/knowledge/cards/ 沒有這張卡。
  → 看起來是 zhengguan 的拼錯；也可能 AI 自創。
- [段落 year] evidence 為空。
  → 整段沒有依據，依規格應作廢。

### 越界檢查 boundary_check　<通過／不通過>
- [段落 wealth] 句子「下半年適合買進股票」命中規則「投資」。
  → 這是投資建議，不能出現。

### 一致性 consistency　<通過／不通過／未跑>
- 三次 direction：
  | 段落 | 第1次 | 第2次 | 第3次 |
  | love | 吉 | 吉 | 平 |
  → love 段第 3 次方向不同。direction 應由程式判定，不該變；疑似命盤或 report.py 問題。

### 資料不足標示（warnings / missing）
- 命盤 missing: [hour]；解讀 personality 段提到「時柱傷官」。
  → 時辰不明卻講了時柱，AI 無視 warnings。
```

通過的查核寫一行「通過，無問題」即可，不要湊字。

### 3. 可疑段落總表

最後給一張表，讓使用者一眼看到要處理什麼：

```
| 段落 | direction | 問題 | 嚴重度 | 可能的處理方向（供參考） |
|---|---|---|---|---|
| love | 吉 | 正官寫成七殺 | 高 | 重跑該段；連續錯則檢查 prompt.py 的事實文字 |
| wealth | 平 | 投資建議句 | 高 | 重寫該句；考慮在 persona 加措辭規則 |
| wealth | 平 | 卡 id 拼錯 | 中 | 確認是拼錯還是缺卡 |
| year | 平 | 無依據 | 高 | 段落作廢重寫 |
```

嚴重度：
- **高**：盤面不符、越界、無依據 —— 這段不能給使用者看
- **中**：引用拼錯、方向語氣偏移 —— 要修但結論可能沒錯
- **低**：措辭、warnings 未帶出 —— 可改可不改

### 4. 交給使用者

結尾固定一句：「以上是查核結果，要怎麼處理請你決定；需要我重跑某一段、或分析某個 issue 的根因，告訴我段落名稱。」

**不要**在使用者回覆前：改解讀文字、改 `fortune/reading/prompt.py`、改 `fortune/reading/checks.py`、補知識卡、重跑解讀。

## 常見誤判

查核結果不一定是對的，這三種要特別提醒使用者：

### (1) AI 把正官寫成七殺（或反過來）
正官與七殺都是「官殺」，AI 常混用。`chart_check` 會抓到，但要看是**哪一邊錯**：
- 命盤 `bazi.god.month_stem` 說七殺、解讀說正官 → AI 錯
- 解讀說「官殺」籠統帶過 → 可能不算錯，但依據要標到具體那一格
- 同類混用還有：正財／偏財、正印／偏印、食神／傷官；紫微的太陽／太陰、天機／天梁

### (2) 引用不存在的卡
`citation_check` 回「卡不存在」有三種真相：
- 拼錯（`zhengquan` → `zhengguan`）：改 id 即可
- 本來就該有但沒建：補卡到 `fortune/knowledge/cards/`，id 照 `fortune/knowledge/README.md` 的表
- AI 自創概念（例：`shishen.guanyin` 這種不存在的分類）：要在 prompt 禁止
不要一律當成「AI 亂寫」；對照 README 的 id 表再判斷。

### (3) 措辭看起來像投資建議
`boundary_check` 靠關鍵字，會有漏網也會有誤殺：
- **漏網**：「這幾年財星得位，可以放手去做」沒有「買」「股票」等字，但讀起來是在鼓勵投資 → 要人工標出來，建議加關鍵字或改 persona 措辭規則
- **誤殺**：「不宜投機」「財運平穩」命中「投」「財」但其實是描述傾向 → 回報時說明這是誤殺，建議調整規則而不是改解讀
- 判斷標準：這句話有沒有叫使用者**做某個具體動作**。描述傾向可以，指示動作不行。

另外兩個偶爾會遇到的：
- **direction 與語氣不一致但查核沒抓**：`consistency` 只比三次 direction 有沒有變，不比文字語氣。文字跟 direction 對不上要人工看（見 `docs/templates/reading_review_checklist.md` 第 ④ 項）。
- **mock 後端的查核全過**：`backend: mock` 時解讀是事實摘要，查核一定過，不代表接上 Anthropic 後也會過。回報時要標明 backend。
