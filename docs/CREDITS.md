# 引用與致謝

課程版的排盤引擎全部是本 repo 的原生實作；下面的開源專案用來**互證**（測試）、**加值**（可選安裝）或**參考規則**。
可選套件：`pip install -e ".[oracles]"`，不裝不影響排盤與解讀。

| 專案 | 授權 | 怎麼用 |
|---|---|---|
| [6tail/lunar-python](https://github.com/6tail/lunar-python) | MIT | **互證**：`python -m fortune.tools.oracle_check` 與 `tests/test_oracles.py` 拿它驗四柱（含晚子時）、節氣時刻、胎元、命宮、大運；400 個隨機生辰全部一致。**加值（可選）**：八字頁的黃曆區塊（二十八宿、建除、彭祖百忌、吉神凶煞、宜忌、方位、胎息；原始文字為簡體，以靜態對照表 `fortune/bazi/almanac_zh_tw.py`（OpenCC s2twp 產生＋命理詞彙修正）轉為繁體）。 |
| [SylarLong/iztro](https://github.com/SylarLong/iztro) via [x-haose/x-iztro](https://pypi.org/project/x-iztro/)（Rust 移植） | MIT | **互證**：驗紫微命宮、身宮、五行局、十四主星與十八輔煞星的宮位；400 個隨機生辰全部一致。**加值（可選）**：星曜廟旺利陷、雜曜、格局。 |
| [ephem (PyEphem)](https://rhodesmill.org/pyephem/) | MIT | **執行期**：太陽視黃經 → 二十四節氣精確時刻（對照官方年曆與 ephem 內建分至點到秒）。 |
| [Unicode Unihan Database](https://www.unicode.org/charts/unihan.html) | Unicode License v3 | **執行期資料**：姓名學的筆畫表 `fortune/xingming/strokes.tsv`（約 2.8 萬字）由 `python -m fortune.tools.build_strokes` 從 Unihan 的 `kRSUnicode`（康熙部首．其餘筆畫）、`kTotalStrokes`（台灣筆畫）、`kTraditionalVariant`（簡化字對應的正體字）產生；康熙筆畫＝部首原形筆畫＋其餘筆畫。 |
| [lunardate](https://pypi.org/project/lunardate/) | GPL-3.0（函式庫） | **執行期**：公曆↔農曆（1900–2100），含閏月旗標。 |
| [ChiShengChen/bazaar-of-fates](https://github.com/ChiShengChen/bazaar-of-fates)（主專案） | — | 旺衰 v2 的規則與加權、城市／台灣日光節約時間表、紫微大限流年的流曜與歲前將前十二神，由主專案移植；主專案另以 kinliuren、kinqimen、Swiss Ephemeris 互證其他系統。 |
| 中央氣象署／台北市政府曆象表、USNO | 公開資料 | 節氣與分至點的參考時刻；台灣日光節約時間表（1946–1961、1974–1975、1979）。 |

典籍：《淵海子平》《三命通會》《子平真詮》《滴天髓》《窮通寶鑑》（八字）、《紫微斗數全書》《紫微斗數全集》（紫微）、袁天罡《稱骨歌》；姓名學依熊崎健翁五格剖象法通論（81 數理採通行分類，各家在半吉數上有出入）。

互證抓到的差異與結論見 `docs/validation-zydx.md`（坊間網站的節氣錯誤）與 `docs/audit-algorithms.md`。
