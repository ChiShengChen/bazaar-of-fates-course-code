# 流派設定：流派不是對錯，是可查的選擇（課綱 4-3 延伸）

命理各家在幾個關鍵點上做法不同：晚子時換不換日、時辰要不要換算真太陽時、閏月怎麼算、庚壬年四化、命宮以節還是中氣……。
本專案不把其中一種寫死，而是做成**流派設定檔**：每個歧見是一個開關，選項是封閉的枚舉，程式裡對應一個分支。

好處：
1. 排盤仍是確定性的、可測試的（每個開關至少一個標準命例證明它真的會改變某一格）
2. 兩派可以逐格比對：`python -m fortune.tools.compare_schools 2000-01-07 23:30 男 --schools default clock-time`
3. 盤面會標出「換一派會得到什麼」（事實的 `alternatives`），AI 解讀時被要求說明本盤依哪一派，不可自行換派

## 開關一覽

| 系統 | 開關 | 選項 | 影響的格 |
|---|---|---|---|
| 八字 | `year_boundary` | `lichun`（立春，通行）／`lunar_new_year`（農曆新年，民俗） | 年柱；月干跟著年干（五虎遁） |
| 八字 | `month_stem_follows` | `year_pillar`（月干跟著年柱天干）／`lichun_year`（只換年柱、月干仍依立春年） | 月干；只在 `year_boundary=lunar_new_year` 時有差 |
| 八字 | `late_zi` | `next_day`（23 時後換日柱）／`same_day`／`same_day_next_hour_stem`（日柱不換、時干依隔日；lunar-python 預設） | 日柱、時干、所有十神 |
| 八字 | `true_solar_time` | `on`／`off` | 時支（經度差＋均時差可達 ±30 分） |
| 八字 | `minggong_month` | `jie`（節）／`zhongqi`（中氣） | 八字命宮 |
| 八字 | `yangren_yin_stems` | `chenwei`（乙辰丁未…）／`yinshen`（乙寅丁申…）／`none` | 神煞羊刃 |
| 八字 | `xusui_boundary` | `lunar_new_year`／`lichun` | 虛歲、目前大限 |
| 八字 | `chenggu_year` | `lichun`（用年柱）／`lunar_year` | 稱骨 |
| 八字 | `strength_method` | `score_v2`（預設：月令旺相休囚死＋加權通根＋透干，附用神／調候／格局）／`score_v1`（課程簡化計分） | 旺衰、喜用、用神、調候、格局 |
| 紫微 | `leap_month` | `split`（上半歸本月下半歸次月）／`same`／`next` | 閏月生人的命宮、整張盤 |
| 紫微 | `sihua_variant` | `standard`／`tianfu_ke`（庚壬天府化科）／`tianxiang_ji`（庚天相化忌） | 庚、壬年生年四化 |
| 紫微 | `hour_source` | `true_solar`／`clock` | 時支 → 命宮身宮、昌曲、火鈴、空劫 |
| 紫微 | `late_zi` | `same_day`／`next_day` | 晚子時的農曆日 → 紫微星位 |
| 紫微 | `tianma_basis` | `year_branch`／`month_branch` | 天馬 |

程式位置：`fortune/school.py`（schema 與載入）、分支點在 `fortune/bazi/engine.py`、`fortune/ziwei/engine.py`、`fortune/bazi/extras.py`、`fortune/chart.py`。

## 內建流派（`schools/`）

| 檔名 | 說明 |
|---|---|
| `default.yaml` | 課程預設：多數排盤軟體的做法 |
| `clock-time.yaml` | 手錶時間派：不換算真太陽時、晚子時不換日（坊間網站常見） |
| `zhongqi-tianfu.yaml` | 中氣命宮・天府化科派：三個歧見同時切換的示範 |

## 怎麼選

| 層 | 誰 | 做法 |
|---|---|---|
| 站台預設 | 站主 | `.env` 的 `SCHOOL=clock-time` |
| 單次 | 使用者 | 網頁「進階：流派」面板；或 API body 帶 `school` 與／或 `overrides: {"bazi": {"late_zi": "same_day"}}` |
| 自定義 | 有師承的學員 | 複製 `schools/default.yaml` 改名、改開關、填 `source`（出自哪本書／哪位老師）；重啟後自動出現在下拉選單 |

## 自定義的邊界

- 能自定義的是**開關**，不是規則本身。yaml 不能寫新的安星邏輯；想加一派＝在 `fortune/school.py` 加一個選項、在引擎加一個分支、在 `tests/cases/standard_cases.yaml` 補一個命例（帶 `school:` 或 `overrides:`）。
- 每個流派檔要有 `source`。沒有出處的不收進 repo 預設清單。
- 旺衰有 v1（簡化計分）與 v2（可稽核加權法，附用神、調候、月令格局）兩種；更細的格局判斷（從格、化格、特別格局）仍是新演算法。

## 一個例子

2000-01-07 23:30 出生的人，課程預設與手錶時間派差 23 格：日主從乙木變甲木，整張十神都不一樣。這不是誰算錯，是「晚子時算不算隔天」的選擇；重點是**你知道自己選了哪一派，而且盤上看得到另一派會怎樣**。

```
python -m fortune.tools.compare_schools 2000-01-07 23:30 男 --schools default clock-time
```
