---
name: chart-check
description: 使用者要驗收排盤、跑標準命例、或問「排盤對不對」時使用。執行 python -m fortune.tools.chart_check，把逐格比對結果整理成白話回報；不自行修改引擎。
---

# 排盤驗收（4-2）

這支 skill 做的事只有一件：跑標準命例、把結果講清楚。
**不修改 `fortune/` 底下任何檔案。** 發現問題先回報，由使用者決定下一步。

## 步驟

### 1. 執行

```bash
python -m fortune.tools.chart_check
```

若使用者指定了命例或系統，加參數（指令支援的參數以 `python -m fortune.tools.chart_check --help` 為準）。
指令會讀 `tests/cases/standard_cases.yaml`，對每個命例分別跑八字與紫微引擎，逐格比對 `expect` 與實際結果。

命例格式：

```yaml
- id: boundary_lichun_before
  title: 立春前一小時
  birth: {birth_date: "2024-02-04", birth_time: "15:00", gender: male, longitude: 121.5}
  expect:
    bazi: {year: 癸卯, month: 乙丑, day: 戊戌, hour: 己未}
    ziwei: {life_branch: 亥, five_class: 土五局, life_major: [巨門]}
  note: 立春 16:27，之前屬癸卯年
```

### 2. 讀輸出

指令跑不起來（ImportError、找不到檔案）就直接把錯誤貼給使用者，說明是環境問題還是檔案缺失，不要繼續。

跑得起來就整理成下面的格式。

### 3. 回報格式

```
## 排盤驗收結果

通過 N / M 個命例

### 對不上的命例

#### <id>　<title>
- 格子：bazi.month　預期 乙丑　實際 甲寅
- 命例備註：<note>
- 最可能原因：<從下面五種挑一到兩種，說明為什麼>
- 建議下一步：<一句>

（每個對不上的命例一節）

### 全部通過的命例
<id 清單，一行>
```

### 4. 判斷原因

只從這五種裡挑，每種都要對應到命例的 `note` 與 `birth` 資料來判斷：

| 原因 | 什麼情況會想到它 | 對應程式 |
|---|---|---|
| **時區** | `birth.tz_offset_hours` 不是 +8、或命例是國外出生 | `fortune/birth.py` 的 `tz` |
| **真太陽時** | 有 `longitude` 且時柱或日柱錯；經度離 120°E 越遠偏差越大 | `fortune/calendar/true_solar.py`、`payload.solar_correction_min` |
| **節氣交界** | 年柱或月柱錯，且 `note` 提到立春／節氣、或生日在每月 4–8 日 | `fortune/calendar/solar_terms.py`、`payload.month_term` |
| **閏月** | 紫微錯、且農曆生日在閏月；本專案閏月歸前月，有些流派歸後月或前半後半分 | `fortune/ziwei/engine.py` 的 `leap_rule` |
| **晚子時** | 時間在 23:00–24:00，日柱錯一天；本專案晚子時換日 | `fortune/bazi/engine.py` 的 `late_zi` |

判斷時優先看命例的 `note`：命例作者通常已經寫了這個案例在測什麼。

一個都對不上時，說「無法確定」，列出你排除了哪幾種、還需要什麼資訊（例如請使用者確認命例來源的流派）。

### 5. 區分「程式錯」與「命例錯」

標準命例也可能錯（抄錯、來源流派不同）。符合下列任一情況，要提醒使用者命例本身可能有問題：
- 同一類型的其他命例都過，只有這個不過
- `note` 寫的流派跟本專案預設不同（例：note 說「晚子時不換日」）
- `expect` 裡的干支組合本身不合法（例：天干地支陰陽不配）

## 不要做的事

- 不改 `fortune/` 底下任何檔案
- 不改 `tests/cases/standard_cases.yaml`（除非使用者明確要求加命例）
- 不「順手」修引擎再跑一次
- 不猜輸出，指令沒跑成功就說沒跑成功
