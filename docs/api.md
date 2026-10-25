# API 契約

後端 FastAPI，前綴 `/api`。根路徑 `/` 直接提供 `web/` 的靜態網頁，所以 `python -m fortune` 一個指令就有前後端。

## 共通

- 出生資料 `birth`（所有端點共用）：
  ```json
  {"name": "小美", "full_name": "陳美玲", "birth_date": "1990-06-15", "birth_time": "14:30", "gender": "female",
   "place": "台北", "longitude": 121.5, "tz_offset_hours": 8, "use_true_solar_time": true}
  ```
  `birth_time`、`gender`、`place`、`longitude` 都可省略。省略時辰：八字只排三柱；紫微回 `needs_birth_time`。
  `full_name` 只有姓名學用，可省略；複姓或冠夫姓在姓與名之間加空白（`歐陽 娜娜`、`陳林 美玲`），沒空白時第一字當姓（常見複姓自動辨識）。
  有 `place` 但沒 `longitude` 時，伺服器用離線城市表補經度與時區（含台灣日光節約時間）。
- 錯誤格式：`{"error": "<code>", "message": "<中文說明>", ...}`
  - `422 needs_birth_time`：紫微缺時辰，附 `candidates`（十二時辰的命宮主星，給使用者對照）
  - `422 needs_full_name`：姓名學沒填 `full_name`；`422 bad_name`：有非中文字或查不到筆畫的罕用字（訊息會指出哪個字）
  - `429 rate_limited`：超過每人每日次數或全站上限
  - `503 maintenance`：緊急開關已開
  - `400 refused`：越界問題（醫療／投資／法律／生死），附 `reply` 為命理師的婉拒語

### 流派（所有 POST 都可帶）

```json
{"school": "clock-time", "overrides": {"bazi": {"late_zi": "same_day"}, "ziwei": {"leap_month": "same"}, "xingming": {"stroke_basis": "modern"}}}
```
`school` 省略＝站台預設（`.env` 的 `SCHOOL`）；`overrides` 只放改過的開關。錯誤回 `400 bad_school`。
`GET /api/schools` → `{default, schools[{name,title,source,description}], schema{bazi{開關{options{值:文字}, default}}, ziwei{…}, xingming{…}}}`。
`ChartData` 多 `school{name,title,source,summary,settings}`；每條 fact 多 `alternatives[{switch,option,label,value}]`（換一派會得到什麼）；`payload.school_dependent[]` 列出受流派影響的事實 id。

### 自帶金鑰、自選模型（所有會叫 AI 的 POST 都可帶）

```json
{"llm": {"backend": "gemini", "api_key": "…", "model": "gemini-2.5-pro", "base_url": "", "thinking": "off"}}
```
只用於這一個請求：伺服器不保存、不記錄金鑰（錯誤訊息裡會遮罩）。費用照常寫進 `cost_log.csv`（kind 加 `:byok`）但**不算站台每日預算**；每人每日次數照算。`Reading.byok`／chat 回覆的 `byok` 為 true。
- `GET /api/llm/backends` → 可用後端、預設模型、是否需要金鑰
- `POST /api/llm/models` `{backend, api_key, base_url?}` → `{ok, label, models[], served, error}`（驗證金鑰、列模型、探一次實際服務的模型）
- 設定不合法 → `400 bad_llm`

## 命盤 `ChartData`

```json
{
  "system": "bazi", "system_zh": "八字", "subject": "小美・1990-06-15 14:30・台北",
  "birth": {...}, "cast_at": "2026-10-08T10:00:00",
  "facts": [{"id": "bazi.day_master", "group": "日主", "label": "日主", "value": "辛金", "note": "陰金"}],
  "payload": {...},
  "warnings": ["大運逆行，3.1 歲起運"], "missing": []
}
```

`payload` 畫面用：

- 八字：`pillars[]`（每柱 `name/stem/branch/gz/stem_elem/branch_elem/zodiac/hidden_stems/stem_god/hidden_gods` ＋ `nayin/kongwang/changsheng/shensha[]`）、`day_master`、`strength{score,label,favourable,notes}`、`dayun[]`（每運 `gz/start_age/end_age/start_year/stem_god/branch_god` ＋ `changsheng/shensha[]/liunian[10]{year,gz,stem_god,branch_god}`）、`age`、`true_solar_time`、`solar_correction_min`、`month_term`
  - 旺衰 v2 事實：`bazi.strength`（note 含各類分數）、`bazi.favourable`、`bazi.yongshen`、`bazi.tiaohou`、`bazi.pattern`
  - 黃曆（可選，裝 oracles 才有；文字已轉繁體台灣用語）：`almanac{xiu,xiu_luck,zhixing,pengzu[],day_yi[],day_ji[],jishen[],xiongsha[],positions{},taixi,shengong,mingong,source}|null`
  - 詳細盤面：`lunar{year_gz,zodiac,month,day,is_leap,text}`、`terms{prev{name,time},next{name,time}}`、`qiyun{forward,years,months,days,hours,start_age,jiaoyun,huanyun_digit,text}`、`taiyuan{gz,nayin}`、`minggong{gz,nayin}|null`、`relations[]{kind(合|沖|刑|害|破|會),text,pillars[]}`、`shensha[]{name,where,basis}`、`liuyue{year,months[12]{term,gz,stem_god,branch_god}}`、`chenggu{total_qian,text,parts{year,month,day,hour},verse,note}`
- 紫微：`palaces[12]`（依地支子→亥；每宮 `name/branch/stem/gz/major/lucky/unlucky/other/hua{星:化}/is_body/is_laiyin/daxian[起,迄]/is_empty` ＋ `changsheng/boshi`（十二長生、博士十二神）＋ 可選 `brightness{星:廟旺利陷}/adjective_stars[]`（x-iztro））、`life_branch`、`body_branch`、`laiyin_branch`（來因宮地支：宮干＝生年天干，子丑不取）、`five_class`、`soul_star`、`body_star`、`lunar`、`hour_branch`、`age`
  - `luck{start_age, forward, age_now, daxian[12]{index,palace,branch,stem,gz,ages[2],years[2],changsheng,sihua[4],sihua_landing{化:宮},current, liunian[10]{year,age,gz,taisui_palace,branch,sihua[4],sihua_landing{},flow_stars{流祿…流馬:地支},suiqian{支:神},jiangqian{支:神},current}}}|null`（性別未填為 null）
  - `enrich{patterns[{name,palace,broken,stars[]}],source}|null`（x-iztro 格局，可選）
- 姓名學：`surname`、`given`、`split_note`、`chars[]{char,role(姓|名),strokes,kangxi,modern,traditional,how}`、`grids[5]{name,id(tian|ren|di|wai|zong),number,shuli,element,yinyang,luck(吉|半吉|凶),formula,role,bazi(喜用|忌|閒)}`、`sancai`（如「金土水」）、`relations{成功運|基礎運|社交運:{kind,text,score}}`、`bazi{favourable[],avoid[],day_master,strength}`

事實 id 命名：

| 前綴 | 例子 |
|---|---|
| `bazi.pillar.{year,month,day,hour}` | 四柱 |
| `bazi.god.{pillar}_stem` / `_branch` | 十神（天干／藏干） |
| `bazi.day_master` `bazi.strength` `bazi.favourable` | 日主、旺衰、喜用 |
| `bazi.gods.present` `bazi.gods.absent` `bazi.relations` | 十神總覽、盤內合沖刑害破會 |
| `bazi.lunar` `bazi.terms` `bazi.qiyun` `bazi.taiyuan` `bazi.minggong` | 農曆、節氣、起運、胎元、命宮 |
| `bazi.nayin.{pillar}` `bazi.kongwang.{pillar}` `bazi.changsheng.{pillar}` | 納音、空亡、十二長生 |
| `bazi.shensha` `bazi.chenggu` | 神煞、稱骨 |
| `bazi.dayun.{n}` `bazi.dayun.current` | 大運 |
| `bazi.liunian.{YYYY}` `bazi.liunian.current` | 流年 |
| `ziwei.lunar` `ziwei.life_palace` `ziwei.body_palace` `ziwei.five_class` `ziwei.soul_star` `ziwei.body_star` | 基本 |
| `ziwei.palace.{命宮…父母宮}` | 十二宮主星 |
| `ziwei.hua.{化祿,化權,化科,化忌}` | 生年四化 |
| `ziwei.daxian.current` `ziwei.liunian.{YYYY}` | 大限、流年 |
| `xingming.name` `xingming.char.{n}` | 姓名、每個字的筆畫（`how` 寫部首還原與 Unihan 出處） |
| `xingming.ge.{tian,ren,di,wai,zong}` | 五格：天格、人格、地格、外格、總格 |
| `xingming.sancai` `xingming.yun.{success,base,social}` | 三才配置；成功運、基礎運、社交運 |
| `xingming.bazi.favourable` `xingming.bazi.link` | 八字喜用（同一套旺衰規則）、各格五行對喜用 |

## 解讀 `Reading`

```json
{
  "system": "bazi", "subject": "...", "persona": "玄機",
  "sections": [
    {"key": "overview", "title": "總論", "direction": "平",
     "text": "……", "evidence": ["bazi.day_master", "bazi.strength"], "cards": ["shishen.zhengguan"]}
  ],
  "disclaimer": "……",
  "checks": {
    "passed": true,
    "chart_check":    {"ok": true,  "issues": []},
    "citation_check": {"ok": true,  "issues": []},
    "boundary_check": {"ok": false, "issues": [{"section": "wealth", "sentence": "……適合買股票", "rule": "投資"}]},
    "summary": "3/4 通過"
  },
  "cost_usd": 0.0, "backend": "mock"
}
```

六段固定：`overview 總論`、`personality 性格`、`career 事業`、`love 感情`、`wealth 財運`、`year 流年`。
姓名學的 key 相同，只有第六段標題是「八字配合」（姓名不隨年份變，改看姓名五行與八字喜用）。
`direction` 由程式先依規則判定（吉／平／凶），AI 只負責措辭；這是一致性的來源（6-5）。
`evidence` 是事實 id、`cards` 是知識卡 id，畫面要能點開顯示原文。

## 端點

| 方法 | 路徑 | 說明 |
|---|---|---|
| GET | `/api/health` | `{status, maintenance, backend, provider, model, cards}`；`backend` ∈ mock / anthropic / openai / deepseek / gemini / openai_compatible |
| POST | `/api/cast` | `{system, birth}` → `ChartData`；`system` ∈ bazi / ziwei / xingming |
| POST | `/api/cast/all` | `{birth}` → `{bazi, ziwei, ziwei_candidates, xingming, xingming_error}`（紫微缺時辰時 `ziwei` 為 null；沒填 `full_name` 時 `xingming` 為 null，排不出來時 `xingming_error` 寫原因） |
| POST | `/api/reading` | `{system, birth, focus?}` → `Reading`（含 `checks`） |
| POST | `/api/reading/stream` | 同上，SSE：`event: delta`（文字片段）、`event: done`（完整 `Reading` JSON）、`event: error` |
| POST | `/api/synastry` | `{a: birth, b: birth}` → `Synastry` |
| POST | `/api/chat` | `{session_id?, birth?, message}` → `{session_id, reply, action, evidence, cards, chart_summary}` |
| POST | `/api/check` | `{reading, chart}` → `checks`（獨立查核，教學用） |
| POST | `/api/consistency` | `{system, birth, runs: 3}` → 同盤問三次的一致性報告 |
| GET | `/api/geo?place=台北&date=1975-07-01` | 出生地 → 經緯度、時區（台灣日光節約時間依日期套用並附說明）；查不到回 `{name:null,message}` |
| GET | `/api/cities` | 離線城市表（約 100 城，中／英／日別名） |
| GET | `/api/schools` | 流派清單、站台預設、所有開關與選項 |
| GET／POST | `/api/llm/backends`・`/api/llm/models` | 自帶金鑰：可用後端；驗證金鑰並列出模型 |
| GET | `/api/cards` `/api/cards/{id}` | 知識卡清單／單張 |
| GET | `/api/persona` | 人設公開欄位（名字、開場白） |
| GET | `/api/usage` | 今日用量與上限 |

### 合盤 `Synastry`

```json
{
  "a": ChartData, "b": ChartData,
  "items": [
    {"kind": "合", "title": "日主相生", "text": "小美日主辛金，小明日主壬水，金生水……",
     "evidence": [{"who": "a", "fact_id": "bazi.day_master"}, {"who": "b", "fact_id": "bazi.day_master"}]}
  ],
  "score": {"harmony": 3, "tension": 1, "net": 2},
  "summary": "……", "reading": "……（AI 合盤解讀，離線模式為事實摘要）"
}
```
`kind` ∈ `合 / 沖 / 生 / 剋 / 同`。每一項都能追回兩張盤的哪一格。

### 對話 `/api/chat`

- 第一次呼叫帶 `birth`，後端排盤並建立 session（命盤只算一次，7-1）；之後只帶 `session_id` 與 `message`。
- `action` ∈ `answer`（直接回答）、`recast`（重算某年流年）、`lookup`（查知識卡）、`refuse`（越界婉拒）。
- 離線模式用關鍵字判斷動作；接 Anthropic 時由模型以 tool use 自己決定。

### SSE 範例

```
event: delta
data: {"text": "你的日主是辛金"}

event: done
data: {"system": "bazi", "sections": [...], "checks": {...}}
```
