# 知識卡（5-1）

每張卡一個 Markdown 檔，放在 `cards/`。檔名 = id + `.md`。這是「示範知識庫」，學員照自己學的流派改寫、擴充。

## 格式

```markdown
---
id: shishen.zhengguan          # 穩定 id，只用小寫英數與點
name: 正官                      # 顯示名稱
type: 十神                      # 十神 | 旺衰 | 宮位 | 主星 | 吉星 | 煞星 | 四化 | 神煞 | 納音 | 長生 | 五格 | 81數理 | 五行 | 三才 | 八字配合
system: bazi                    # bazi | ziwei | xingming
keywords: [正官]                # 命盤事實的 value/note 出現這些詞，就把這張卡帶給 AI
source: 示範知識庫・課程編寫（綜合《子平真詮》《滴天髓》通論）
---

## 意義
一段話說這個符號代表什麼。

## 正面
- 條列

## 負面
- 條列

## 常見組合
- 「正官配印」：……
- 「官殺混雜」：……

## 出處
條列參考來源；沒有明確出處就寫「課程編寫」。
```

## id 命名

| 類型 | 前綴 | 例子 |
|---|---|---|
| 十神 | `shishen.` | `shishen.bijian` 比肩、`jiecai` 劫財、`shishen` 食神、`shangguan` 傷官、`piancai` 偏財、`zhengcai` 正財、`qisha` 七殺、`zhengguan` 正官、`pianyin` 偏印、`zhengyin` 正印 |
| 旺衰 | `wangshuai.` | `wangshuai.shenqiang` 身強、`wangshuai.shenruo` 身弱 |
| 十二宮、來因宮 | `gong.` | `gong.ming` 命宮、`xiongdi` 兄弟宮、`fuqi` 夫妻宮、`zinv` 子女宮、`caibo` 財帛宮、`jie` 疾厄宮、`qianyi` 遷移宮、`jiaoyou` 交友宮、`guanlu` 官祿宮、`tianzhai` 田宅宮、`fude` 福德宮、`fumu` 父母宮；`laiyin` 來因宮（欽天四化／北派才用） |
| 十四主星 | `star.` | `star.ziwei` 紫微、`tianji` 天機、`taiyang` 太陽、`wuqu` 武曲、`tiantong` 天同、`lianzhen` 廉貞、`tianfu` 天府、`taiyin` 太陰、`tanlang` 貪狼、`jumen` 巨門、`tianxiang` 天相、`tianliang` 天梁、`qisha` 七殺、`pojun` 破軍 |
| 六吉 | `star.` | `star.zuofu` 左輔、`youbi` 右弼、`wenchang` 文昌、`wenqu` 文曲、`tiankui` 天魁、`tianyue` 天鉞 |
| 六煞 | `star.` | `star.qingyang` 擎羊、`tuoluo` 陀羅、`huoxing` 火星、`lingxing` 鈴星、`dikong` 地空、`dijie` 地劫 |
| 四化 | `hua.` | `hua.lu` 化祿、`hua.quan` 化權、`hua.ke` 化科、`hua.ji` 化忌 |
| 神煞 | `shensha.` | `shensha.tianyi` 天乙貴人、`wenchang` 文昌貴人、`taiji` 太極貴人、`tianchu` 天廚貴人、`lushen` 祿神、`yangren` 羊刃、`jiangxing` 將星、`yima` 驛馬、`taohua` 桃花、`huagai` 華蓋、`jiesha` 劫煞、`wangshen` 亡神、`hongluan` 紅鸞、`tianxi` 天喜、`guchen` 孤辰、`guasu` 寡宿、`tianyi_doctor` 天醫、`sifei` 四廢、`kuigang` 魁罡 |
| 姓名學五格 | `wuge.` | `wuge.tian` 天格、`ren` 人格、`di` 地格、`wai` 外格、`zong` 總格 |
| 81 數理 | `shuli.` | `shuli.ji` 吉、`banji` 半吉、`xiong` 凶 |
| 姓名五行 | `wuxing.` | `wuxing.mu` 木、`huo` 火、`tu` 土、`jin` 金、`shui` 水 |
| 三才 | `sancai.` | `sancai.peizhi` 三才配置、`xiangsheng` 相生、`bihe` 比和、`xiangke` 相剋、`bazi` 姓名配八字 |
| 十二長生 | `changsheng.` | `changsheng.zhangsheng` 長生、`muyu` 沐浴、`guandai` 冠帶、`linguan` 臨官、`diwang` 帝旺、`shuai` 衰、`bing` 病、`si` 死、`mu` 墓、`jue` 絕、`tai` 胎、`yang` 養 |

## 程式怎麼用

`fortune.knowledge.store.load_cards()` 讀全部；`select_cards(chart)` 依 keywords 對命盤事實挑出相關的卡，塞進 prompt。
解讀每段的 `cards` 欄位引用 id；`citation_check` 會檢查引用的 id 是否真的存在。
