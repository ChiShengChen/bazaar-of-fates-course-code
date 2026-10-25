// 假資料（符合 docs/api.md 契約）— `index.html?mock=1` 時使用，方便離線檢查版面。
// 八字／紫微 ChartData 由 fortune.chart 引擎實際算出（小美 1990-06-15 14:30 台北；小明 1988-11-03 08:10 台中），
// Reading／Synastry／chat／persona／cards 為手寫範例。不要把任何內容寫死進 app.js，一切從資料渲染。
window.MOCK_DATA = {
  "bazi": {
    "system": "bazi",
    "system_zh": "八字",
    "subject": "小美・1990-06-15 14:30・台北",
    "birth": {
      "name": "小美",
      "birth_date": "1990-06-15",
      "birth_time": "14:30:00",
      "gender": "female",
      "place": "台北",
      "longitude": 121.5,
      "tz_offset_hours": 8.0,
      "use_true_solar_time": true
    },
    "cast_at": "2026-10-08T10:00:00",
    "facts": [
      {
        "id": "bazi.pillar.year",
        "group": "四柱",
        "label": "年柱",
        "value": "庚午",
        "note": "金火・馬・藏干 丁、己"
      },
      {
        "id": "bazi.god.year_stem",
        "group": "十神",
        "label": "年柱天干 庚",
        "value": "劫財",
        "note": ""
      },
      {
        "id": "bazi.god.year_branch",
        "group": "十神",
        "label": "年柱地支 午 藏干",
        "value": "丁七殺、己偏印",
        "note": ""
      },
      {
        "id": "bazi.pillar.month",
        "group": "四柱",
        "label": "月柱",
        "value": "壬午",
        "note": "水火・馬・藏干 丁、己"
      },
      {
        "id": "bazi.god.month_stem",
        "group": "十神",
        "label": "月柱天干 壬",
        "value": "傷官",
        "note": ""
      },
      {
        "id": "bazi.god.month_branch",
        "group": "十神",
        "label": "月柱地支 午 藏干",
        "value": "丁七殺、己偏印",
        "note": ""
      },
      {
        "id": "bazi.pillar.day",
        "group": "四柱",
        "label": "日柱",
        "value": "辛亥",
        "note": "金水・豬・藏干 壬、甲"
      },
      {
        "id": "bazi.god.day_branch",
        "group": "十神",
        "label": "日柱地支 亥 藏干",
        "value": "壬傷官、甲正財",
        "note": ""
      },
      {
        "id": "bazi.pillar.hour",
        "group": "四柱",
        "label": "時柱",
        "value": "乙未",
        "note": "木土・羊・藏干 己、丁、乙"
      },
      {
        "id": "bazi.god.hour_stem",
        "group": "十神",
        "label": "時柱天干 乙",
        "value": "偏財",
        "note": ""
      },
      {
        "id": "bazi.god.hour_branch",
        "group": "十神",
        "label": "時柱地支 未 藏干",
        "value": "己偏印、丁七殺、乙偏財",
        "note": ""
      },
      {
        "id": "bazi.day_master",
        "group": "日主",
        "label": "日主",
        "value": "辛金",
        "note": "陰金"
      },
      {
        "id": "bazi.gods.present",
        "group": "十神",
        "label": "命中出現的十神",
        "value": "七殺、偏印、偏財、傷官、劫財、正財",
        "note": ""
      },
      {
        "id": "bazi.gods.absent",
        "group": "十神",
        "label": "命中未出現的十神",
        "value": "比肩、食神、正官、正印",
        "note": ""
      },
      {
        "id": "bazi.strength",
        "group": "旺衰",
        "label": "日主旺衰",
        "value": "身弱（宜生扶）",
        "note": "日主金於午月失令（-2）；年柱天干庚（金）生扶日主（+1）；月柱天干壬（水）耗洩日主（-1）；時柱天干乙（木）耗洩日主（-1）。簡化版旺衰估算，流派間差異大，僅供課程示範"
      },
      {
        "id": "bazi.favourable",
        "group": "旺衰",
        "label": "喜用五行",
        "value": "土、金",
        "note": ""
      },
      {
        "id": "bazi.dayun.1",
        "group": "大運",
        "label": "第1大運",
        "value": "辛巳（3–13 歲，約 1993 年起）",
        "note": "天干比肩、地支本氣正官"
      },
      {
        "id": "bazi.dayun.2",
        "group": "大運",
        "label": "第2大運",
        "value": "庚辰（13–23 歲，約 2003 年起）",
        "note": "天干劫財、地支本氣正印"
      },
      {
        "id": "bazi.dayun.3",
        "group": "大運",
        "label": "第3大運",
        "value": "己卯（23–33 歲，約 2013 年起）",
        "note": "天干偏印、地支本氣偏財"
      },
      {
        "id": "bazi.dayun.4",
        "group": "大運",
        "label": "第4大運",
        "value": "戊寅（33–43 歲，約 2023 年起）",
        "note": "天干正印、地支本氣正財・目前所在"
      },
      {
        "id": "bazi.dayun.current",
        "group": "大運",
        "label": "目前大運",
        "value": "戊寅",
        "note": "正印/正財"
      },
      {
        "id": "bazi.dayun.5",
        "group": "大運",
        "label": "第5大運",
        "value": "丁丑（43–53 歲，約 2033 年起）",
        "note": "天干七殺、地支本氣偏印"
      },
      {
        "id": "bazi.dayun.6",
        "group": "大運",
        "label": "第6大運",
        "value": "丙子（53–63 歲，約 2043 年起）",
        "note": "天干正官、地支本氣食神"
      },
      {
        "id": "bazi.dayun.7",
        "group": "大運",
        "label": "第7大運",
        "value": "乙亥（63–73 歲，約 2053 年起）",
        "note": "天干偏財、地支本氣傷官"
      },
      {
        "id": "bazi.dayun.8",
        "group": "大運",
        "label": "第8大運",
        "value": "甲戌（73–83 歲，約 2063 年起）",
        "note": "天干正財、地支本氣正印"
      },
      {
        "id": "bazi.liunian.2026",
        "group": "流年",
        "label": "2026 流年",
        "value": "丙午・正官/七殺",
        "note": "流年五行 火火，對喜用 土、金 而言：非喜用・今年"
      },
      {
        "id": "bazi.liunian.2027",
        "group": "流年",
        "label": "2027 流年",
        "value": "丁未・七殺/偏印",
        "note": "流年五行 火土，對喜用 土、金 而言：部分喜用"
      },
      {
        "id": "bazi.liunian.2028",
        "group": "流年",
        "label": "2028 流年",
        "value": "戊申・正印/劫財",
        "note": "流年五行 土金，對喜用 土、金 而言：喜用到位"
      },
      {
        "id": "bazi.liunian.current",
        "group": "流年",
        "label": "今年流年",
        "value": "丙午",
        "note": ""
      },
      {
        "id": "bazi.relations",
        "group": "刑沖合會",
        "label": "盤內合沖",
        "value": "年柱庚與時柱乙天干五合（合金）、年柱午與時柱未六合、月柱午與時柱未六合",
        "note": ""
      }
    ],
    "payload": {
      "pillars": [
        {
          "name": "年柱",
          "stem": "庚",
          "branch": "午",
          "gz": "庚午",
          "stem_elem": "金",
          "branch_elem": "火",
          "zodiac": "馬",
          "hidden_stems": [
            "丁",
            "己"
          ],
          "stem_god": "劫財",
          "hidden_gods": [
            "七殺",
            "偏印"
          ],
          "nayin": "路旁土",
          "kongwang": "戌亥",
          "changsheng": "病",
          "shensha": [
            "天乙貴人",
            "將星"
          ]
        },
        {
          "name": "月柱",
          "stem": "壬",
          "branch": "午",
          "gz": "壬午",
          "stem_elem": "水",
          "branch_elem": "火",
          "zodiac": "馬",
          "hidden_stems": [
            "丁",
            "己"
          ],
          "stem_god": "傷官",
          "hidden_gods": [
            "七殺",
            "偏印"
          ],
          "nayin": "楊柳木",
          "kongwang": "申酉",
          "changsheng": "病",
          "shensha": [
            "天乙貴人",
            "桃花"
          ]
        },
        {
          "name": "日柱",
          "stem": "辛",
          "branch": "亥",
          "gz": "辛亥",
          "stem_elem": "金",
          "branch_elem": "水",
          "zodiac": "豬",
          "hidden_stems": [
            "壬",
            "甲"
          ],
          "stem_god": "日主",
          "hidden_gods": [
            "傷官",
            "正財"
          ],
          "nayin": "釵釧金",
          "kongwang": "寅卯",
          "changsheng": "沐浴",
          "shensha": [
            "驛馬",
            "文昌貴人"
          ]
        },
        {
          "name": "時柱",
          "stem": "乙",
          "branch": "未",
          "gz": "乙未",
          "stem_elem": "木",
          "branch_elem": "土",
          "zodiac": "羊",
          "hidden_stems": [
            "己",
            "丁",
            "乙"
          ],
          "stem_god": "偏財",
          "hidden_gods": [
            "偏印",
            "七殺",
            "偏財"
          ],
          "nayin": "砂中金",
          "kongwang": "辰巳",
          "changsheng": "衰",
          "shensha": [
            "華蓋"
          ]
        }
      ],
      "day_master": "辛",
      "strength": {
        "score": -3,
        "label": "身弱（宜生扶）",
        "favourable": [
          "土",
          "金"
        ],
        "notes": [
          "日主金於午月失令（-2）",
          "年柱天干庚（金）生扶日主（+1）",
          "月柱天干壬（水）耗洩日主（-1）",
          "時柱天干乙（木）耗洩日主（-1）"
        ],
        "disclaimer": "簡化版旺衰估算，流派間差異大，僅供課程示範"
      },
      "dayun": [
        {
          "index": 1,
          "gz": "辛巳",
          "stem": "辛",
          "branch": "巳",
          "start_age": 3.1,
          "end_age": 13.1,
          "start_year": 1993,
          "stem_god": "比肩",
          "branch_god": "正官",
          "changsheng": "死",
          "shensha": [
            "驛馬"
          ],
          "liunian": [
            {
              "year": 1993,
              "gz": "癸酉",
              "stem_god": "食神",
              "branch_god": "比肩"
            },
            {
              "year": 1994,
              "gz": "甲戌",
              "stem_god": "正財",
              "branch_god": "正印"
            },
            {
              "year": 1995,
              "gz": "乙亥",
              "stem_god": "偏財",
              "branch_god": "傷官"
            },
            {
              "year": 1996,
              "gz": "丙子",
              "stem_god": "正官",
              "branch_god": "食神"
            },
            {
              "year": 1997,
              "gz": "丁丑",
              "stem_god": "七殺",
              "branch_god": "偏印"
            },
            {
              "year": 1998,
              "gz": "戊寅",
              "stem_god": "正印",
              "branch_god": "正財"
            },
            {
              "year": 1999,
              "gz": "己卯",
              "stem_god": "偏印",
              "branch_god": "偏財"
            },
            {
              "year": 2000,
              "gz": "庚辰",
              "stem_god": "劫財",
              "branch_god": "正印"
            },
            {
              "year": 2001,
              "gz": "辛巳",
              "stem_god": "比肩",
              "branch_god": "正官"
            },
            {
              "year": 2002,
              "gz": "壬午",
              "stem_god": "傷官",
              "branch_god": "七殺"
            }
          ]
        },
        {
          "index": 2,
          "gz": "庚辰",
          "stem": "庚",
          "branch": "辰",
          "start_age": 13.1,
          "end_age": 23.1,
          "start_year": 2003,
          "stem_god": "劫財",
          "branch_god": "正印",
          "changsheng": "墓",
          "shensha": [
            "華蓋"
          ],
          "liunian": [
            {
              "year": 2003,
              "gz": "癸未",
              "stem_god": "食神",
              "branch_god": "偏印"
            },
            {
              "year": 2004,
              "gz": "甲申",
              "stem_god": "正財",
              "branch_god": "劫財"
            },
            {
              "year": 2005,
              "gz": "乙酉",
              "stem_god": "偏財",
              "branch_god": "比肩"
            },
            {
              "year": 2006,
              "gz": "丙戌",
              "stem_god": "正官",
              "branch_god": "正印"
            },
            {
              "year": 2007,
              "gz": "丁亥",
              "stem_god": "七殺",
              "branch_god": "傷官"
            },
            {
              "year": 2008,
              "gz": "戊子",
              "stem_god": "正印",
              "branch_god": "食神"
            },
            {
              "year": 2009,
              "gz": "己丑",
              "stem_god": "偏印",
              "branch_god": "偏印"
            },
            {
              "year": 2010,
              "gz": "庚寅",
              "stem_god": "劫財",
              "branch_god": "正財"
            },
            {
              "year": 2011,
              "gz": "辛卯",
              "stem_god": "比肩",
              "branch_god": "偏財"
            },
            {
              "year": 2012,
              "gz": "壬辰",
              "stem_god": "傷官",
              "branch_god": "正印"
            }
          ]
        },
        {
          "index": 3,
          "gz": "己卯",
          "stem": "己",
          "branch": "卯",
          "start_age": 23.1,
          "end_age": 33.1,
          "start_year": 2013,
          "stem_god": "偏印",
          "branch_god": "偏財",
          "changsheng": "絕",
          "shensha": [
            "桃花"
          ],
          "liunian": [
            {
              "year": 2013,
              "gz": "癸巳",
              "stem_god": "食神",
              "branch_god": "正官"
            },
            {
              "year": 2014,
              "gz": "甲午",
              "stem_god": "正財",
              "branch_god": "七殺"
            },
            {
              "year": 2015,
              "gz": "乙未",
              "stem_god": "偏財",
              "branch_god": "偏印"
            },
            {
              "year": 2016,
              "gz": "丙申",
              "stem_god": "正官",
              "branch_god": "劫財"
            },
            {
              "year": 2017,
              "gz": "丁酉",
              "stem_god": "七殺",
              "branch_god": "比肩"
            },
            {
              "year": 2018,
              "gz": "戊戌",
              "stem_god": "正印",
              "branch_god": "正印"
            },
            {
              "year": 2019,
              "gz": "己亥",
              "stem_god": "偏印",
              "branch_god": "傷官"
            },
            {
              "year": 2020,
              "gz": "庚子",
              "stem_god": "劫財",
              "branch_god": "食神"
            },
            {
              "year": 2021,
              "gz": "辛丑",
              "stem_god": "比肩",
              "branch_god": "偏印"
            },
            {
              "year": 2022,
              "gz": "壬寅",
              "stem_god": "傷官",
              "branch_god": "正財"
            }
          ]
        },
        {
          "index": 4,
          "gz": "戊寅",
          "stem": "戊",
          "branch": "寅",
          "start_age": 33.1,
          "end_age": 43.1,
          "start_year": 2023,
          "stem_god": "正印",
          "branch_god": "正財",
          "changsheng": "胎",
          "shensha": [
            "天乙貴人",
            "驛馬"
          ],
          "liunian": [
            {
              "year": 2023,
              "gz": "癸卯",
              "stem_god": "食神",
              "branch_god": "偏財"
            },
            {
              "year": 2024,
              "gz": "甲辰",
              "stem_god": "正財",
              "branch_god": "正印"
            },
            {
              "year": 2025,
              "gz": "乙巳",
              "stem_god": "偏財",
              "branch_god": "正官"
            },
            {
              "year": 2026,
              "gz": "丙午",
              "stem_god": "正官",
              "branch_god": "七殺"
            },
            {
              "year": 2027,
              "gz": "丁未",
              "stem_god": "七殺",
              "branch_god": "偏印"
            },
            {
              "year": 2028,
              "gz": "戊申",
              "stem_god": "正印",
              "branch_god": "劫財"
            },
            {
              "year": 2029,
              "gz": "己酉",
              "stem_god": "偏印",
              "branch_god": "比肩"
            },
            {
              "year": 2030,
              "gz": "庚戌",
              "stem_god": "劫財",
              "branch_god": "正印"
            },
            {
              "year": 2031,
              "gz": "辛亥",
              "stem_god": "比肩",
              "branch_god": "傷官"
            },
            {
              "year": 2032,
              "gz": "壬子",
              "stem_god": "傷官",
              "branch_god": "食神"
            }
          ]
        },
        {
          "index": 5,
          "gz": "丁丑",
          "stem": "丁",
          "branch": "丑",
          "start_age": 43.1,
          "end_age": 53.1,
          "start_year": 2033,
          "stem_god": "七殺",
          "branch_god": "偏印",
          "changsheng": "養",
          "shensha": [],
          "liunian": [
            {
              "year": 2033,
              "gz": "癸丑",
              "stem_god": "食神",
              "branch_god": "偏印"
            },
            {
              "year": 2034,
              "gz": "甲寅",
              "stem_god": "正財",
              "branch_god": "正財"
            },
            {
              "year": 2035,
              "gz": "乙卯",
              "stem_god": "偏財",
              "branch_god": "偏財"
            },
            {
              "year": 2036,
              "gz": "丙辰",
              "stem_god": "正官",
              "branch_god": "正印"
            },
            {
              "year": 2037,
              "gz": "丁巳",
              "stem_god": "七殺",
              "branch_god": "正官"
            },
            {
              "year": 2038,
              "gz": "戊午",
              "stem_god": "正印",
              "branch_god": "七殺"
            },
            {
              "year": 2039,
              "gz": "己未",
              "stem_god": "偏印",
              "branch_god": "偏印"
            },
            {
              "year": 2040,
              "gz": "庚申",
              "stem_god": "劫財",
              "branch_god": "劫財"
            },
            {
              "year": 2041,
              "gz": "辛酉",
              "stem_god": "比肩",
              "branch_god": "比肩"
            },
            {
              "year": 2042,
              "gz": "壬戌",
              "stem_god": "傷官",
              "branch_god": "正印"
            }
          ]
        },
        {
          "index": 6,
          "gz": "丙子",
          "stem": "丙",
          "branch": "子",
          "start_age": 53.1,
          "end_age": 63.1,
          "start_year": 2043,
          "stem_god": "正官",
          "branch_god": "食神",
          "changsheng": "長生",
          "shensha": [
            "文昌貴人"
          ],
          "liunian": [
            {
              "year": 2043,
              "gz": "癸亥",
              "stem_god": "食神",
              "branch_god": "傷官"
            },
            {
              "year": 2044,
              "gz": "甲子",
              "stem_god": "正財",
              "branch_god": "食神"
            },
            {
              "year": 2045,
              "gz": "乙丑",
              "stem_god": "偏財",
              "branch_god": "偏印"
            },
            {
              "year": 2046,
              "gz": "丙寅",
              "stem_god": "正官",
              "branch_god": "正財"
            },
            {
              "year": 2047,
              "gz": "丁卯",
              "stem_god": "七殺",
              "branch_god": "偏財"
            },
            {
              "year": 2048,
              "gz": "戊辰",
              "stem_god": "正印",
              "branch_god": "正印"
            },
            {
              "year": 2049,
              "gz": "己巳",
              "stem_god": "偏印",
              "branch_god": "正官"
            },
            {
              "year": 2050,
              "gz": "庚午",
              "stem_god": "劫財",
              "branch_god": "七殺"
            },
            {
              "year": 2051,
              "gz": "辛未",
              "stem_god": "比肩",
              "branch_god": "偏印"
            },
            {
              "year": 2052,
              "gz": "壬申",
              "stem_god": "傷官",
              "branch_god": "劫財"
            }
          ]
        },
        {
          "index": 7,
          "gz": "乙亥",
          "stem": "乙",
          "branch": "亥",
          "start_age": 63.1,
          "end_age": 73.1,
          "start_year": 2053,
          "stem_god": "偏財",
          "branch_god": "傷官",
          "changsheng": "沐浴",
          "shensha": [
            "文昌貴人"
          ],
          "liunian": [
            {
              "year": 2053,
              "gz": "癸酉",
              "stem_god": "食神",
              "branch_god": "比肩"
            },
            {
              "year": 2054,
              "gz": "甲戌",
              "stem_god": "正財",
              "branch_god": "正印"
            },
            {
              "year": 2055,
              "gz": "乙亥",
              "stem_god": "偏財",
              "branch_god": "傷官"
            },
            {
              "year": 2056,
              "gz": "丙子",
              "stem_god": "正官",
              "branch_god": "食神"
            },
            {
              "year": 2057,
              "gz": "丁丑",
              "stem_god": "七殺",
              "branch_god": "偏印"
            },
            {
              "year": 2058,
              "gz": "戊寅",
              "stem_god": "正印",
              "branch_god": "正財"
            },
            {
              "year": 2059,
              "gz": "己卯",
              "stem_god": "偏印",
              "branch_god": "偏財"
            },
            {
              "year": 2060,
              "gz": "庚辰",
              "stem_god": "劫財",
              "branch_god": "正印"
            },
            {
              "year": 2061,
              "gz": "辛巳",
              "stem_god": "比肩",
              "branch_god": "正官"
            },
            {
              "year": 2062,
              "gz": "壬午",
              "stem_god": "傷官",
              "branch_god": "七殺"
            }
          ]
        },
        {
          "index": 8,
          "gz": "甲戌",
          "stem": "甲",
          "branch": "戌",
          "start_age": 73.1,
          "end_age": 83.1,
          "start_year": 2063,
          "stem_god": "正財",
          "branch_god": "正印",
          "changsheng": "冠帶",
          "shensha": [
            "將星"
          ],
          "liunian": [
            {
              "year": 2063,
              "gz": "癸未",
              "stem_god": "食神",
              "branch_god": "偏印"
            },
            {
              "year": 2064,
              "gz": "甲申",
              "stem_god": "正財",
              "branch_god": "劫財"
            },
            {
              "year": 2065,
              "gz": "乙酉",
              "stem_god": "偏財",
              "branch_god": "比肩"
            },
            {
              "year": 2066,
              "gz": "丙戌",
              "stem_god": "正官",
              "branch_god": "正印"
            },
            {
              "year": 2067,
              "gz": "丁亥",
              "stem_god": "七殺",
              "branch_god": "傷官"
            },
            {
              "year": 2068,
              "gz": "戊子",
              "stem_god": "正印",
              "branch_god": "食神"
            },
            {
              "year": 2069,
              "gz": "己丑",
              "stem_god": "偏印",
              "branch_god": "偏印"
            },
            {
              "year": 2070,
              "gz": "庚寅",
              "stem_god": "劫財",
              "branch_god": "正財"
            },
            {
              "year": 2071,
              "gz": "辛卯",
              "stem_god": "比肩",
              "branch_god": "偏財"
            },
            {
              "year": 2072,
              "gz": "壬辰",
              "stem_god": "傷官",
              "branch_god": "正印"
            }
          ]
        }
      ],
      "age": 37,
      "true_solar_time": "14:35",
      "solar_correction_min": 6.0,
      "month_term": "芒種",
      "lunar": {
        "year_gz": "庚午",
        "zodiac": "馬",
        "month": 5,
        "day": 23,
        "is_leap": false,
        "text": "庚午年（馬）五月廿三 未時"
      },
      "terms": {
        "prev": {
          "name": "芒種",
          "time": "1990-06-06T04:46"
        },
        "next": {
          "name": "小暑",
          "time": "1990-07-07T15:00"
        }
      },
      "qiyun": {
        "forward": false,
        "years": 3,
        "months": 1,
        "days": 4,
        "hours": 6,
        "start_age": 3.1,
        "jiaoyun": "1993-07-19T20:35",
        "huanyun_digit": 3,
        "text": "出生後 3 年 1 個月 4 天 6 小時起運，1993 年 07 月 19 日 20:35 交運，之後每逢尾數 3 的年份換運"
      },
      "taiyuan": {
        "gz": "癸酉",
        "nayin": "劍鋒金"
      },
      "minggong": {
        "gz": "庚子",
        "nayin": "壁上土"
      },
      "relations": [
        {
          "kind": "合",
          "text": "年干庚與時干乙天干五合（合金）",
          "pillars": [
            "年",
            "時"
          ]
        },
        {
          "kind": "合",
          "text": "年支午與時支未六合",
          "pillars": [
            "年",
            "時"
          ]
        },
        {
          "kind": "合",
          "text": "月支午與時支未六合",
          "pillars": [
            "月",
            "時"
          ]
        },
        {
          "kind": "刑",
          "text": "年支午與月支午自刑",
          "pillars": [
            "年",
            "月"
          ]
        },
        {
          "kind": "合",
          "text": "月支午與日支亥暗合（午亥）",
          "pillars": [
            "月",
            "日"
          ]
        }
      ],
      "shensha": [
        {
          "name": "天乙貴人",
          "where": "年支午、月支午",
          "basis": "日干辛見寅午"
        },
        {
          "name": "文昌貴人",
          "where": "日支亥",
          "basis": "日干辛見亥"
        },
        {
          "name": "驛馬",
          "where": "日支亥",
          "basis": "年支午（寅午戌）見申；日支亥為月支驛馬"
        },
        {
          "name": "將星",
          "where": "年支午",
          "basis": "年支午（寅午戌）見午"
        },
        {
          "name": "桃花",
          "where": "月支午",
          "basis": "日支亥（亥卯未）見子；月支午為年支桃花"
        },
        {
          "name": "華蓋",
          "where": "時支未",
          "basis": "日支亥（亥卯未）見未"
        }
      ],
      "liuyue": {
        "year": 2026,
        "months": [
          {
            "term": "立春",
            "gz": "庚寅",
            "stem_god": "劫財",
            "branch_god": "正財"
          },
          {
            "term": "驚蟄",
            "gz": "辛卯",
            "stem_god": "比肩",
            "branch_god": "偏財"
          },
          {
            "term": "清明",
            "gz": "壬辰",
            "stem_god": "傷官",
            "branch_god": "正印"
          },
          {
            "term": "立夏",
            "gz": "癸巳",
            "stem_god": "食神",
            "branch_god": "正官"
          },
          {
            "term": "芒種",
            "gz": "甲午",
            "stem_god": "正財",
            "branch_god": "七殺"
          },
          {
            "term": "小暑",
            "gz": "乙未",
            "stem_god": "偏財",
            "branch_god": "偏印"
          },
          {
            "term": "立秋",
            "gz": "丙申",
            "stem_god": "正官",
            "branch_god": "劫財"
          },
          {
            "term": "白露",
            "gz": "丁酉",
            "stem_god": "七殺",
            "branch_god": "比肩"
          },
          {
            "term": "寒露",
            "gz": "戊戌",
            "stem_god": "正印",
            "branch_god": "正印"
          },
          {
            "term": "立冬",
            "gz": "己亥",
            "stem_god": "偏印",
            "branch_god": "傷官"
          },
          {
            "term": "大雪",
            "gz": "庚子",
            "stem_god": "劫財",
            "branch_god": "食神"
          },
          {
            "term": "小寒",
            "gz": "辛丑",
            "stem_god": "比肩",
            "branch_god": "偏印"
          }
        ]
      },
      "chenggu": {
        "total_qian": 44,
        "text": "四兩四錢",
        "parts": {
          "year": 13,
          "month": 15,
          "day": 8,
          "hour": 8
        },
        "verse": "萬事由天莫苦求，須知福祿勝前途。當年財帛難如意，晚景欣然便不憂。",
        "note": "骨重表坊間版本略有出入，僅供參考"
      }
    },
    "warnings": [
      "大運逆行，3.1 歲起運"
    ],
    "missing": []
  },
  "ziwei": {
    "system": "ziwei",
    "system_zh": "紫微斗數",
    "subject": "小美・1990-06-15 14:30・台北",
    "birth": {
      "name": "小美",
      "birth_date": "1990-06-15",
      "birth_time": "14:30:00",
      "gender": "female",
      "place": "台北",
      "longitude": 121.5,
      "tz_offset_hours": 8.0,
      "use_true_solar_time": true
    },
    "cast_at": "2026-10-08T10:00:00",
    "facts": [
      {
        "id": "ziwei.lunar",
        "group": "基本",
        "label": "農曆生日",
        "value": "庚午年5月23日 未時",
        "note": ""
      },
      {
        "id": "ziwei.life_palace",
        "group": "基本",
        "label": "命宮",
        "value": "丁亥",
        "note": "主星 巨門；吉星 文曲"
      },
      {
        "id": "ziwei.body_palace",
        "group": "基本",
        "label": "身宮",
        "value": "在福德宮（丑）",
        "note": "主星 天梁；吉星 天魁"
      },
      {
        "id": "ziwei.laiyin_palace",
        "group": "基本",
        "label": "來因宮",
        "value": "在交友宮（庚辰）",
        "note": "生年天干庚，宮干也是庚的那一宮；欽天四化／北派認為生年四化由這一宮發出，三合派一般不論",
        "how": "十二宮的宮干用五虎遁排出，宮干與生年天干相同的那一宮就是來因宮。子、丑兩宮的宮干與寅、卯重複，傳統不作來因宮，所以只在寅到亥十宮裡找。"
      },
      {
        "id": "ziwei.five_class",
        "group": "基本",
        "label": "五行局",
        "value": "土五局",
        "note": ""
      },
      {
        "id": "ziwei.soul_star",
        "group": "基本",
        "label": "命主星",
        "value": "巨門",
        "note": "依命宮地支而定，不是命宮裡的星"
      },
      {
        "id": "ziwei.body_star",
        "group": "基本",
        "label": "身主星",
        "value": "火星",
        "note": "依生年地支而定"
      },
      {
        "id": "ziwei.palace.命宮",
        "group": "宮位",
        "label": "命宮（丁亥）",
        "value": "巨門",
        "note": "主星 巨門；吉星 文曲"
      },
      {
        "id": "ziwei.palace.兄弟宮",
        "group": "宮位",
        "label": "兄弟宮（丙戌）",
        "value": "貪狼",
        "note": "主星 貪狼；煞星 鈴星"
      },
      {
        "id": "ziwei.palace.夫妻宮",
        "group": "宮位",
        "label": "夫妻宮（乙酉）",
        "value": "太陰",
        "note": "主星 太陰(化科)；煞星 擎羊；紅鸞"
      },
      {
        "id": "ziwei.palace.子女宮",
        "group": "宮位",
        "label": "子女宮（甲申）",
        "value": "紫微、天府",
        "note": "主星 紫微、天府；吉星 左輔；煞星 火星；祿存、天馬"
      },
      {
        "id": "ziwei.palace.財帛宮",
        "group": "宮位",
        "label": "財帛宮（癸未）",
        "value": "天機",
        "note": "主星 天機；吉星 天鉞；煞星 陀羅"
      },
      {
        "id": "ziwei.palace.疾厄宮",
        "group": "宮位",
        "label": "疾厄宮（壬午）",
        "value": "破軍",
        "note": "主星 破軍；吉星 右弼；煞星 地劫"
      },
      {
        "id": "ziwei.palace.遷移宮",
        "group": "宮位",
        "label": "遷移宮（辛巳）",
        "value": "太陽",
        "note": "主星 太陽(化祿)"
      },
      {
        "id": "ziwei.palace.交友宮",
        "group": "宮位",
        "label": "交友宮（庚辰）",
        "value": "武曲",
        "note": "主星 武曲(化權)；煞星 地空"
      },
      {
        "id": "ziwei.palace.官祿宮",
        "group": "宮位",
        "label": "官祿宮（己卯）",
        "value": "天同",
        "note": "主星 天同(化忌)；吉星 文昌；天喜"
      },
      {
        "id": "ziwei.palace.田宅宮",
        "group": "宮位",
        "label": "田宅宮（戊寅）",
        "value": "七殺",
        "note": "主星 七殺"
      },
      {
        "id": "ziwei.palace.福德宮",
        "group": "宮位",
        "label": "福德宮（丁丑）",
        "value": "天梁",
        "note": "主星 天梁；吉星 天魁"
      },
      {
        "id": "ziwei.palace.父母宮",
        "group": "宮位",
        "label": "父母宮（丙子）",
        "value": "廉貞、天相",
        "note": "主星 廉貞、天相"
      },
      {
        "id": "ziwei.hua.化祿",
        "group": "四化",
        "label": "生年化祿",
        "value": "太陽（在遷移宮）",
        "note": ""
      },
      {
        "id": "ziwei.hua.化權",
        "group": "四化",
        "label": "生年化權",
        "value": "武曲（在交友宮）",
        "note": ""
      },
      {
        "id": "ziwei.hua.化科",
        "group": "四化",
        "label": "生年化科",
        "value": "太陰（在夫妻宮）",
        "note": ""
      },
      {
        "id": "ziwei.hua.化忌",
        "group": "四化",
        "label": "生年化忌",
        "value": "天同（在官祿宮）",
        "note": ""
      },
      {
        "id": "ziwei.daxian.current",
        "group": "大限",
        "label": "目前大限（37 歲）",
        "value": "子女宮（35–44 歲）",
        "note": "主星 紫微、天府；吉星 左輔；煞星 火星；祿存、天馬"
      },
      {
        "id": "ziwei.liunian.2026",
        "group": "流年",
        "label": "2026 流年命宮",
        "value": "落在本命疾厄宮（午）：破軍",
        "note": "流年四化（丙干）：天同化祿、天機化權、文昌化科、廉貞化忌・今年"
      },
      {
        "id": "ziwei.liunian.2027",
        "group": "流年",
        "label": "2027 流年命宮",
        "value": "落在本命財帛宮（未）：天機",
        "note": "流年四化（丁干）：太陰化祿、天同化權、天機化科、巨門化忌"
      },
      {
        "id": "ziwei.liunian.2028",
        "group": "流年",
        "label": "2028 流年命宮",
        "value": "落在本命子女宮（申）：紫微、天府",
        "note": "流年四化（戊干）：貪狼化祿、太陰化權、右弼化科、天機化忌"
      }
    ],
    "payload": {
      "palaces": [
        {
          "name": "父母宮",
          "branch": "子",
          "stem": "丙",
          "gz": "丙子",
          "major": [
            "廉貞",
            "天相"
          ],
          "lucky": [],
          "unlucky": [],
          "other": [],
          "hua": {},
          "is_body": false,
          "is_laiyin": false,
          "daxian": [
            115,
            124
          ],
          "is_empty": false
        },
        {
          "name": "福德宮",
          "branch": "丑",
          "stem": "丁",
          "gz": "丁丑",
          "major": [
            "天梁"
          ],
          "lucky": [
            "天魁"
          ],
          "unlucky": [],
          "other": [],
          "hua": {},
          "is_body": true,
          "is_laiyin": false,
          "daxian": [
            105,
            114
          ],
          "is_empty": false
        },
        {
          "name": "田宅宮",
          "branch": "寅",
          "stem": "戊",
          "gz": "戊寅",
          "major": [
            "七殺"
          ],
          "lucky": [],
          "unlucky": [],
          "other": [],
          "hua": {},
          "is_body": false,
          "is_laiyin": false,
          "daxian": [
            95,
            104
          ],
          "is_empty": false
        },
        {
          "name": "官祿宮",
          "branch": "卯",
          "stem": "己",
          "gz": "己卯",
          "major": [
            "天同"
          ],
          "lucky": [
            "文昌"
          ],
          "unlucky": [],
          "other": [
            "天喜"
          ],
          "hua": {
            "天同": "化忌"
          },
          "is_body": false,
          "is_laiyin": false,
          "daxian": [
            85,
            94
          ],
          "is_empty": false
        },
        {
          "name": "交友宮",
          "branch": "辰",
          "stem": "庚",
          "gz": "庚辰",
          "major": [
            "武曲"
          ],
          "lucky": [],
          "unlucky": [
            "地空"
          ],
          "other": [],
          "hua": {
            "武曲": "化權"
          },
          "is_body": false,
          "is_laiyin": true,
          "daxian": [
            75,
            84
          ],
          "is_empty": false
        },
        {
          "name": "遷移宮",
          "branch": "巳",
          "stem": "辛",
          "gz": "辛巳",
          "major": [
            "太陽"
          ],
          "lucky": [],
          "unlucky": [],
          "other": [],
          "hua": {
            "太陽": "化祿"
          },
          "is_body": false,
          "is_laiyin": false,
          "daxian": [
            65,
            74
          ],
          "is_empty": false
        },
        {
          "name": "疾厄宮",
          "branch": "午",
          "stem": "壬",
          "gz": "壬午",
          "major": [
            "破軍"
          ],
          "lucky": [
            "右弼"
          ],
          "unlucky": [
            "地劫"
          ],
          "other": [],
          "hua": {},
          "is_body": false,
          "is_laiyin": false,
          "daxian": [
            55,
            64
          ],
          "is_empty": false
        },
        {
          "name": "財帛宮",
          "branch": "未",
          "stem": "癸",
          "gz": "癸未",
          "major": [
            "天機"
          ],
          "lucky": [
            "天鉞"
          ],
          "unlucky": [
            "陀羅"
          ],
          "other": [],
          "hua": {},
          "is_body": false,
          "is_laiyin": false,
          "daxian": [
            45,
            54
          ],
          "is_empty": false
        },
        {
          "name": "子女宮",
          "branch": "申",
          "stem": "甲",
          "gz": "甲申",
          "major": [
            "紫微",
            "天府"
          ],
          "lucky": [
            "左輔"
          ],
          "unlucky": [
            "火星"
          ],
          "other": [
            "祿存",
            "天馬"
          ],
          "hua": {},
          "is_body": false,
          "is_laiyin": false,
          "daxian": [
            35,
            44
          ],
          "is_empty": false
        },
        {
          "name": "夫妻宮",
          "branch": "酉",
          "stem": "乙",
          "gz": "乙酉",
          "major": [
            "太陰"
          ],
          "lucky": [],
          "unlucky": [
            "擎羊"
          ],
          "other": [
            "紅鸞"
          ],
          "hua": {
            "太陰": "化科"
          },
          "is_body": false,
          "is_laiyin": false,
          "daxian": [
            25,
            34
          ],
          "is_empty": false
        },
        {
          "name": "兄弟宮",
          "branch": "戌",
          "stem": "丙",
          "gz": "丙戌",
          "major": [
            "貪狼"
          ],
          "lucky": [],
          "unlucky": [
            "鈴星"
          ],
          "other": [],
          "hua": {},
          "is_body": false,
          "is_laiyin": false,
          "daxian": [
            15,
            24
          ],
          "is_empty": false
        },
        {
          "name": "命宮",
          "branch": "亥",
          "stem": "丁",
          "gz": "丁亥",
          "major": [
            "巨門"
          ],
          "lucky": [
            "文曲"
          ],
          "unlucky": [],
          "other": [],
          "hua": {},
          "is_body": false,
          "is_laiyin": false,
          "daxian": [
            5,
            14
          ],
          "is_empty": false
        }
      ],
      "life_branch": "亥",
      "body_branch": "丑",
      "laiyin_branch": "辰",
      "five_class": "土五局",
      "soul_star": "巨門",
      "body_star": "火星",
      "lunar": {
        "year": 1990,
        "month": 5,
        "day": 23,
        "is_leap": false,
        "raw_month": 5,
        "note": "",
        "year_gz": "庚午"
      },
      "hour_branch": "未",
      "age": 37
    },
    "warnings": [
      "大限逆行，5 歲起第一大限"
    ],
    "missing": []
  },
  "bazi_b": {
    "system": "bazi",
    "system_zh": "八字",
    "subject": "小明・1988-11-03 08:10・台中",
    "birth": {
      "name": "小明",
      "birth_date": "1988-11-03",
      "birth_time": "08:10:00",
      "gender": "male",
      "place": "台中",
      "longitude": 120.7,
      "tz_offset_hours": 8.0,
      "use_true_solar_time": true
    },
    "cast_at": "2026-10-08T10:00:00",
    "facts": [
      {
        "id": "bazi.pillar.year",
        "group": "四柱",
        "label": "年柱",
        "value": "戊辰",
        "note": "土土・龍・藏干 戊、乙、癸"
      },
      {
        "id": "bazi.god.year_stem",
        "group": "十神",
        "label": "年柱天干 戊",
        "value": "七殺",
        "note": ""
      },
      {
        "id": "bazi.god.year_branch",
        "group": "十神",
        "label": "年柱地支 辰 藏干",
        "value": "戊七殺、乙傷官、癸劫財",
        "note": ""
      },
      {
        "id": "bazi.pillar.month",
        "group": "四柱",
        "label": "月柱",
        "value": "壬戌",
        "note": "水土・狗・藏干 戊、辛、丁"
      },
      {
        "id": "bazi.god.month_stem",
        "group": "十神",
        "label": "月柱天干 壬",
        "value": "比肩",
        "note": ""
      },
      {
        "id": "bazi.god.month_branch",
        "group": "十神",
        "label": "月柱地支 戌 藏干",
        "value": "戊七殺、辛正印、丁正財",
        "note": ""
      },
      {
        "id": "bazi.pillar.day",
        "group": "四柱",
        "label": "日柱",
        "value": "壬戌",
        "note": "水土・狗・藏干 戊、辛、丁"
      },
      {
        "id": "bazi.god.day_branch",
        "group": "十神",
        "label": "日柱地支 戌 藏干",
        "value": "戊七殺、辛正印、丁正財",
        "note": ""
      },
      {
        "id": "bazi.pillar.hour",
        "group": "四柱",
        "label": "時柱",
        "value": "甲辰",
        "note": "木土・龍・藏干 戊、乙、癸"
      },
      {
        "id": "bazi.god.hour_stem",
        "group": "十神",
        "label": "時柱天干 甲",
        "value": "食神",
        "note": ""
      },
      {
        "id": "bazi.god.hour_branch",
        "group": "十神",
        "label": "時柱地支 辰 藏干",
        "value": "戊七殺、乙傷官、癸劫財",
        "note": ""
      },
      {
        "id": "bazi.day_master",
        "group": "日主",
        "label": "日主",
        "value": "壬水",
        "note": "陽水"
      },
      {
        "id": "bazi.gods.present",
        "group": "十神",
        "label": "命中出現的十神",
        "value": "七殺、傷官、劫財、正印、正財、比肩、食神",
        "note": ""
      },
      {
        "id": "bazi.gods.absent",
        "group": "十神",
        "label": "命中未出現的十神",
        "value": "偏財、正官、偏印",
        "note": ""
      },
      {
        "id": "bazi.strength",
        "group": "旺衰",
        "label": "日主旺衰",
        "value": "身弱（宜生扶）",
        "note": "日主水於戌月失令（-2）；年柱天干戊（土）耗洩日主（-1）；年柱地支辰藏癸，日主通根（+1）；月柱天干壬（水）生扶日主（+1）；時柱天干甲（木）耗洩日主（-1）；時柱地支辰藏癸，日主通根（+1）。簡化版旺衰估算，流派間差異大，僅供課程示範"
      },
      {
        "id": "bazi.favourable",
        "group": "旺衰",
        "label": "喜用五行",
        "value": "金、水",
        "note": ""
      },
      {
        "id": "bazi.dayun.1",
        "group": "大運",
        "label": "第1大運",
        "value": "癸亥（1–11 歲，約 1989 年起）",
        "note": "天干劫財、地支本氣比肩"
      },
      {
        "id": "bazi.dayun.2",
        "group": "大運",
        "label": "第2大運",
        "value": "甲子（11–21 歲，約 1999 年起）",
        "note": "天干食神、地支本氣劫財"
      },
      {
        "id": "bazi.dayun.3",
        "group": "大運",
        "label": "第3大運",
        "value": "乙丑（21–31 歲，約 2009 年起）",
        "note": "天干傷官、地支本氣正官"
      },
      {
        "id": "bazi.dayun.4",
        "group": "大運",
        "label": "第4大運",
        "value": "丙寅（31–41 歲，約 2019 年起）",
        "note": "天干偏財、地支本氣食神・目前所在"
      },
      {
        "id": "bazi.dayun.current",
        "group": "大運",
        "label": "目前大運",
        "value": "丙寅",
        "note": "偏財/食神"
      },
      {
        "id": "bazi.dayun.5",
        "group": "大運",
        "label": "第5大運",
        "value": "丁卯（41–51 歲，約 2029 年起）",
        "note": "天干正財、地支本氣傷官"
      },
      {
        "id": "bazi.dayun.6",
        "group": "大運",
        "label": "第6大運",
        "value": "戊辰（51–61 歲，約 2039 年起）",
        "note": "天干七殺、地支本氣七殺"
      },
      {
        "id": "bazi.dayun.7",
        "group": "大運",
        "label": "第7大運",
        "value": "己巳（61–71 歲，約 2049 年起）",
        "note": "天干正官、地支本氣偏財"
      },
      {
        "id": "bazi.dayun.8",
        "group": "大運",
        "label": "第8大運",
        "value": "庚午（71–81 歲，約 2059 年起）",
        "note": "天干偏印、地支本氣正財"
      },
      {
        "id": "bazi.liunian.2026",
        "group": "流年",
        "label": "2026 流年",
        "value": "丙午・偏財/正財",
        "note": "流年五行 火火，對喜用 金、水 而言：非喜用・今年"
      },
      {
        "id": "bazi.liunian.2027",
        "group": "流年",
        "label": "2027 流年",
        "value": "丁未・正財/正官",
        "note": "流年五行 火土，對喜用 金、水 而言：非喜用"
      },
      {
        "id": "bazi.liunian.2028",
        "group": "流年",
        "label": "2028 流年",
        "value": "戊申・七殺/偏印",
        "note": "流年五行 土金，對喜用 金、水 而言：部分喜用"
      },
      {
        "id": "bazi.liunian.current",
        "group": "流年",
        "label": "今年流年",
        "value": "丙午",
        "note": ""
      },
      {
        "id": "bazi.relations",
        "group": "刑沖合會",
        "label": "盤內合沖",
        "value": "年柱辰與月柱戌相沖、年柱辰與日柱戌相沖、月柱戌與時柱辰相沖、日柱戌與時柱辰相沖",
        "note": ""
      }
    ],
    "payload": {
      "pillars": [
        {
          "name": "年柱",
          "stem": "戊",
          "branch": "辰",
          "gz": "戊辰",
          "stem_elem": "土",
          "branch_elem": "土",
          "zodiac": "龍",
          "hidden_stems": [
            "戊",
            "乙",
            "癸"
          ],
          "stem_god": "七殺",
          "hidden_gods": [
            "七殺",
            "傷官",
            "劫財"
          ]
        },
        {
          "name": "月柱",
          "stem": "壬",
          "branch": "戌",
          "gz": "壬戌",
          "stem_elem": "水",
          "branch_elem": "土",
          "zodiac": "狗",
          "hidden_stems": [
            "戊",
            "辛",
            "丁"
          ],
          "stem_god": "比肩",
          "hidden_gods": [
            "七殺",
            "正印",
            "正財"
          ]
        },
        {
          "name": "日柱",
          "stem": "壬",
          "branch": "戌",
          "gz": "壬戌",
          "stem_elem": "水",
          "branch_elem": "土",
          "zodiac": "狗",
          "hidden_stems": [
            "戊",
            "辛",
            "丁"
          ],
          "stem_god": "日主",
          "hidden_gods": [
            "七殺",
            "正印",
            "正財"
          ]
        },
        {
          "name": "時柱",
          "stem": "甲",
          "branch": "辰",
          "gz": "甲辰",
          "stem_elem": "木",
          "branch_elem": "土",
          "zodiac": "龍",
          "hidden_stems": [
            "戊",
            "乙",
            "癸"
          ],
          "stem_god": "食神",
          "hidden_gods": [
            "七殺",
            "傷官",
            "劫財"
          ]
        }
      ],
      "day_master": "壬",
      "strength": {
        "score": -1,
        "label": "身弱（宜生扶）",
        "favourable": [
          "金",
          "水"
        ],
        "notes": [
          "日主水於戌月失令（-2）",
          "年柱天干戊（土）耗洩日主（-1）",
          "年柱地支辰藏癸，日主通根（+1）",
          "月柱天干壬（水）生扶日主（+1）",
          "時柱天干甲（木）耗洩日主（-1）",
          "時柱地支辰藏癸，日主通根（+1）"
        ],
        "disclaimer": "簡化版旺衰估算，流派間差異大，僅供課程示範"
      },
      "dayun": [
        {
          "index": 1,
          "gz": "癸亥",
          "stem": "癸",
          "branch": "亥",
          "start_age": 1.4,
          "end_age": 11.4,
          "start_year": 1989,
          "stem_god": "劫財",
          "branch_god": "比肩"
        },
        {
          "index": 2,
          "gz": "甲子",
          "stem": "甲",
          "branch": "子",
          "start_age": 11.4,
          "end_age": 21.4,
          "start_year": 1999,
          "stem_god": "食神",
          "branch_god": "劫財"
        },
        {
          "index": 3,
          "gz": "乙丑",
          "stem": "乙",
          "branch": "丑",
          "start_age": 21.4,
          "end_age": 31.4,
          "start_year": 2009,
          "stem_god": "傷官",
          "branch_god": "正官"
        },
        {
          "index": 4,
          "gz": "丙寅",
          "stem": "丙",
          "branch": "寅",
          "start_age": 31.4,
          "end_age": 41.4,
          "start_year": 2019,
          "stem_god": "偏財",
          "branch_god": "食神"
        },
        {
          "index": 5,
          "gz": "丁卯",
          "stem": "丁",
          "branch": "卯",
          "start_age": 41.4,
          "end_age": 51.4,
          "start_year": 2029,
          "stem_god": "正財",
          "branch_god": "傷官"
        },
        {
          "index": 6,
          "gz": "戊辰",
          "stem": "戊",
          "branch": "辰",
          "start_age": 51.4,
          "end_age": 61.4,
          "start_year": 2039,
          "stem_god": "七殺",
          "branch_god": "七殺"
        },
        {
          "index": 7,
          "gz": "己巳",
          "stem": "己",
          "branch": "巳",
          "start_age": 61.4,
          "end_age": 71.4,
          "start_year": 2049,
          "stem_god": "正官",
          "branch_god": "偏財"
        },
        {
          "index": 8,
          "gz": "庚午",
          "stem": "庚",
          "branch": "午",
          "start_age": 71.4,
          "end_age": 81.4,
          "start_year": 2059,
          "stem_god": "偏印",
          "branch_god": "正財"
        }
      ],
      "age": 39,
      "true_solar_time": "08:29",
      "solar_correction_min": 19.1,
      "month_term": "寒露"
    },
    "warnings": [
      "大運順行，1.4 歲起運"
    ],
    "missing": []
  },
  "ziwei_candidates": [
    {
      "hour_branch": "子",
      "clock": "23:00–01:00",
      "life_branch": "午",
      "life_major": [
        "破軍"
      ],
      "five_class": "木三局"
    },
    {
      "hour_branch": "丑",
      "clock": "01:00–03:00",
      "life_branch": "巳",
      "life_major": [
        "天機"
      ],
      "five_class": "金四局"
    },
    {
      "hour_branch": "寅",
      "clock": "03:00–05:00",
      "life_branch": "辰",
      "life_major": [
        "七殺"
      ],
      "five_class": "金四局"
    },
    {
      "hour_branch": "卯",
      "clock": "05:00–07:00",
      "life_branch": "卯",
      "life_major": [
        "天同"
      ],
      "five_class": "土五局"
    },
    {
      "hour_branch": "辰",
      "clock": "07:00–09:00",
      "life_branch": "寅",
      "life_major": [
        "七殺"
      ],
      "five_class": "土五局"
    },
    {
      "hour_branch": "巳",
      "clock": "09:00–11:00",
      "life_branch": "丑",
      "life_major": [
        "空宮（借對宮）"
      ],
      "five_class": "水二局"
    },
    {
      "hour_branch": "午",
      "clock": "11:00–13:00",
      "life_branch": "子",
      "life_major": [
        "紫微"
      ],
      "five_class": "水二局"
    },
    {
      "hour_branch": "未",
      "clock": "13:00–15:00",
      "life_branch": "亥",
      "life_major": [
        "巨門"
      ],
      "five_class": "土五局"
    },
    {
      "hour_branch": "申",
      "clock": "15:00–17:00",
      "life_branch": "戌",
      "life_major": [
        "貪狼"
      ],
      "five_class": "土五局"
    },
    {
      "hour_branch": "酉",
      "clock": "17:00–19:00",
      "life_branch": "酉",
      "life_major": [
        "太陽",
        "天梁"
      ],
      "five_class": "水二局"
    },
    {
      "hour_branch": "戌",
      "clock": "19:00–21:00",
      "life_branch": "申",
      "life_major": [
        "武曲",
        "天相"
      ],
      "five_class": "水二局"
    },
    {
      "hour_branch": "亥",
      "clock": "21:00–23:00",
      "life_branch": "未",
      "life_major": [
        "天機"
      ],
      "five_class": "木三局"
    }
  ],
  "reading_bazi": {
    "system": "bazi",
    "subject": "小美・1990-06-15 14:30・台北",
    "persona": "玄機",
    "sections": [
      {
        "key": "overview",
        "title": "總論",
        "direction": "平",
        "text": "你的日主是辛金，生在午月，火旺之時金氣偏弱，屬於身弱格局，宜得土金生扶。年干庚金作劫財來幫身，是這張盤裡少數的助力；月干壬水傷官、時干乙木偏財都在洩耗日主，整體格局是「才華外放、根基需補」。",
        "evidence": [
          "bazi.day_master",
          "bazi.strength",
          "bazi.favourable"
        ],
        "cards": [
          "wangshuai.shenruo"
        ]
      },
      {
        "key": "personality",
        "title": "性格",
        "direction": "吉",
        "text": "月干傷官透出，表達力強、點子多，不喜歡被框住；地支雙午藏七殺與偏印，骨子裡有股韌性，壓力越大越能撐。命中沒有正官正印，比較不走循規蹈矩的路線，自己定規則比遵守規則自在。",
        "evidence": [
          "bazi.god.month_stem",
          "bazi.god.year_branch",
          "bazi.gods.absent"
        ],
        "cards": [
          "shishen.shangguan",
          "shishen.qisha"
        ]
      },
      {
        "key": "career",
        "title": "事業",
        "direction": "吉",
        "text": "目前走戊寅大運（33–43 歲），戊土正印正是喜用，貴人與學習機會在這十年明顯增加，適合深耕專業、考取資格或進入有制度的環境補足根基。寅中正財落底，努力會有實質回報。",
        "evidence": [
          "bazi.dayun.current",
          "bazi.dayun.4",
          "bazi.favourable"
        ],
        "cards": [
          "shishen.zhengyin"
        ]
      },
      {
        "key": "love",
        "title": "感情",
        "direction": "平",
        "text": "日支亥水藏傷官與正財，配偶宮裡的傷官讓你在感情中重視自由與對話，不喜歡被管；年柱午與時柱未六合、庚乙合金，說明家人與晚輩的關係和諧，也能把人際緣分轉成助力。",
        "evidence": [
          "bazi.god.day_branch",
          "bazi.relations"
        ],
        "cards": [
          "shishen.shangguan"
        ]
      },
      {
        "key": "wealth",
        "title": "財運",
        "direction": "平",
        "text": "時柱乙木偏財透干，財來得活、也去得快，適合用技能換取多元收入。身弱而財多，重點不在賺多少，而在守得住；喜用土金，也就是把錢放進有制度、能累積的地方比追求高報酬更合適。",
        "evidence": [
          "bazi.god.hour_stem",
          "bazi.strength",
          "bazi.favourable"
        ],
        "cards": [
          "shishen.piancai"
        ]
      },
      {
        "key": "year",
        "title": "流年",
        "direction": "凶",
        "text": "2026 丙午年，丙火正官、午火七殺，官殺同來而火為非喜用，今年壓力與責任感明顯加重，容易在工作上被要求承擔更多。好在大運戊土正印可以化殺生身，把壓力轉成成長；留意情緒與作息，避免硬撐。",
        "evidence": [
          "bazi.liunian.2026",
          "bazi.liunian.current",
          "bazi.dayun.current"
        ],
        "cards": [
          "shishen.qisha"
        ]
      }
    ],
    "disclaimer": "本解讀以命盤事實為依據、由程式先判定方向再由命理師措辭，每句都可回溯到命盤；僅供參考，不構成醫療、投資、法律建議。",
    "checks": {
      "passed": false,
      "chart_check": {
        "ok": true,
        "issues": []
      },
      "citation_check": {
        "ok": true,
        "issues": []
      },
      "boundary_check": {
        "ok": false,
        "issues": [
          {
            "section": "wealth",
            "sentence": "把錢放進有制度、能累積的地方比追求高報酬更合適",
            "rule": "投資（接近建議，需改寫為原則性描述）"
          }
        ]
      },
      "consistency_check": {
        "ok": true,
        "issues": []
      },
      "summary": "3/4 通過"
    },
    "cost_usd": 0.0,
    "backend": "mock"
  },
  "reading_ziwei": {
    "system": "ziwei",
    "subject": "小美・1990-06-15 14:30・台北",
    "persona": "玄機",
    "sections": [
      {
        "key": "overview",
        "title": "總論",
        "direction": "平",
        "text": "命宮在亥，坐巨門，土五局。巨門主口才與思辨，命宮單星，格局清楚：靠說、靠分析、靠拆解問題立身。身宮落福德宮，天梁坐守，晚年與內心世界越來越重要。",
        "evidence": [
          "ziwei.life_palace",
          "ziwei.palace.命宮",
          "ziwei.body_palace",
          "ziwei.five_class"
        ],
        "cards": [
          "star.jumen",
          "gong.ming"
        ]
      },
      {
        "key": "personality",
        "title": "性格",
        "direction": "平",
        "text": "巨門守命的人心思細、話直，善於看出問題所在，但也容易被誤解為挑剔。福德宮天梁加天魁，內在其實有長者般的穩定與照顧他人的傾向。",
        "evidence": [
          "ziwei.palace.命宮",
          "ziwei.palace.福德宮"
        ],
        "cards": [
          "star.jumen"
        ]
      },
      {
        "key": "career",
        "title": "事業",
        "direction": "凶",
        "text": "官祿宮天同化忌，工作上容易安逸與不安並存，想穩定又怕被困住；化忌落官祿，提醒你職涯要主動選擇，而不是等安排。目前大限走子女宮（35–44 歲），紫微天府同宮，這十年反而是建立根基的好時機。",
        "evidence": [
          "ziwei.palace.官祿宮",
          "ziwei.hua.化忌",
          "ziwei.daxian.current"
        ],
        "cards": [
          "hua.ji"
        ]
      },
      {
        "key": "love",
        "title": "感情",
        "direction": "吉",
        "text": "夫妻宮太陰化科，感情裡重視溫柔與名聲，伴侶形象斯文、有涵養；化科帶來好緣與好口碑，感情多半從互相欣賞開始。",
        "evidence": [
          "ziwei.palace.夫妻宮",
          "ziwei.hua.化科"
        ],
        "cards": []
      },
      {
        "key": "wealth",
        "title": "財運",
        "direction": "平",
        "text": "財帛宮天機，財來自頭腦與變動，不宜守一份死薪水；遷移宮太陽化祿，出外、對外的機會才是財源，交友宮武曲化權也顯示朋友圈裡有能幹的人可以合作。",
        "evidence": [
          "ziwei.palace.財帛宮",
          "ziwei.hua.化祿",
          "ziwei.hua.化權"
        ],
        "cards": []
      },
      {
        "key": "year",
        "title": "流年",
        "direction": "凶",
        "text": "2026 流年命宮落在本命疾厄宮（午），破軍坐守，今年變動與耗損的感受強，身體與生活節奏要特別照顧；破軍主破舊立新，順勢整理而非硬撐，是今年的功課。",
        "evidence": [
          "ziwei.liunian.2026",
          "ziwei.palace.疾厄宮"
        ],
        "cards": []
      }
    ],
    "disclaimer": "本解讀以命盤事實為依據、由程式先判定方向再由命理師措辭，每句都可回溯到命盤；僅供參考，不構成醫療、投資、法律建議。",
    "checks": {
      "passed": true,
      "chart_check": {
        "ok": true,
        "issues": []
      },
      "citation_check": {
        "ok": true,
        "issues": []
      },
      "boundary_check": {
        "ok": true,
        "issues": []
      },
      "consistency_check": {
        "ok": true,
        "issues": []
      },
      "summary": "4/4 通過"
    },
    "cost_usd": 0.0,
    "backend": "mock"
  },
  "synastry": {
    "a": {
      "system": "bazi",
      "system_zh": "八字",
      "subject": "小美・1990-06-15 14:30・台北",
      "birth": {
        "name": "小美",
        "birth_date": "1990-06-15",
        "birth_time": "14:30:00",
        "gender": "female",
        "place": "台北",
        "longitude": 121.5,
        "tz_offset_hours": 8.0,
        "use_true_solar_time": true
      },
      "cast_at": "2026-10-08T10:00:00",
      "facts": [
        {
          "id": "bazi.pillar.year",
          "group": "四柱",
          "label": "年柱",
          "value": "庚午",
          "note": "金火・馬・藏干 丁、己"
        },
        {
          "id": "bazi.god.year_stem",
          "group": "十神",
          "label": "年柱天干 庚",
          "value": "劫財",
          "note": ""
        },
        {
          "id": "bazi.god.year_branch",
          "group": "十神",
          "label": "年柱地支 午 藏干",
          "value": "丁七殺、己偏印",
          "note": ""
        },
        {
          "id": "bazi.pillar.month",
          "group": "四柱",
          "label": "月柱",
          "value": "壬午",
          "note": "水火・馬・藏干 丁、己"
        },
        {
          "id": "bazi.god.month_stem",
          "group": "十神",
          "label": "月柱天干 壬",
          "value": "傷官",
          "note": ""
        },
        {
          "id": "bazi.god.month_branch",
          "group": "十神",
          "label": "月柱地支 午 藏干",
          "value": "丁七殺、己偏印",
          "note": ""
        },
        {
          "id": "bazi.pillar.day",
          "group": "四柱",
          "label": "日柱",
          "value": "辛亥",
          "note": "金水・豬・藏干 壬、甲"
        },
        {
          "id": "bazi.god.day_branch",
          "group": "十神",
          "label": "日柱地支 亥 藏干",
          "value": "壬傷官、甲正財",
          "note": ""
        },
        {
          "id": "bazi.pillar.hour",
          "group": "四柱",
          "label": "時柱",
          "value": "乙未",
          "note": "木土・羊・藏干 己、丁、乙"
        },
        {
          "id": "bazi.god.hour_stem",
          "group": "十神",
          "label": "時柱天干 乙",
          "value": "偏財",
          "note": ""
        },
        {
          "id": "bazi.god.hour_branch",
          "group": "十神",
          "label": "時柱地支 未 藏干",
          "value": "己偏印、丁七殺、乙偏財",
          "note": ""
        },
        {
          "id": "bazi.day_master",
          "group": "日主",
          "label": "日主",
          "value": "辛金",
          "note": "陰金"
        },
        {
          "id": "bazi.gods.present",
          "group": "十神",
          "label": "命中出現的十神",
          "value": "七殺、偏印、偏財、傷官、劫財、正財",
          "note": ""
        },
        {
          "id": "bazi.gods.absent",
          "group": "十神",
          "label": "命中未出現的十神",
          "value": "比肩、食神、正官、正印",
          "note": ""
        },
        {
          "id": "bazi.strength",
          "group": "旺衰",
          "label": "日主旺衰",
          "value": "身弱（宜生扶）",
          "note": "日主金於午月失令（-2）；年柱天干庚（金）生扶日主（+1）；月柱天干壬（水）耗洩日主（-1）；時柱天干乙（木）耗洩日主（-1）。簡化版旺衰估算，流派間差異大，僅供課程示範"
        },
        {
          "id": "bazi.favourable",
          "group": "旺衰",
          "label": "喜用五行",
          "value": "土、金",
          "note": ""
        },
        {
          "id": "bazi.dayun.1",
          "group": "大運",
          "label": "第1大運",
          "value": "辛巳（3–13 歲，約 1993 年起）",
          "note": "天干比肩、地支本氣正官"
        },
        {
          "id": "bazi.dayun.2",
          "group": "大運",
          "label": "第2大運",
          "value": "庚辰（13–23 歲，約 2003 年起）",
          "note": "天干劫財、地支本氣正印"
        },
        {
          "id": "bazi.dayun.3",
          "group": "大運",
          "label": "第3大運",
          "value": "己卯（23–33 歲，約 2013 年起）",
          "note": "天干偏印、地支本氣偏財"
        },
        {
          "id": "bazi.dayun.4",
          "group": "大運",
          "label": "第4大運",
          "value": "戊寅（33–43 歲，約 2023 年起）",
          "note": "天干正印、地支本氣正財・目前所在"
        },
        {
          "id": "bazi.dayun.current",
          "group": "大運",
          "label": "目前大運",
          "value": "戊寅",
          "note": "正印/正財"
        },
        {
          "id": "bazi.dayun.5",
          "group": "大運",
          "label": "第5大運",
          "value": "丁丑（43–53 歲，約 2033 年起）",
          "note": "天干七殺、地支本氣偏印"
        },
        {
          "id": "bazi.dayun.6",
          "group": "大運",
          "label": "第6大運",
          "value": "丙子（53–63 歲，約 2043 年起）",
          "note": "天干正官、地支本氣食神"
        },
        {
          "id": "bazi.dayun.7",
          "group": "大運",
          "label": "第7大運",
          "value": "乙亥（63–73 歲，約 2053 年起）",
          "note": "天干偏財、地支本氣傷官"
        },
        {
          "id": "bazi.dayun.8",
          "group": "大運",
          "label": "第8大運",
          "value": "甲戌（73–83 歲，約 2063 年起）",
          "note": "天干正財、地支本氣正印"
        },
        {
          "id": "bazi.liunian.2026",
          "group": "流年",
          "label": "2026 流年",
          "value": "丙午・正官/七殺",
          "note": "流年五行 火火，對喜用 土、金 而言：非喜用・今年"
        },
        {
          "id": "bazi.liunian.2027",
          "group": "流年",
          "label": "2027 流年",
          "value": "丁未・七殺/偏印",
          "note": "流年五行 火土，對喜用 土、金 而言：部分喜用"
        },
        {
          "id": "bazi.liunian.2028",
          "group": "流年",
          "label": "2028 流年",
          "value": "戊申・正印/劫財",
          "note": "流年五行 土金，對喜用 土、金 而言：喜用到位"
        },
        {
          "id": "bazi.liunian.current",
          "group": "流年",
          "label": "今年流年",
          "value": "丙午",
          "note": ""
        },
        {
          "id": "bazi.relations",
          "group": "刑沖合會",
          "label": "盤內合沖",
          "value": "年柱庚與時柱乙天干五合（合金）、年柱午與時柱未六合、月柱午與時柱未六合",
          "note": ""
        }
      ],
      "payload": {
        "pillars": [
          {
            "name": "年柱",
            "stem": "庚",
            "branch": "午",
            "gz": "庚午",
            "stem_elem": "金",
            "branch_elem": "火",
            "zodiac": "馬",
            "hidden_stems": [
              "丁",
              "己"
            ],
            "stem_god": "劫財",
            "hidden_gods": [
              "七殺",
              "偏印"
            ]
          },
          {
            "name": "月柱",
            "stem": "壬",
            "branch": "午",
            "gz": "壬午",
            "stem_elem": "水",
            "branch_elem": "火",
            "zodiac": "馬",
            "hidden_stems": [
              "丁",
              "己"
            ],
            "stem_god": "傷官",
            "hidden_gods": [
              "七殺",
              "偏印"
            ]
          },
          {
            "name": "日柱",
            "stem": "辛",
            "branch": "亥",
            "gz": "辛亥",
            "stem_elem": "金",
            "branch_elem": "水",
            "zodiac": "豬",
            "hidden_stems": [
              "壬",
              "甲"
            ],
            "stem_god": "日主",
            "hidden_gods": [
              "傷官",
              "正財"
            ]
          },
          {
            "name": "時柱",
            "stem": "乙",
            "branch": "未",
            "gz": "乙未",
            "stem_elem": "木",
            "branch_elem": "土",
            "zodiac": "羊",
            "hidden_stems": [
              "己",
              "丁",
              "乙"
            ],
            "stem_god": "偏財",
            "hidden_gods": [
              "偏印",
              "七殺",
              "偏財"
            ]
          }
        ],
        "day_master": "辛",
        "strength": {
          "score": -3,
          "label": "身弱（宜生扶）",
          "favourable": [
            "土",
            "金"
          ],
          "notes": [
            "日主金於午月失令（-2）",
            "年柱天干庚（金）生扶日主（+1）",
            "月柱天干壬（水）耗洩日主（-1）",
            "時柱天干乙（木）耗洩日主（-1）"
          ],
          "disclaimer": "簡化版旺衰估算，流派間差異大，僅供課程示範"
        },
        "dayun": [
          {
            "index": 1,
            "gz": "辛巳",
            "stem": "辛",
            "branch": "巳",
            "start_age": 3.1,
            "end_age": 13.1,
            "start_year": 1993,
            "stem_god": "比肩",
            "branch_god": "正官"
          },
          {
            "index": 2,
            "gz": "庚辰",
            "stem": "庚",
            "branch": "辰",
            "start_age": 13.1,
            "end_age": 23.1,
            "start_year": 2003,
            "stem_god": "劫財",
            "branch_god": "正印"
          },
          {
            "index": 3,
            "gz": "己卯",
            "stem": "己",
            "branch": "卯",
            "start_age": 23.1,
            "end_age": 33.1,
            "start_year": 2013,
            "stem_god": "偏印",
            "branch_god": "偏財"
          },
          {
            "index": 4,
            "gz": "戊寅",
            "stem": "戊",
            "branch": "寅",
            "start_age": 33.1,
            "end_age": 43.1,
            "start_year": 2023,
            "stem_god": "正印",
            "branch_god": "正財"
          },
          {
            "index": 5,
            "gz": "丁丑",
            "stem": "丁",
            "branch": "丑",
            "start_age": 43.1,
            "end_age": 53.1,
            "start_year": 2033,
            "stem_god": "七殺",
            "branch_god": "偏印"
          },
          {
            "index": 6,
            "gz": "丙子",
            "stem": "丙",
            "branch": "子",
            "start_age": 53.1,
            "end_age": 63.1,
            "start_year": 2043,
            "stem_god": "正官",
            "branch_god": "食神"
          },
          {
            "index": 7,
            "gz": "乙亥",
            "stem": "乙",
            "branch": "亥",
            "start_age": 63.1,
            "end_age": 73.1,
            "start_year": 2053,
            "stem_god": "偏財",
            "branch_god": "傷官"
          },
          {
            "index": 8,
            "gz": "甲戌",
            "stem": "甲",
            "branch": "戌",
            "start_age": 73.1,
            "end_age": 83.1,
            "start_year": 2063,
            "stem_god": "正財",
            "branch_god": "正印"
          }
        ],
        "age": 37,
        "true_solar_time": "14:35",
        "solar_correction_min": 6.0,
        "month_term": "芒種"
      },
      "warnings": [
        "大運逆行，3.1 歲起運"
      ],
      "missing": []
    },
    "b": {
      "system": "bazi",
      "system_zh": "八字",
      "subject": "小明・1988-11-03 08:10・台中",
      "birth": {
        "name": "小明",
        "birth_date": "1988-11-03",
        "birth_time": "08:10:00",
        "gender": "male",
        "place": "台中",
        "longitude": 120.7,
        "tz_offset_hours": 8.0,
        "use_true_solar_time": true
      },
      "cast_at": "2026-10-08T10:00:00",
      "facts": [
        {
          "id": "bazi.pillar.year",
          "group": "四柱",
          "label": "年柱",
          "value": "戊辰",
          "note": "土土・龍・藏干 戊、乙、癸"
        },
        {
          "id": "bazi.god.year_stem",
          "group": "十神",
          "label": "年柱天干 戊",
          "value": "七殺",
          "note": ""
        },
        {
          "id": "bazi.god.year_branch",
          "group": "十神",
          "label": "年柱地支 辰 藏干",
          "value": "戊七殺、乙傷官、癸劫財",
          "note": ""
        },
        {
          "id": "bazi.pillar.month",
          "group": "四柱",
          "label": "月柱",
          "value": "壬戌",
          "note": "水土・狗・藏干 戊、辛、丁"
        },
        {
          "id": "bazi.god.month_stem",
          "group": "十神",
          "label": "月柱天干 壬",
          "value": "比肩",
          "note": ""
        },
        {
          "id": "bazi.god.month_branch",
          "group": "十神",
          "label": "月柱地支 戌 藏干",
          "value": "戊七殺、辛正印、丁正財",
          "note": ""
        },
        {
          "id": "bazi.pillar.day",
          "group": "四柱",
          "label": "日柱",
          "value": "壬戌",
          "note": "水土・狗・藏干 戊、辛、丁"
        },
        {
          "id": "bazi.god.day_branch",
          "group": "十神",
          "label": "日柱地支 戌 藏干",
          "value": "戊七殺、辛正印、丁正財",
          "note": ""
        },
        {
          "id": "bazi.pillar.hour",
          "group": "四柱",
          "label": "時柱",
          "value": "甲辰",
          "note": "木土・龍・藏干 戊、乙、癸"
        },
        {
          "id": "bazi.god.hour_stem",
          "group": "十神",
          "label": "時柱天干 甲",
          "value": "食神",
          "note": ""
        },
        {
          "id": "bazi.god.hour_branch",
          "group": "十神",
          "label": "時柱地支 辰 藏干",
          "value": "戊七殺、乙傷官、癸劫財",
          "note": ""
        },
        {
          "id": "bazi.day_master",
          "group": "日主",
          "label": "日主",
          "value": "壬水",
          "note": "陽水"
        },
        {
          "id": "bazi.gods.present",
          "group": "十神",
          "label": "命中出現的十神",
          "value": "七殺、傷官、劫財、正印、正財、比肩、食神",
          "note": ""
        },
        {
          "id": "bazi.gods.absent",
          "group": "十神",
          "label": "命中未出現的十神",
          "value": "偏財、正官、偏印",
          "note": ""
        },
        {
          "id": "bazi.strength",
          "group": "旺衰",
          "label": "日主旺衰",
          "value": "身弱（宜生扶）",
          "note": "日主水於戌月失令（-2）；年柱天干戊（土）耗洩日主（-1）；年柱地支辰藏癸，日主通根（+1）；月柱天干壬（水）生扶日主（+1）；時柱天干甲（木）耗洩日主（-1）；時柱地支辰藏癸，日主通根（+1）。簡化版旺衰估算，流派間差異大，僅供課程示範"
        },
        {
          "id": "bazi.favourable",
          "group": "旺衰",
          "label": "喜用五行",
          "value": "金、水",
          "note": ""
        },
        {
          "id": "bazi.dayun.1",
          "group": "大運",
          "label": "第1大運",
          "value": "癸亥（1–11 歲，約 1989 年起）",
          "note": "天干劫財、地支本氣比肩"
        },
        {
          "id": "bazi.dayun.2",
          "group": "大運",
          "label": "第2大運",
          "value": "甲子（11–21 歲，約 1999 年起）",
          "note": "天干食神、地支本氣劫財"
        },
        {
          "id": "bazi.dayun.3",
          "group": "大運",
          "label": "第3大運",
          "value": "乙丑（21–31 歲，約 2009 年起）",
          "note": "天干傷官、地支本氣正官"
        },
        {
          "id": "bazi.dayun.4",
          "group": "大運",
          "label": "第4大運",
          "value": "丙寅（31–41 歲，約 2019 年起）",
          "note": "天干偏財、地支本氣食神・目前所在"
        },
        {
          "id": "bazi.dayun.current",
          "group": "大運",
          "label": "目前大運",
          "value": "丙寅",
          "note": "偏財/食神"
        },
        {
          "id": "bazi.dayun.5",
          "group": "大運",
          "label": "第5大運",
          "value": "丁卯（41–51 歲，約 2029 年起）",
          "note": "天干正財、地支本氣傷官"
        },
        {
          "id": "bazi.dayun.6",
          "group": "大運",
          "label": "第6大運",
          "value": "戊辰（51–61 歲，約 2039 年起）",
          "note": "天干七殺、地支本氣七殺"
        },
        {
          "id": "bazi.dayun.7",
          "group": "大運",
          "label": "第7大運",
          "value": "己巳（61–71 歲，約 2049 年起）",
          "note": "天干正官、地支本氣偏財"
        },
        {
          "id": "bazi.dayun.8",
          "group": "大運",
          "label": "第8大運",
          "value": "庚午（71–81 歲，約 2059 年起）",
          "note": "天干偏印、地支本氣正財"
        },
        {
          "id": "bazi.liunian.2026",
          "group": "流年",
          "label": "2026 流年",
          "value": "丙午・偏財/正財",
          "note": "流年五行 火火，對喜用 金、水 而言：非喜用・今年"
        },
        {
          "id": "bazi.liunian.2027",
          "group": "流年",
          "label": "2027 流年",
          "value": "丁未・正財/正官",
          "note": "流年五行 火土，對喜用 金、水 而言：非喜用"
        },
        {
          "id": "bazi.liunian.2028",
          "group": "流年",
          "label": "2028 流年",
          "value": "戊申・七殺/偏印",
          "note": "流年五行 土金，對喜用 金、水 而言：部分喜用"
        },
        {
          "id": "bazi.liunian.current",
          "group": "流年",
          "label": "今年流年",
          "value": "丙午",
          "note": ""
        },
        {
          "id": "bazi.relations",
          "group": "刑沖合會",
          "label": "盤內合沖",
          "value": "年柱辰與月柱戌相沖、年柱辰與日柱戌相沖、月柱戌與時柱辰相沖、日柱戌與時柱辰相沖",
          "note": ""
        }
      ],
      "payload": {
        "pillars": [
          {
            "name": "年柱",
            "stem": "戊",
            "branch": "辰",
            "gz": "戊辰",
            "stem_elem": "土",
            "branch_elem": "土",
            "zodiac": "龍",
            "hidden_stems": [
              "戊",
              "乙",
              "癸"
            ],
            "stem_god": "七殺",
            "hidden_gods": [
              "七殺",
              "傷官",
              "劫財"
            ]
          },
          {
            "name": "月柱",
            "stem": "壬",
            "branch": "戌",
            "gz": "壬戌",
            "stem_elem": "水",
            "branch_elem": "土",
            "zodiac": "狗",
            "hidden_stems": [
              "戊",
              "辛",
              "丁"
            ],
            "stem_god": "比肩",
            "hidden_gods": [
              "七殺",
              "正印",
              "正財"
            ]
          },
          {
            "name": "日柱",
            "stem": "壬",
            "branch": "戌",
            "gz": "壬戌",
            "stem_elem": "水",
            "branch_elem": "土",
            "zodiac": "狗",
            "hidden_stems": [
              "戊",
              "辛",
              "丁"
            ],
            "stem_god": "日主",
            "hidden_gods": [
              "七殺",
              "正印",
              "正財"
            ]
          },
          {
            "name": "時柱",
            "stem": "甲",
            "branch": "辰",
            "gz": "甲辰",
            "stem_elem": "木",
            "branch_elem": "土",
            "zodiac": "龍",
            "hidden_stems": [
              "戊",
              "乙",
              "癸"
            ],
            "stem_god": "食神",
            "hidden_gods": [
              "七殺",
              "傷官",
              "劫財"
            ]
          }
        ],
        "day_master": "壬",
        "strength": {
          "score": -1,
          "label": "身弱（宜生扶）",
          "favourable": [
            "金",
            "水"
          ],
          "notes": [
            "日主水於戌月失令（-2）",
            "年柱天干戊（土）耗洩日主（-1）",
            "年柱地支辰藏癸，日主通根（+1）",
            "月柱天干壬（水）生扶日主（+1）",
            "時柱天干甲（木）耗洩日主（-1）",
            "時柱地支辰藏癸，日主通根（+1）"
          ],
          "disclaimer": "簡化版旺衰估算，流派間差異大，僅供課程示範"
        },
        "dayun": [
          {
            "index": 1,
            "gz": "癸亥",
            "stem": "癸",
            "branch": "亥",
            "start_age": 1.4,
            "end_age": 11.4,
            "start_year": 1989,
            "stem_god": "劫財",
            "branch_god": "比肩"
          },
          {
            "index": 2,
            "gz": "甲子",
            "stem": "甲",
            "branch": "子",
            "start_age": 11.4,
            "end_age": 21.4,
            "start_year": 1999,
            "stem_god": "食神",
            "branch_god": "劫財"
          },
          {
            "index": 3,
            "gz": "乙丑",
            "stem": "乙",
            "branch": "丑",
            "start_age": 21.4,
            "end_age": 31.4,
            "start_year": 2009,
            "stem_god": "傷官",
            "branch_god": "正官"
          },
          {
            "index": 4,
            "gz": "丙寅",
            "stem": "丙",
            "branch": "寅",
            "start_age": 31.4,
            "end_age": 41.4,
            "start_year": 2019,
            "stem_god": "偏財",
            "branch_god": "食神"
          },
          {
            "index": 5,
            "gz": "丁卯",
            "stem": "丁",
            "branch": "卯",
            "start_age": 41.4,
            "end_age": 51.4,
            "start_year": 2029,
            "stem_god": "正財",
            "branch_god": "傷官"
          },
          {
            "index": 6,
            "gz": "戊辰",
            "stem": "戊",
            "branch": "辰",
            "start_age": 51.4,
            "end_age": 61.4,
            "start_year": 2039,
            "stem_god": "七殺",
            "branch_god": "七殺"
          },
          {
            "index": 7,
            "gz": "己巳",
            "stem": "己",
            "branch": "巳",
            "start_age": 61.4,
            "end_age": 71.4,
            "start_year": 2049,
            "stem_god": "正官",
            "branch_god": "偏財"
          },
          {
            "index": 8,
            "gz": "庚午",
            "stem": "庚",
            "branch": "午",
            "start_age": 71.4,
            "end_age": 81.4,
            "start_year": 2059,
            "stem_god": "偏印",
            "branch_god": "正財"
          }
        ],
        "age": 39,
        "true_solar_time": "08:29",
        "solar_correction_min": 19.1,
        "month_term": "寒露"
      },
      "warnings": [
        "大運順行，1.4 歲起運"
      ],
      "missing": []
    },
    "items": [
      {
        "kind": "生",
        "title": "日主相生",
        "text": "小美日主辛金，小明日主壬水，金生水：小美天生會替小明出主意、給資源，小明則把這些化成行動。",
        "evidence": [
          {
            "who": "a",
            "fact_id": "bazi.day_master"
          },
          {
            "who": "b",
            "fact_id": "bazi.day_master"
          }
        ]
      },
      {
        "kind": "合",
        "title": "喜用互補",
        "text": "小明喜用金水，小美日主辛金正是他需要的五行；兩人在一起，小明會覺得被補足。",
        "evidence": [
          {
            "who": "b",
            "fact_id": "bazi.favourable"
          },
          {
            "who": "a",
            "fact_id": "bazi.day_master"
          }
        ]
      },
      {
        "kind": "合",
        "title": "午戌半合火",
        "text": "小美年支午與小明日支戌半合成火局，家庭觀念與相處節奏合得來，容易一拍即合。",
        "evidence": [
          {
            "who": "a",
            "fact_id": "bazi.pillar.year"
          },
          {
            "who": "b",
            "fact_id": "bazi.pillar.day"
          }
        ]
      },
      {
        "kind": "同",
        "title": "兩人皆身弱",
        "text": "兩張盤都屬身弱，都需要被生扶，相處時要留意彼此是否都在等對方給力，而忘了自己也要撐。",
        "evidence": [
          {
            "who": "a",
            "fact_id": "bazi.strength"
          },
          {
            "who": "b",
            "fact_id": "bazi.strength"
          }
        ]
      },
      {
        "kind": "剋",
        "title": "日支相剋",
        "text": "小美日支亥水、小明日支戌土，土剋水：配偶宮相剋，生活習慣與價值觀有磨合期，需要明講。",
        "evidence": [
          {
            "who": "a",
            "fact_id": "bazi.pillar.day"
          },
          {
            "who": "b",
            "fact_id": "bazi.pillar.day"
          }
        ]
      },
      {
        "kind": "沖",
        "title": "小明盤內辰戌相沖",
        "text": "小明命中辰戌多重相沖，情緒起伏與變動性較大，合盤時小美要有心理準備承接這部分。",
        "evidence": [
          {
            "who": "b",
            "fact_id": "bazi.relations"
          }
        ]
      }
    ],
    "score": {
      "harmony": 3,
      "tension": 2,
      "net": 1
    },
    "summary": "金生水為主軸、喜用互補，相生多於相剋；日支相剋與小明盤內的沖需要用溝通化解。",
    "reading": "這組合盤的主調是「補」：小美給、小明收，相處初期會很舒服。中期要面對的是生活習慣的差異（日支土水相剋）與小明本身的情緒起伏（辰戌沖），兩人都身弱，別把彼此當唯一的支柱，各自有自己的根，關係才長久。"
  },
  "persona": {
    "name": "玄機",
    "title": "命理師",
    "greeting": "歡迎。我是玄機，不說玄話，只說命盤裡看得到的事。先把出生資料填好、排好盤，再來問我吧。"
  },
  "cards": {
    "shishen.shangguan": {
      "id": "shishen.shangguan",
      "name": "傷官",
      "type": "十神",
      "system": "bazi",
      "keywords": [
        "傷官"
      ],
      "source": "示範知識庫・課程編寫（綜合《子平真詮》《滴天髓》通論）",
      "body": "## 意義\n日主所生、陰陽不同者為傷官。主才華、表達、創造，也主反叛與不服管束。\n\n## 正面\n- 口才與創意出眾\n- 不受框架限制，適合專業與創作\n\n## 負面\n- 直言傷人、與上司衝突\n- 傷官見官，容易惹是非\n\n## 常見組合\n- 「傷官配印」：才華有節制，大成之格\n- 「傷官生財」：以技藝取財\n\n## 出處\n課程編寫"
    },
    "shishen.qisha": {
      "id": "shishen.qisha",
      "name": "七殺",
      "type": "十神",
      "system": "bazi",
      "keywords": [
        "七殺"
      ],
      "source": "示範知識庫・課程編寫",
      "body": "## 意義\n剋日主且陰陽相同者為七殺，主壓力、魄力、競爭。\n\n## 正面\n- 果決、有行動力\n- 能承受壓力、成就事業\n\n## 負面\n- 攻擊性強、易樹敵\n- 身弱遇殺，壓力過大\n\n## 出處\n課程編寫"
    },
    "shishen.zhengyin": {
      "id": "shishen.zhengyin",
      "name": "正印",
      "type": "十神",
      "system": "bazi",
      "keywords": [
        "正印"
      ],
      "source": "示範知識庫・課程編寫",
      "body": "## 意義\n生日主且陰陽不同者為正印，主學習、貴人、庇蔭。\n\n## 正面\n- 有長輩緣、學習運\n- 能化殺生身\n\n## 負面\n- 依賴、行動力弱\n\n## 出處\n課程編寫"
    },
    "shishen.piancai": {
      "id": "shishen.piancai",
      "name": "偏財",
      "type": "十神",
      "system": "bazi",
      "keywords": [
        "偏財"
      ],
      "source": "示範知識庫・課程編寫",
      "body": "## 意義\n日主所剋且陰陽相同者為偏財，主流動之財、交際、父親。\n\n## 正面\n- 財源活絡、人緣好\n\n## 負面\n- 來去快、難守\n\n## 出處\n課程編寫"
    },
    "wangshuai.shenruo": {
      "id": "wangshuai.shenruo",
      "name": "身弱",
      "type": "旺衰",
      "system": "bazi",
      "keywords": [
        "身弱"
      ],
      "source": "示範知識庫・課程編寫",
      "body": "## 意義\n日主得令、得地、得勢不足，稱為身弱。喜印比生扶，忌官殺財食傷耗洩。\n\n## 提醒\n- 旺衰判法流派差異大，課程版為簡化估算\n\n## 出處\n課程編寫"
    },
    "star.jumen": {
      "id": "star.jumen",
      "name": "巨門",
      "type": "主星",
      "system": "ziwei",
      "keywords": [
        "巨門"
      ],
      "source": "示範知識庫・課程編寫",
      "body": "## 意義\n北斗第二星，化氣為暗，主口舌、是非、也主口才與思辨。\n\n## 正面\n- 分析力強、善於言辭\n\n## 負面\n- 多疑、易生口舌\n\n## 出處\n課程編寫"
    },
    "gong.ming": {
      "id": "gong.ming",
      "name": "命宮",
      "type": "宮位",
      "system": "ziwei",
      "keywords": [
        "命宮"
      ],
      "source": "示範知識庫・課程編寫",
      "body": "## 意義\n十二宮之首，看一生格局、性格與先天條件。命宮無主星時借對宮（遷移宮）看。\n\n## 出處\n課程編寫"
    },
    "hua.ji": {
      "id": "hua.ji",
      "name": "化忌",
      "type": "四化",
      "system": "ziwei",
      "keywords": [
        "化忌"
      ],
      "source": "示範知識庫・課程編寫",
      "body": "## 意義\n四化之一，主阻礙、執著、虧欠。落在哪一宮，哪一宮就是一生的功課。\n\n## 出處\n課程編寫"
    }
  },
  "chat": {
    "session_id": "mock-session-0001",
    "chart_summary": "小美・辛金日主・身弱・現行戊寅大運",
    "replies": {
      "answer": {
        "reply": "以你的盤來看，日主辛金身弱，月干傷官透出，才華是有的，差的是根基。這幾年走戊寅大運，正印到位，正是補根基的時候——把專業練扎實，比到處接案更有累積。",
        "action": "answer",
        "evidence": [
          "bazi.day_master",
          "bazi.strength",
          "bazi.dayun.current"
        ],
        "cards": [
          "wangshuai.shenruo",
          "shishen.shangguan"
        ]
      },
      "recast": {
        "reply": "重新看了 2027 丁未流年：丁火七殺、未土偏印，殺印相生，壓力仍在但有貴人化解，比 2026 年的官殺同來順得多。",
        "action": "recast",
        "evidence": [
          "bazi.liunian.2027",
          "bazi.liunian.2026"
        ],
        "cards": [
          "shishen.qisha"
        ]
      },
      "lookup": {
        "reply": "傷官是日主所生、陰陽不同的那一位。它代表才華與表達，也代表不服管束；你的月干就是傷官，所以這張卡對你特別重要。",
        "action": "lookup",
        "evidence": [
          "bazi.god.month_stem"
        ],
        "cards": [
          "shishen.shangguan"
        ]
      },
      "refuse": {
        "reply": "這個問題超出命理能負責的範圍。買不買股票、該不該治療，請找專業的人；命盤能說的是你的個性與節奏，不是替你做決定。",
        "action": "refuse",
        "evidence": [],
        "cards": []
      }
    }
  },
  "health": {
    "status": "ok",
    "maintenance": false,
    "backend": "mock",
    "provider": "離線模式",
    "model": null,
    "cards": 54
  },
  "consistency": {
    "runs": 3,
    "backend": "deepseek",
    "ok": true,
    "worst_score": 0.72,
    "sections": [
      { "key": "overview", "title": "總論", "directions": ["平", "平", "平"], "direction_consistent": true, "evidence_similarity": 1.0, "mention_similarity": 1.0, "score": 1.0 },
      { "key": "personality", "title": "性格", "directions": ["吉", "吉", "吉"], "direction_consistent": true, "evidence_similarity": 0.75, "mention_similarity": 1.0, "score": 0.94 },
      { "key": "career", "title": "事業", "directions": ["平", "平", "平"], "direction_consistent": true, "evidence_similarity": 0.67, "mention_similarity": 0.5, "score": 0.84 },
      { "key": "love", "title": "感情", "directions": ["吉", "吉", "吉"], "direction_consistent": true, "evidence_similarity": 1.0, "mention_similarity": 0.67, "score": 0.95 },
      { "key": "wealth", "title": "財運", "directions": ["平", "平", "平"], "direction_consistent": true, "evidence_similarity": 0.5, "mention_similarity": 0.4, "score": 0.79 },
      { "key": "year", "title": "流年", "directions": ["凶", "凶", "凶"], "direction_consistent": true, "evidence_similarity": 0.33, "mention_similarity": 0.25, "score": 0.72 }
    ],
    "note": "方向由程式規則決定，應永遠一致；依據與提及詞彙允許些微差異，低於 0.6 代表模型在亂飄",
    "texts": [
      [
        "日主辛金生於午月，火旺金弱，身弱格局，宜土金生扶。年干庚金劫財幫身，是盤中少數助力。",
        "月干傷官透出，表達力強、點子多；地支雙午藏七殺偏印，骨子裡有韌性，壓力越大越能撐。",
        "傷官配偏財，適合以技藝取財的自由職業；正官不現，走體制內升遷較慢，自己定規則比遵守規則自在。",
        "日支午火藏七殺，感情裡吃軟不吃硬；夫妻宮偏印同宮，對象多半年紀或心智比你成熟。",
        "時干乙木偏財，財來得快去得也快；身弱擔財不易，先穩住本業再談投資型的收入。",
        "今年丙午流年正官七殺同來，官殺混雜，壓力與機會一起來；明年丁未殺印相生，壓力有貴人化解。"
      ],
      [
        "辛金日主、午月出生，火勢正旺、金氣偏弱，屬身弱，喜用土金。庚金劫財在年干，是幫身的主力。",
        "壬水傷官透於月干，口才與創意明顯；午火藏干帶七殺與偏印，外柔內剛，耐壓力。",
        "傷官生偏財，靠技藝與人脈取財比走官途順；命中無正官，體制內升遷不是你的主場。",
        "日支午火藏七殺，感情中吃軟不吃硬；夫妻宮偏印同坐，容易被成熟、有想法的人吸引。",
        "時干乙木偏財，財的流動性高；身弱不宜擔太多財，先把本業做穩，收入自然跟著來。",
        "丙午流年官殺並見，今年壓力與機會同在；2027 丁未年七殺配偏印，有貴人化解壓力。"
      ],
      [
        "你的日主是辛金，生在火旺的午月，金氣被剋洩，判為身弱，宜以土金生扶。年干庚金劫財幫身。",
        "月干傷官主表達與創意，點子多、不愛被框住；午火藏七殺偏印，有股韌性，壓力下反而更穩。",
        "以傷官生財取財最順，自由職業或專業技術勝過體制內；正官不透，升遷路線不是重點。",
        "日支午火七殺坐夫妻宮，感情裡講究被尊重；偏印同宮，對象偏成熟、有自己的想法。",
        "乙木偏財在時柱，財來財去都快；身弱擔財要量力，穩住主要收入最要緊。",
        "今年丙午流年官殺混雜，壓力與機會一起到；明年丁未殺印相生，有人出手相助。"
      ]
    ],
    "cost_usd": 0.008
  },
  "usage": {
    "day": "2026-10-08",
    "total_readings": 7,
    "cap": 200,
    "cost_usd": 0.0312,
    "budget_usd": 2.0,
    "per_ip_limit": 20,
    "distinct_ips": 2,
    "maintenance": false,
    "cost_log": {
      "rows": [
        { "time": "2026-10-08T09:12:04", "kind": "reading", "backend": "deepseek", "model": "deepseek-flash", "input_tokens": 5190, "output_tokens": 1820, "cache_read_tokens": 0, "usd": "0.006010" },
        { "time": "2026-10-08T09:15:40", "kind": "chat", "backend": "deepseek", "model": "deepseek-flash", "input_tokens": 2210, "output_tokens": 310, "cache_read_tokens": 0, "usd": "0.001210" },
        { "time": "2026-10-08T09:16:22", "kind": "chat", "backend": "deepseek", "model": "deepseek-flash", "input_tokens": 2480, "output_tokens": 280, "cache_read_tokens": 1800, "usd": "0.000980" },
        { "time": "2026-10-08T09:40:11", "kind": "reading_stream", "backend": "anthropic", "model": "claude-haiku-4-5", "input_tokens": 5020, "output_tokens": 1760, "cache_read_tokens": 4000, "usd": "0.009400" },
        { "time": "2026-10-08T10:02:55", "kind": "consistency", "backend": "deepseek", "model": "deepseek-flash", "input_tokens": 5190, "output_tokens": 1790, "cache_read_tokens": 0, "usd": "0.005900" },
        { "time": "2026-10-08T10:02:58", "kind": "consistency", "backend": "deepseek", "model": "deepseek-flash", "input_tokens": 5190, "output_tokens": 1830, "cache_read_tokens": 5000, "usd": "0.004100" },
        { "time": "2026-10-08T10:03:01", "kind": "consistency", "backend": "deepseek", "model": "deepseek-flash", "input_tokens": 5190, "output_tokens": 1810, "cache_read_tokens": 5000, "usd": "0.003600" }
      ],
      "by_model": {
        "deepseek/deepseek-flash": { "count": 6, "usd": 0.0218, "avg_usd": 0.00363, "input_tokens": 25450, "output_tokens": 7840 },
        "anthropic/claude-haiku-4-5": { "count": 1, "usd": 0.0094, "avg_usd": 0.0094, "input_tokens": 5020, "output_tokens": 1760 }
      }
    }
  }
};

// ------------------------------------------------------------------ 第 6／7／9 章新增欄位
// 用程式補進上面的既有資料（避免手改三千行 JSON）：facts.how、Reading.model/usage、chat.cost_usd、Synastry 的紫微合盤。
(function (M) {
  const clone = (o) => JSON.parse(JSON.stringify(o));
  // facts[].how（文字與 fortune/chart.py 的規則說明一致）
  const HOW = {
    'bazi.pillar.year': '年柱：以立春（太陽黃經 315°）的精確時刻換年，1984 年＝甲子年，依序推算。',
    'bazi.pillar.month': '月柱：月支以十二「節」的精確時刻換月（太陽黃經每 30°）；月干用五虎遁（年干定寅月天干）。',
    'bazi.pillar.day': '日柱：以儒略日數推算，2000-01-07＝甲子日；23 時後依「晚子時換日」派算隔日（可設定）。',
    'bazi.pillar.hour': '時柱：先把手錶時間換成真太陽時（經度差＋均時差）定時支；時干用五鼠遁（日干定子時天干）。',
    'bazi.day_master': '日主＝日柱天干；五行與陰陽直接查天干表（甲乙木、丙丁火、戊己土、庚辛金、壬癸水，奇數位為陽）。',
    'bazi.strength': '簡化計分：月令得令 +3／生日主 +2／失令 -2；其他三柱天干生扶 +1、耗洩 -1；地支藏干通根 +1。總分 ≥0 身強，否則身弱。',
    'bazi.favourable': '身強取剋洩耗（官殺、食傷、財）；身弱取生扶（印、比劫）。流派差異大，僅為課程示範規則。',
    'bazi.dayun.current': '大運從月柱的下一個（順行）或上一個（逆行）干支起，每運十年；順逆由年干陰陽×性別決定。',
    'bazi.liunian.current': '流年干支＝(年−4) mod 10、mod 12（立春後算該年）；十神以流年天干與地支本氣對日主。',
    'bazi.qiyun': '陽男陰女順行數到下一個節、陰男陽女逆行數到上一個節；三天折一年（一天＝四個月、一時辰＝十天），交節時刻用手錶時間比。',
    'bazi.shensha': '全部查表：以年干／日干查貴人、祿刃；以年支／日支的三合局查將星、驛馬、桃花、華蓋、劫煞、亡神；紅鸞天喜、孤辰寡宿依年支；天醫依月支。',
    'ziwei.life_palace': '寅宮起正月順數到生月，再從該宮起子時逆數到生時；宮干用五虎遁。生月以農曆為準（閏月規則可設定）。',
    'ziwei.five_class': '命宮干支的納音五行：水二、木三、金四、土五、火六局。',
    'ziwei.daxian.current': '第一大限從命宮起、以局數為起歲，每宮十年；陽男陰女順行（往父母宮）、陰男陽女逆行（往兄弟宮）。',
  };
  for (const chart of [M.bazi, M.ziwei, M.bazi_b, M.synastry.a, M.synastry.b]) {
    for (const f of (chart && chart.facts) || []) {
      if (HOW[f.id]) f.how = HOW[f.id];
      else if (/^bazi\.liunian\.\d{4}$/.test(f.id)) f.how = HOW['bazi.liunian.current'];
      else if (/^bazi\.dayun\.\d+$/.test(f.id)) f.how = HOW['bazi.dayun.current'];
      else if (/^ziwei\.hua\./.test(f.id)) f.how = '生年四化依生年天干查表（甲：廉破武陽、乙：機梁紫陰…），再找該星落在哪一宮。';
      else f.how = f.how || '';
    }
  }
  // Reading.model／usage：八字解讀維持離線示範（$0）；紫微解讀假裝接了 DeepSeek，方便檢查費用列版面
  M.reading_bazi.model = '';
  M.reading_bazi.usage = { input_tokens: 0, output_tokens: 0, cache_read_tokens: 0 };
  M.reading_ziwei.backend = 'deepseek';
  M.reading_ziwei.model = 'deepseek-flash';
  M.reading_ziwei.cost_usd = 0.006;
  M.reading_ziwei.usage = { input_tokens: 5190, output_tokens: 1820, cache_read_tokens: 0 };
  // 對話回覆的費用（可能沒有；refuse 就沒有）
  M.chat.replies.answer.cost_usd = 0.0012;
  M.chat.replies.recast.cost_usd = 0.0018;
  M.chat.replies.lookup.cost_usd = 0.0009;

  // Synastry 的紫微合盤：a_ziwei 直接用小美的紫微盤；b_ziwei 複製一份改成小明，命宮／夫妻宮換星好讓比對項目成立
  const a = clone(M.ziwei);
  const b = clone(M.ziwei);
  b.birth = clone(M.bazi_b.birth);
  b.subject = M.bazi_b.subject;
  b.warnings = ['大限順行，5 歲起第一大限'];
  const palace = (c, name) => c.payload.palaces.find((p) => p.name === name);
  const fact = (c, id) => c.facts.find((f) => f.id === id);
  Object.assign(palace(b, '命宮'), { major: ['太陰'], lucky: ['左輔'], unlucky: [], other: [], hua: { '太陰': '化祿' } });
  Object.assign(palace(b, '夫妻宮'), { major: ['天同'], lucky: ['文昌'], unlucky: [], other: [], hua: { '天同': '化忌' } });
  Object.assign(fact(b, 'ziwei.palace.命宮'), { value: '太陰', note: '主星 太陰(化祿)；吉星 左輔' });
  Object.assign(fact(b, 'ziwei.palace.夫妻宮'), { value: '天同', note: '主星 天同(化忌)；吉星 文昌' });
  Object.assign(fact(b, 'ziwei.hua.化祿'), { value: '太陰（在命宮）' });
  Object.assign(fact(b, 'ziwei.hua.化忌'), { value: '天同（在夫妻宮）' });
  b.payload.soul_star = '文曲';
  M.synastry.a_ziwei = a;
  M.synastry.b_ziwei = b;
  M.synastry.ziwei_items = [
    { kind: '合', title: '小明的命宮主星入小美的夫妻宮',
      text: '小明命宮主星太陰，正是小美夫妻宮（含對宮）的主星，傳統視為容易把對方當成「理想中的伴侶樣子」。',
      evidence: [{ who: 'b', fact_id: 'ziwei.palace.命宮' }, { who: 'a', fact_id: 'ziwei.palace.夫妻宮' }] },
    { kind: '生', title: '小明的化祿入小美的夫妻宮',
      text: '小明生年化祿在太陰，這顆星坐在小美的夫妻宮，帶來緣分與助益。',
      evidence: [{ who: 'b', fact_id: 'ziwei.hua.化祿' }, { who: 'a', fact_id: 'ziwei.palace.夫妻宮' }] },
    { kind: '沖', title: '夫妻宮對照',
      text: '小美夫妻宮太陰（煞星 1）；小明夫妻宮天同（煞星 0）。一方較能耐磨、一方較求平順，節奏要互相遷就。',
      evidence: [{ who: 'a', fact_id: 'ziwei.palace.夫妻宮' }, { who: 'b', fact_id: 'ziwei.palace.夫妻宮' }] },
  ];
  M.synastry.score = { harmony: 5, tension: 3, net: 2 };
  M.synastry.summary = '小美與小明：契合 5 項、張力 3 項，淨值 2。金生水為主軸、喜用互補；紫微上小明的命宮與化祿都落入小美的夫妻宮。';
})(window.MOCK_DATA);

// ------------------------------------------------------------------ 流派（4-3 延伸）：/api/schools、chart.school、facts[].alternatives、payload.school_dependent
(function (M) {
  // GET /api/schools 的形狀（三個流派＋完整 schema；每派的開關值不在這裡，排盤後由 chart.school.settings 回填）
  M.schools = {
    default: 'default',
    schools: [
      { name: 'default', title: '課程預設', source: '課程編寫，綜合《子平真詮》《滴天髓》《紫微斗數全書》通論與多數排盤軟體的預設', description: '多數排盤軟體的做法；流派有歧見處取通行版，盤面會標出另一派的結果。' },
      { name: 'clock-time', title: '手錶時間派', source: '坊間常見排盤網站的預設；《三命通會》論子時以夜半為界', description: '時辰直接用證件上的時間，不做經度與均時差修正；23 時後仍算當天日柱。對照課程預設可看出時柱、日柱差在哪。' },
      { name: 'zhongqi-tianfu', title: '中氣命宮・天府化科派', source: '《果老星宗》命宮以中氣；部分紫微傳承（庚壬天府化科）；閏月歸本月為北派常見', description: '示範三個常見歧見同時切換後，命宮、四化、閏月生人的命宮會怎麼變。' },
    ],
    schema: {
      bazi: {
        year_boundary: { options: { lichun: '立春換年（通行）', lunar_new_year: '農曆新年換年（民俗）' }, default: 'lichun' },
        late_zi: { options: { next_day: '晚子時換日柱', same_day: '晚子時不換日柱' }, default: 'next_day' },
        true_solar_time: { options: { on: '時辰用真太陽時', off: '時辰用手錶時間' }, default: 'on' },
        minggong_month: { options: { jie: '命宮生月以節', zhongqi: '命宮生月以中氣' }, default: 'jie' },
        yangren_yin_stems: { options: { chenwei: '陰干羊刃取辰未戌丑', yinshen: '陰干羊刃取寅申巳亥', none: '陰干不論羊刃' }, default: 'chenwei' },
        xusui_boundary: { options: { lunar_new_year: '虛歲過農曆年加一', lichun: '虛歲過立春加一' }, default: 'lunar_new_year' },
        chenggu_year: { options: { lichun: '稱骨年用年柱', lunar_year: '稱骨年用農曆年' }, default: 'lichun' },
        strength_method: { options: { score_v1: '旺衰計分法（課程版）' }, default: 'score_v1' },
      },
      ziwei: {
        leap_month: { options: { split: '閏月上半歸本月、下半歸次月', same: '閏月全算本月', next: '閏月全算次月' }, default: 'split' },
        sihua_variant: { options: { standard: '四化通行表', tianfu_ke: '庚壬年天府化科', tianxiang_ji: '庚年天相化忌' }, default: 'standard' },
        hour_source: { options: { true_solar: '時支用真太陽時', clock: '時支用手錶時間' }, default: 'true_solar' },
        late_zi: { options: { same_day: '晚子時農曆日不換', next_day: '晚子時農曆日算隔日' }, default: 'same_day' },
        tianma_basis: { options: { year_branch: '天馬以年支起', month_branch: '天馬以月支起' }, default: 'year_branch' },
      },
    },
  };
  // 各流派的開關值（對應 schools/*.yaml；mock 用來算 chart.school.settings）
  const SETTINGS = {
    'default': { bazi: {}, ziwei: {} },
    'clock-time': { bazi: { true_solar_time: 'off', late_zi: 'same_day' }, ziwei: { hour_source: 'clock' } },
    'zhongqi-tianfu': { bazi: { minggong_month: 'zhongqi', yangren_yin_stems: 'yinshen' }, ziwei: { sihua_variant: 'tianfu_ke', leap_month: 'same', tianma_basis: 'month_branch' } },
  };
  const defaults = () => {
    const out = {};
    for (const [sys, fields] of Object.entries(M.schools.schema)) { out[sys] = {}; for (const [k, sw] of Object.entries(fields)) out[sys][k] = sw.default; }
    return out;
  };
  const summaryOf = (title, s) => {
    const b = s.bazi, z = s.ziwei;
    return `${title}：年柱以${b.year_boundary === 'lichun' ? '立春' : '農曆新年'}換年、晚子時${b.late_zi === 'next_day' ? '換日' : '不換日'}、時辰${b.true_solar_time === 'on' ? '用真太陽時' : '用手錶時間'}、命宮生月以${b.minggong_month === 'jie' ? '節' : '中氣'}、閏月${{ split: '上半歸本月下半歸次月', same: '全算本月', next: '全算次月' }[z.leap_month] || z.leap_month}、四化${{ standard: '通行表', tianfu_ke: '庚壬天府化科', tianxiang_ji: '庚天相化忌' }[z.sihua_variant] || z.sihua_variant}`;
  };
  /** 依請求的 school／overrides 算出 chart.school；流派不存在或選項不合法 → {error}（app.js 會丟 400 bad_school） */
  M.schoolFor = (body) => {
    const name = body.school || M.schools.default;
    const entry = M.schools.schools.find((s) => s.name === name);
    if (!entry) return { error: `流派設定有誤：沒有 ${name} 這個流派（schools/${name}.yaml）` };
    const settings = defaults();
    for (const sys of ['bazi', 'ziwei']) Object.assign(settings[sys], (SETTINGS[name] || {})[sys] || {});
    const ov = body.overrides || {};
    let custom = false;
    for (const sys of ['bazi', 'ziwei']) {
      for (const [k, v] of Object.entries(ov[sys] || {})) {
        const sw = M.schools.schema[sys][k];
        if (!sw) continue;
        if (!(v in sw.options)) return { error: `流派設定有誤：${sys}.${k} 沒有 ${v} 這個選項` };
        settings[sys][k] = v; custom = true;
      }
    }
    const title = custom ? `${entry.title}（單次覆寫）` : entry.title;
    return { name: custom ? `${name}+custom` : name, title, source: entry.source, summary: summaryOf(title, settings), settings };
  };
  // 每張 ChartData 都帶 school（預設流派）；幾條事實加 alternatives；payload.school_dependent 列出受影響的事實
  const ALTS = {
    'bazi.pillar.day': [{ switch: 'bazi.late_zi', option: 'same_day', label: '晚子時不換日柱', value: '甲子' }],
    'bazi.pillar.hour': [{ switch: 'bazi.true_solar_time', option: 'off', label: '時辰用手錶時間', value: '癸未' }],
    'bazi.god.hour_stem': [{ switch: 'bazi.true_solar_time', option: 'off', label: '時辰用手錶時間', value: '食神' }],
    'ziwei.hua.化科': [{ switch: 'ziwei.sihua_variant', option: 'tianfu_ke', label: '庚壬年天府化科', value: '天府（在財帛宮）' }],
  };
  for (const chart of [M.bazi, M.ziwei, M.bazi_b, M.synastry.a, M.synastry.b, M.synastry.a_ziwei, M.synastry.b_ziwei]) {
    if (!chart) continue;
    chart.school = M.schoolFor({});
    for (const f of chart.facts || []) f.alternatives = ALTS[f.id] ? ALTS[f.id].map((a) => ({ ...a })) : [];
    chart.payload = chart.payload || {};
    chart.payload.school_dependent = (chart.facts || []).filter((f) => f.alternatives.length).map((f) => f.id);
  }
})(window.MOCK_DATA);

// ------------------------------------------------------------------ AI 設定（自帶金鑰）：/api/llm/backends、/api/llm/models、Reading.byok
(function (M) {
  // GET /api/llm/backends
  M.llm_backends = {
    backends: [
      { name: 'anthropic', label: 'Claude（Anthropic）', default_model: 'claude-opus-5-5', base_url: null, needs_key: true },
      { name: 'openai', label: 'GPT（OpenAI）', default_model: 'gpt-5.1', base_url: null, needs_key: true },
      { name: 'deepseek', label: 'DeepSeek', default_model: 'deepseek-flash', base_url: null, needs_key: true },
      { name: 'gemini', label: 'Gemini（Google）', default_model: 'gemini-2.5-flash', base_url: null, needs_key: true },
      { name: 'openai_compatible', label: 'OpenAI 相容端點（Ollama／LM Studio／Groq…）', default_model: 'qwen2.5:7b', base_url: 'http://localhost:11434/v1', needs_key: false },
    ],
    thinking: ['default', 'off', 'low', 'high'],
  };
  // POST /api/llm/models 的一份成功回應（app.js 的 mockRequest 會依請求的 backend 換 label／model；金鑰為 "bad" 時回 ok:false）
  M.llm_models = {
    ok: true, backend: 'gemini', label: 'Gemini（Google）', model: 'gemini-2.5-flash',
    models: [
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', context_window: 1048576 },
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', context_window: 1048576 },
      { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash-Lite', context_window: 1048576 },
    ],
    served: 'gemini-2.5-flash', error: '',
  };
  // 紫微解讀假裝是自帶金鑰付的，方便檢查費用列的「🔑 自付」
  M.reading_ziwei.byok = true;
  M.reading_bazi.byok = false;
})(window.MOCK_DATA);

// ------------------------------------------------------------------ 旺衰 v2、黃曆、紫微大限→流年、廟旺／格局、城市與日光節約時間（後端 5f5408b）
// 以下資料由 fortune 引擎實際算出（同一組出生資料），用程式補進上面的既有 ChartData。
(function (M) {
  const clone = (o) => JSON.parse(JSON.stringify(o));
  // --- 八字：facts（bazi.strength 的 note 含逐項分數；新增 yongshen／tiaohou／pattern）、payload.strength v2、payload.almanac
  const BAZI = {
    a: {
      "facts": [
        {
          "id": "bazi.strength",
          "group": "旺衰",
          "label": "日主旺衰",
          "value": "身弱（喜生扶）",
          "note": "生扶 3.25（比劫 1.0、印 2.25）vs 耗洩 9.08（食傷 1.96、財 1.72、官殺 5.4），比例 0.26；月令 午（火）：日主 辛金 得令為「死」（-3）；年支 午 藏 丁（官殺 −0.8）；年支 午 藏 己（印根 +0.5）；月支 午 藏 丁（官殺 −1.2）；月支 午 藏 己（印根 +0.75）；日支 亥 藏 壬（食傷 −0.96）；日支 亥 藏 甲（財 −0.48）；時支 未 藏 己（印根 +1.0）；時支 未 藏 丁（官殺 −0.4）；時支 未 藏 乙（財 −0.24）；年干 庚 透（比劫 +1.0）；月干 壬 透（食傷 −1.0）；時干 乙 透（財 −1.0）",
          "how": "月令旺相休囚死（+3/+2/−1/−2/−3）；四柱藏干通根（本氣 1.0、中氣 0.5、餘氣 0.3；月令 ×1.5、日支 ×1.2）；年月時干透出 ±1；生扶÷(生扶＋耗洩) ≥0.58 身強、≤0.42 身弱、其間中和；無根且 <0.22 疑從格。",
          "alternatives": []
        },
        {
          "id": "bazi.favourable",
          "group": "旺衰",
          "label": "喜用五行",
          "value": "土、金",
          "note": "忌 木、水、火",
          "how": "身強喜洩剋耗（食傷、財、官殺）；身弱喜生扶（印、比劫）；從格順勢。",
          "alternatives": []
        },
        {
          "id": "bazi.yongshen",
          "group": "旺衰",
          "label": "用神",
          "value": "土",
          "note": "官殺旺 → 以印化殺生身為先",
          "how": "扶抑：身強看比劫與印何者旺（比劫旺取官殺、印旺取財）；身弱看耗洩最重的一類（財多取比劫、官殺旺取印、食傷旺取印）。",
          "alternatives": []
        },
        {
          "id": "bazi.tiaohou",
          "group": "旺衰",
          "label": "調候",
          "value": "水",
          "note": "生於夏月（巳午未）炎燥，調候喜水潤局",
          "how": "冬月（亥子丑）喜火、夏月（巳午未）喜水，春秋不急。",
          "alternatives": []
        },
        {
          "id": "bazi.pattern",
          "group": "格局",
          "label": "月令格局",
          "value": "七殺格",
          "note": "月令 午 本氣 丁 為日主之七殺 → 七殺格",
          "how": "以月支本氣對日主的十神取格；比肩為建祿格，劫財陽干為羊刃格、陰干為月劫格。",
          "alternatives": []
        }
      ],
      "strength": {
        "method": "score_v2",
        "label": "身弱（喜生扶）",
        "strong": false,
        "cong": false,
        "ratio": 0.26,
        "support": 3.25,
        "drain": 9.08,
        "support_by": {
          "比劫": 1.0,
          "印": 2.25
        },
        "drain_by": {
          "食傷": 1.96,
          "財": 1.72,
          "官殺": 5.4
        },
        "favourable": [
          "土",
          "金"
        ],
        "avoid": [
          "木",
          "水",
          "火"
        ],
        "yongshen": "土",
        "yongshen_why": "官殺旺 → 以印化殺生身為先",
        "tiaohou": "水",
        "tiaohou_note": "生於夏月（巳午未）炎燥，調候喜水潤局",
        "pattern": "七殺格",
        "pattern_note": "月令 午 本氣 丁 為日主之七殺 → 七殺格",
        "notes": [
          "月令 午（火）：日主 辛金 得令為「死」（-3）",
          "年支 午 藏 丁（官殺 −0.8）",
          "年支 午 藏 己（印根 +0.5）",
          "月支 午 藏 丁（官殺 −1.2）",
          "月支 午 藏 己（印根 +0.75）",
          "日支 亥 藏 壬（食傷 −0.96）",
          "日支 亥 藏 甲（財 −0.48）",
          "時支 未 藏 己（印根 +1.0）",
          "時支 未 藏 丁（官殺 −0.4）",
          "時支 未 藏 乙（財 −0.24）",
          "年干 庚 透（比劫 +1.0）",
          "月干 壬 透（食傷 −1.0）",
          "時干 乙 透（財 −1.0）"
        ],
        "disclaimer": "旺衰為可稽核的計分法（月令旺相休囚死、藏干加權通根、透干），流派間仍有差異"
      },
      "almanac": {
        "xiu": "亢金龙",
        "xiu_luck": "凶",
        "zhixing": "执",
        "pengzu": [
          "辛不合酱主人不尝",
          "亥不嫁娶不利新郎"
        ],
        "day_yi": [
          "祭祀",
          "祈福",
          "求嗣",
          "开光",
          "出行",
          "伐木",
          "出火",
          "拆卸"
        ],
        "day_ji": [
          "嫁娶",
          "开市",
          "交易",
          "行丧",
          "安葬",
          "修坟"
        ],
        "jishen": [
          "月德合",
          "天恩",
          "五富",
          "福生"
        ],
        "xiongsha": [
          "劫煞",
          "小耗",
          "重日",
          "朱雀"
        ],
        "positions": {
          "喜神": "西南",
          "福神": "西北",
          "財神": "正东"
        },
        "taixi": "丙寅",
        "shengong": "戊寅",
        "mingong": "庚辰",
        "source": "lunar-python（MIT）"
      }
    },
    b: {
      "facts": [
        {
          "id": "bazi.strength",
          "group": "旺衰",
          "label": "日主旺衰",
          "value": "身弱（喜生扶）",
          "note": "生扶 2.95（比劫 1.6、印 1.35）vs 耗洩 10.21（食傷 1.8、財 0.65、官殺 7.76），比例 0.22；月令 戌（土）：日主 壬水 得令為「死」（-3）；年支 辰 藏 戊（官殺 −0.8）；年支 辰 藏 乙（食傷 −0.4）；年支 辰 藏 癸（比劫根 +0.3）；月支 戌 藏 戊（官殺 −1.2）；月支 戌 藏 辛（印根 +0.75）；月支 戌 藏 丁（財 −0.36）；日支 戌 藏 戊（官殺 −0.96）；日支 戌 藏 辛（印根 +0.6）；日支 戌 藏 丁（財 −0.29）；時支 辰 藏 戊（官殺 −0.8）；時支 辰 藏 乙（食傷 −0.4）；時支 辰 藏 癸（比劫根 +0.3）；年干 戊 透（官殺 −1.0）；月干 壬 透（比劫 +1.0）；時干 甲 透（食傷 −1.0）",
          "how": "月令旺相休囚死（+3/+2/−1/−2/−3）；四柱藏干通根（本氣 1.0、中氣 0.5、餘氣 0.3；月令 ×1.5、日支 ×1.2）；年月時干透出 ±1；生扶÷(生扶＋耗洩) ≥0.58 身強、≤0.42 身弱、其間中和；無根且 <0.22 疑從格。",
          "alternatives": []
        },
        {
          "id": "bazi.favourable",
          "group": "旺衰",
          "label": "喜用五行",
          "value": "水、金",
          "note": "忌 土、木、火",
          "how": "身強喜洩剋耗（食傷、財、官殺）；身弱喜生扶（印、比劫）；從格順勢。",
          "alternatives": []
        },
        {
          "id": "bazi.yongshen",
          "group": "旺衰",
          "label": "用神",
          "value": "金",
          "note": "官殺旺 → 以印化殺生身為先",
          "how": "扶抑：身強看比劫與印何者旺（比劫旺取官殺、印旺取財）；身弱看耗洩最重的一類（財多取比劫、官殺旺取印、食傷旺取印）。",
          "alternatives": []
        },
        {
          "id": "bazi.tiaohou",
          "group": "旺衰",
          "label": "調候",
          "value": "不急",
          "note": "生於春秋，調候不急",
          "how": "冬月（亥子丑）喜火、夏月（巳午未）喜水，春秋不急。",
          "alternatives": []
        },
        {
          "id": "bazi.pattern",
          "group": "格局",
          "label": "月令格局",
          "value": "七殺格",
          "note": "月令 戌 本氣 戊 為日主之七殺 → 七殺格",
          "how": "以月支本氣對日主的十神取格；比肩為建祿格，劫財陽干為羊刃格、陰干為月劫格。",
          "alternatives": []
        }
      ],
      "strength": {
        "method": "score_v2",
        "label": "身弱（喜生扶）",
        "strong": false,
        "cong": false,
        "ratio": 0.22,
        "support": 2.95,
        "drain": 10.21,
        "support_by": {
          "比劫": 1.6,
          "印": 1.35
        },
        "drain_by": {
          "食傷": 1.8,
          "財": 0.65,
          "官殺": 7.76
        },
        "favourable": [
          "水",
          "金"
        ],
        "avoid": [
          "土",
          "木",
          "火"
        ],
        "yongshen": "金",
        "yongshen_why": "官殺旺 → 以印化殺生身為先",
        "tiaohou": null,
        "tiaohou_note": "生於春秋，調候不急",
        "pattern": "七殺格",
        "pattern_note": "月令 戌 本氣 戊 為日主之七殺 → 七殺格",
        "notes": [
          "月令 戌（土）：日主 壬水 得令為「死」（-3）",
          "年支 辰 藏 戊（官殺 −0.8）",
          "年支 辰 藏 乙（食傷 −0.4）",
          "年支 辰 藏 癸（比劫根 +0.3）",
          "月支 戌 藏 戊（官殺 −1.2）",
          "月支 戌 藏 辛（印根 +0.75）",
          "月支 戌 藏 丁（財 −0.36）",
          "日支 戌 藏 戊（官殺 −0.96）",
          "日支 戌 藏 辛（印根 +0.6）",
          "日支 戌 藏 丁（財 −0.29）",
          "時支 辰 藏 戊（官殺 −0.8）",
          "時支 辰 藏 乙（食傷 −0.4）",
          "時支 辰 藏 癸（比劫根 +0.3）",
          "年干 戊 透（官殺 −1.0）",
          "月干 壬 透（比劫 +1.0）",
          "時干 甲 透（食傷 −1.0）"
        ],
        "disclaimer": "旺衰為可稽核的計分法（月令旺相休囚死、藏干加權通根、透干），流派間仍有差異"
      },
      "almanac": {
        "xiu": "角木蛟",
        "xiu_luck": "吉",
        "zhixing": "建",
        "pengzu": [
          "壬不泱水更难提防",
          "戌不吃犬作怪上床"
        ],
        "day_yi": [
          "祭祀",
          "祈福",
          "求嗣",
          "开光",
          "出行",
          "解除",
          "上梁",
          "入宅"
        ],
        "day_ji": [
          "伐木",
          "行丧",
          "破土",
          "嫁娶",
          "安葬",
          "开渠"
        ],
        "jishen": [
          "月空",
          "母仓",
          "四相",
          "守日",
          "天马"
        ],
        "xiongsha": [
          "月建",
          "小时",
          "土府",
          "白虎"
        ],
        "positions": {
          "喜神": "正南",
          "福神": "东南",
          "財神": "正南"
        },
        "taixi": "丁卯",
        "shengong": "乙卯",
        "mingong": "乙卯",
        "source": "lunar-python（MIT）"
      }
    },
  };
  const patchBazi = (chart, src) => {
    if (!chart) return;
    const facts = chart.facts || (chart.facts = []);
    const byId = (id) => facts.findIndex((f) => f && f.id === id);
    let at = byId('bazi.favourable');
    for (const f of src.facts) {
      const i = byId(f.id);
      if (i >= 0) facts[i] = clone(f);
      else { facts.splice(at + 1, 0, clone(f)); at += 1; }
    }
    chart.payload = chart.payload || {};
    chart.payload.strength = clone(src.strength);
    chart.payload.almanac = clone(src.almanac);
  };
  patchBazi(M.bazi, BAZI.a); patchBazi(M.synastry && M.synastry.a, BAZI.a);
  patchBazi(M.bazi_b, BAZI.b); patchBazi(M.synastry && M.synastry.b, BAZI.b);

  // --- 紫微：每宮 changsheng／boshi／brightness／adjective_stars；payload.luck（12 大限 × 10 流年，含歲前／將前）；payload.enrich；大限／流年事實
  const PALACES = [{"branch":"子","name":"父母宮","changsheng":"墓","boshi":"病符","brightness":{"廉貞":"平","天相":"廟"},"adjective_stars":["解神","恩光","天哭","天虛"]},{"branch":"丑","name":"福德宮","changsheng":"死","boshi":"喜神","brightness":{"天梁":"旺","天魁":""},"adjective_stars":["台輔","天刑"]},{"branch":"寅","name":"田宅宮","changsheng":"病","boshi":"飛廉","brightness":{"七殺":"廟"},"adjective_stars":["天廚","蜚廉"]},{"branch":"卯","name":"官祿宮","changsheng":"衰","boshi":"奏書","brightness":{"天同":"平","文昌":"利"},"adjective_stars":["天喜","咸池","天德"]},{"branch":"辰","name":"交友宮","changsheng":"帝旺","boshi":"將軍","brightness":{"武曲":"廟","地空":""},"adjective_stars":["鳳閣","寡宿","天傷","年解"]},{"branch":"巳","name":"遷移宮","changsheng":"臨官","boshi":"小耗","brightness":{"太陽":"旺"},"adjective_stars":["天姚","天才","天巫","破碎"]},{"branch":"午","name":"疾厄宮","changsheng":"冠帶","boshi":"青龍","brightness":{"破軍":"廟","右弼":"","地劫":""},"adjective_stars":["三台","天福","截路","陰煞","天使"]},{"branch":"未","name":"財帛宮","changsheng":"沐浴","boshi":"力士","brightness":{"天機":"陷","天鉞":"","陀羅":"廟"},"adjective_stars":["天壽","天月","天空","空亡"]},{"branch":"申","name":"子女宮","changsheng":"長生","boshi":"博士","brightness":{"紫微":"旺","天府":"得","左輔":"","祿存":"","天馬":"","火星":"陷"},"adjective_stars":["八座","天貴","孤辰"]},{"branch":"酉","name":"夫妻宮","changsheng":"養","boshi":"官府","brightness":{"太陰":"旺","擎羊":"陷"},"adjective_stars":["紅鸞","封誥"]},{"branch":"戌","name":"兄弟宮","changsheng":"胎","boshi":"伏兵","brightness":{"貪狼":"廟","鈴星":"廟"},"adjective_stars":["龍池","華蓋","旬空"]},{"branch":"亥","name":"命宮","changsheng":"絕","boshi":"大耗","brightness":{"巨門":"旺","文曲":"旺"},"adjective_stars":["天官","月德"]}];
  const LUCK = {"start_age":5,"forward":false,"age_now":37,"daxian":[
      {"index":0,"palace":"命宮","branch":"亥","stem":"丁","gz":"丁亥","ages":[5,14],"years":[1994,2003],"changsheng":"絕","sihua":["太陰化祿","天同化權","天機化科","巨門化忌"],"sihua_landing":{"化祿":"夫妻宮","化權":"官祿宮","化科":"財帛宮","化忌":"命宮"},"current":false,"liunian":[
        {"year":1994,"age":5,"gz":"甲戌","taisui_palace":"兄弟宮","branch":"戌","sihua":["廉貞化祿","破軍化權","武曲化科","太陽化忌"],"sihua_landing":{"化祿":"父母宮","化權":"疾厄宮","化科":"交友宮","化忌":"遷移宮"},"flow_stars":{"流祿":"寅","流羊":"卯","流陀":"丑","流魁":"丑","流鉞":"未","流昌":"巳","流馬":"申"},"suiqian":{"戌":"太歲","亥":"晦氣","子":"喪門","丑":"貫索","寅":"官符","卯":"小耗","辰":"大耗","巳":"龍德","午":"白虎","未":"天德","申":"弔客","酉":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":1995,"age":6,"gz":"乙亥","taisui_palace":"命宮","branch":"亥","sihua":["天機化祿","天梁化權","紫微化科","太陰化忌"],"sihua_landing":{"化祿":"財帛宮","化權":"福德宮","化科":"子女宮","化忌":"夫妻宮"},"flow_stars":{"流祿":"卯","流羊":"辰","流陀":"寅","流魁":"子","流鉞":"申","流昌":"午","流馬":"巳"},"suiqian":{"亥":"太歲","子":"晦氣","丑":"喪門","寅":"貫索","卯":"官符","辰":"小耗","巳":"大耗","午":"龍德","未":"白虎","申":"天德","酉":"弔客","戌":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":1996,"age":7,"gz":"丙子","taisui_palace":"父母宮","branch":"子","sihua":["天同化祿","天機化權","文昌化科","廉貞化忌"],"sihua_landing":{"化祿":"官祿宮","化權":"財帛宮","化科":"官祿宮","化忌":"父母宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"亥","流鉞":"酉","流昌":"申","流馬":"寅"},"suiqian":{"子":"太歲","丑":"晦氣","寅":"喪門","卯":"貫索","辰":"官符","巳":"小耗","午":"大耗","未":"龍德","申":"白虎","酉":"天德","戌":"弔客","亥":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":1997,"age":8,"gz":"丁丑","taisui_palace":"福德宮","branch":"丑","sihua":["太陰化祿","天同化權","天機化科","巨門化忌"],"sihua_landing":{"化祿":"夫妻宮","化權":"官祿宮","化科":"財帛宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"亥","流鉞":"酉","流昌":"酉","流馬":"亥"},"suiqian":{"丑":"太歲","寅":"晦氣","卯":"喪門","辰":"貫索","巳":"官符","午":"小耗","未":"大耗","申":"龍德","酉":"白虎","戌":"天德","亥":"弔客","子":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":1998,"age":9,"gz":"戊寅","taisui_palace":"田宅宮","branch":"寅","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"丑","流鉞":"未","流昌":"申","流馬":"申"},"suiqian":{"寅":"太歲","卯":"晦氣","辰":"喪門","巳":"貫索","午":"官符","未":"小耗","申":"大耗","酉":"龍德","戌":"白虎","亥":"天德","子":"弔客","丑":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":1999,"age":10,"gz":"己卯","taisui_palace":"官祿宮","branch":"卯","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"子","流鉞":"申","流昌":"酉","流馬":"巳"},"suiqian":{"卯":"太歲","辰":"晦氣","巳":"喪門","午":"貫索","未":"官符","申":"小耗","酉":"大耗","戌":"龍德","亥":"白虎","子":"天德","丑":"弔客","寅":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2000,"age":11,"gz":"庚辰","taisui_palace":"交友宮","branch":"辰","sihua":["太陽化祿","武曲化權","太陰化科","天同化忌"],"sihua_landing":{"化祿":"遷移宮","化權":"交友宮","化科":"夫妻宮","化忌":"官祿宮"},"flow_stars":{"流祿":"申","流羊":"酉","流陀":"未","流魁":"丑","流鉞":"未","流昌":"亥","流馬":"寅"},"suiqian":{"辰":"太歲","巳":"晦氣","午":"喪門","未":"貫索","申":"官符","酉":"小耗","戌":"大耗","亥":"龍德","子":"白虎","丑":"天德","寅":"弔客","卯":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2001,"age":12,"gz":"辛巳","taisui_palace":"遷移宮","branch":"巳","sihua":["巨門化祿","太陽化權","文曲化科","文昌化忌"],"sihua_landing":{"化祿":"命宮","化權":"遷移宮","化科":"命宮","化忌":"官祿宮"},"flow_stars":{"流祿":"酉","流羊":"戌","流陀":"申","流魁":"午","流鉞":"寅","流昌":"子","流馬":"亥"},"suiqian":{"巳":"太歲","午":"晦氣","未":"喪門","申":"貫索","酉":"官符","戌":"小耗","亥":"大耗","子":"龍德","丑":"白虎","寅":"天德","卯":"弔客","辰":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2002,"age":13,"gz":"壬午","taisui_palace":"疾厄宮","branch":"午","sihua":["天梁化祿","紫微化權","左輔化科","武曲化忌"],"sihua_landing":{"化祿":"福德宮","化權":"子女宮","化科":"子女宮","化忌":"交友宮"},"flow_stars":{"流祿":"亥","流羊":"子","流陀":"戌","流魁":"卯","流鉞":"巳","流昌":"寅","流馬":"申"},"suiqian":{"午":"太歲","未":"晦氣","申":"喪門","酉":"貫索","戌":"官符","亥":"小耗","子":"大耗","丑":"龍德","寅":"白虎","卯":"天德","辰":"弔客","巳":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2003,"age":14,"gz":"癸未","taisui_palace":"財帛宮","branch":"未","sihua":["破軍化祿","巨門化權","太陰化科","貪狼化忌"],"sihua_landing":{"化祿":"疾厄宮","化權":"命宮","化科":"夫妻宮","化忌":"兄弟宮"},"flow_stars":{"流祿":"子","流羊":"丑","流陀":"亥","流魁":"卯","流鉞":"巳","流昌":"卯","流馬":"巳"},"suiqian":{"未":"太歲","申":"晦氣","酉":"喪門","戌":"貫索","亥":"官符","子":"小耗","丑":"大耗","寅":"龍德","卯":"白虎","辰":"天德","巳":"弔客","午":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false}
      ]},
      {"index":1,"palace":"兄弟宮","branch":"戌","stem":"丙","gz":"丙戌","ages":[15,24],"years":[2004,2013],"changsheng":"胎","sihua":["天同化祿","天機化權","文昌化科","廉貞化忌"],"sihua_landing":{"化祿":"官祿宮","化權":"財帛宮","化科":"官祿宮","化忌":"父母宮"},"current":false,"liunian":[
        {"year":2004,"age":15,"gz":"甲申","taisui_palace":"子女宮","branch":"申","sihua":["廉貞化祿","破軍化權","武曲化科","太陽化忌"],"sihua_landing":{"化祿":"父母宮","化權":"疾厄宮","化科":"交友宮","化忌":"遷移宮"},"flow_stars":{"流祿":"寅","流羊":"卯","流陀":"丑","流魁":"丑","流鉞":"未","流昌":"巳","流馬":"寅"},"suiqian":{"申":"太歲","酉":"晦氣","戌":"喪門","亥":"貫索","子":"官符","丑":"小耗","寅":"大耗","卯":"龍德","辰":"白虎","巳":"天德","午":"弔客","未":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2005,"age":16,"gz":"乙酉","taisui_palace":"夫妻宮","branch":"酉","sihua":["天機化祿","天梁化權","紫微化科","太陰化忌"],"sihua_landing":{"化祿":"財帛宮","化權":"福德宮","化科":"子女宮","化忌":"夫妻宮"},"flow_stars":{"流祿":"卯","流羊":"辰","流陀":"寅","流魁":"子","流鉞":"申","流昌":"午","流馬":"亥"},"suiqian":{"酉":"太歲","戌":"晦氣","亥":"喪門","子":"貫索","丑":"官符","寅":"小耗","卯":"大耗","辰":"龍德","巳":"白虎","午":"天德","未":"弔客","申":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2006,"age":17,"gz":"丙戌","taisui_palace":"兄弟宮","branch":"戌","sihua":["天同化祿","天機化權","文昌化科","廉貞化忌"],"sihua_landing":{"化祿":"官祿宮","化權":"財帛宮","化科":"官祿宮","化忌":"父母宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"亥","流鉞":"酉","流昌":"申","流馬":"申"},"suiqian":{"戌":"太歲","亥":"晦氣","子":"喪門","丑":"貫索","寅":"官符","卯":"小耗","辰":"大耗","巳":"龍德","午":"白虎","未":"天德","申":"弔客","酉":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2007,"age":18,"gz":"丁亥","taisui_palace":"命宮","branch":"亥","sihua":["太陰化祿","天同化權","天機化科","巨門化忌"],"sihua_landing":{"化祿":"夫妻宮","化權":"官祿宮","化科":"財帛宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"亥","流鉞":"酉","流昌":"酉","流馬":"巳"},"suiqian":{"亥":"太歲","子":"晦氣","丑":"喪門","寅":"貫索","卯":"官符","辰":"小耗","巳":"大耗","午":"龍德","未":"白虎","申":"天德","酉":"弔客","戌":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2008,"age":19,"gz":"戊子","taisui_palace":"父母宮","branch":"子","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"丑","流鉞":"未","流昌":"申","流馬":"寅"},"suiqian":{"子":"太歲","丑":"晦氣","寅":"喪門","卯":"貫索","辰":"官符","巳":"小耗","午":"大耗","未":"龍德","申":"白虎","酉":"天德","戌":"弔客","亥":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2009,"age":20,"gz":"己丑","taisui_palace":"福德宮","branch":"丑","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"子","流鉞":"申","流昌":"酉","流馬":"亥"},"suiqian":{"丑":"太歲","寅":"晦氣","卯":"喪門","辰":"貫索","巳":"官符","午":"小耗","未":"大耗","申":"龍德","酉":"白虎","戌":"天德","亥":"弔客","子":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2010,"age":21,"gz":"庚寅","taisui_palace":"田宅宮","branch":"寅","sihua":["太陽化祿","武曲化權","太陰化科","天同化忌"],"sihua_landing":{"化祿":"遷移宮","化權":"交友宮","化科":"夫妻宮","化忌":"官祿宮"},"flow_stars":{"流祿":"申","流羊":"酉","流陀":"未","流魁":"丑","流鉞":"未","流昌":"亥","流馬":"申"},"suiqian":{"寅":"太歲","卯":"晦氣","辰":"喪門","巳":"貫索","午":"官符","未":"小耗","申":"大耗","酉":"龍德","戌":"白虎","亥":"天德","子":"弔客","丑":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2011,"age":22,"gz":"辛卯","taisui_palace":"官祿宮","branch":"卯","sihua":["巨門化祿","太陽化權","文曲化科","文昌化忌"],"sihua_landing":{"化祿":"命宮","化權":"遷移宮","化科":"命宮","化忌":"官祿宮"},"flow_stars":{"流祿":"酉","流羊":"戌","流陀":"申","流魁":"午","流鉞":"寅","流昌":"子","流馬":"巳"},"suiqian":{"卯":"太歲","辰":"晦氣","巳":"喪門","午":"貫索","未":"官符","申":"小耗","酉":"大耗","戌":"龍德","亥":"白虎","子":"天德","丑":"弔客","寅":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2012,"age":23,"gz":"壬辰","taisui_palace":"交友宮","branch":"辰","sihua":["天梁化祿","紫微化權","左輔化科","武曲化忌"],"sihua_landing":{"化祿":"福德宮","化權":"子女宮","化科":"子女宮","化忌":"交友宮"},"flow_stars":{"流祿":"亥","流羊":"子","流陀":"戌","流魁":"卯","流鉞":"巳","流昌":"寅","流馬":"寅"},"suiqian":{"辰":"太歲","巳":"晦氣","午":"喪門","未":"貫索","申":"官符","酉":"小耗","戌":"大耗","亥":"龍德","子":"白虎","丑":"天德","寅":"弔客","卯":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2013,"age":24,"gz":"癸巳","taisui_palace":"遷移宮","branch":"巳","sihua":["破軍化祿","巨門化權","太陰化科","貪狼化忌"],"sihua_landing":{"化祿":"疾厄宮","化權":"命宮","化科":"夫妻宮","化忌":"兄弟宮"},"flow_stars":{"流祿":"子","流羊":"丑","流陀":"亥","流魁":"卯","流鉞":"巳","流昌":"卯","流馬":"亥"},"suiqian":{"巳":"太歲","午":"晦氣","未":"喪門","申":"貫索","酉":"官符","戌":"小耗","亥":"大耗","子":"龍德","丑":"白虎","寅":"天德","卯":"弔客","辰":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false}
      ]},
      {"index":2,"palace":"夫妻宮","branch":"酉","stem":"乙","gz":"乙酉","ages":[25,34],"years":[2014,2023],"changsheng":"養","sihua":["天機化祿","天梁化權","紫微化科","太陰化忌"],"sihua_landing":{"化祿":"財帛宮","化權":"福德宮","化科":"子女宮","化忌":"夫妻宮"},"current":false,"liunian":[
        {"year":2014,"age":25,"gz":"甲午","taisui_palace":"疾厄宮","branch":"午","sihua":["廉貞化祿","破軍化權","武曲化科","太陽化忌"],"sihua_landing":{"化祿":"父母宮","化權":"疾厄宮","化科":"交友宮","化忌":"遷移宮"},"flow_stars":{"流祿":"寅","流羊":"卯","流陀":"丑","流魁":"丑","流鉞":"未","流昌":"巳","流馬":"申"},"suiqian":{"午":"太歲","未":"晦氣","申":"喪門","酉":"貫索","戌":"官符","亥":"小耗","子":"大耗","丑":"龍德","寅":"白虎","卯":"天德","辰":"弔客","巳":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2015,"age":26,"gz":"乙未","taisui_palace":"財帛宮","branch":"未","sihua":["天機化祿","天梁化權","紫微化科","太陰化忌"],"sihua_landing":{"化祿":"財帛宮","化權":"福德宮","化科":"子女宮","化忌":"夫妻宮"},"flow_stars":{"流祿":"卯","流羊":"辰","流陀":"寅","流魁":"子","流鉞":"申","流昌":"午","流馬":"巳"},"suiqian":{"未":"太歲","申":"晦氣","酉":"喪門","戌":"貫索","亥":"官符","子":"小耗","丑":"大耗","寅":"龍德","卯":"白虎","辰":"天德","巳":"弔客","午":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2016,"age":27,"gz":"丙申","taisui_palace":"子女宮","branch":"申","sihua":["天同化祿","天機化權","文昌化科","廉貞化忌"],"sihua_landing":{"化祿":"官祿宮","化權":"財帛宮","化科":"官祿宮","化忌":"父母宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"亥","流鉞":"酉","流昌":"申","流馬":"寅"},"suiqian":{"申":"太歲","酉":"晦氣","戌":"喪門","亥":"貫索","子":"官符","丑":"小耗","寅":"大耗","卯":"龍德","辰":"白虎","巳":"天德","午":"弔客","未":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2017,"age":28,"gz":"丁酉","taisui_palace":"夫妻宮","branch":"酉","sihua":["太陰化祿","天同化權","天機化科","巨門化忌"],"sihua_landing":{"化祿":"夫妻宮","化權":"官祿宮","化科":"財帛宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"亥","流鉞":"酉","流昌":"酉","流馬":"亥"},"suiqian":{"酉":"太歲","戌":"晦氣","亥":"喪門","子":"貫索","丑":"官符","寅":"小耗","卯":"大耗","辰":"龍德","巳":"白虎","午":"天德","未":"弔客","申":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2018,"age":29,"gz":"戊戌","taisui_palace":"兄弟宮","branch":"戌","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"丑","流鉞":"未","流昌":"申","流馬":"申"},"suiqian":{"戌":"太歲","亥":"晦氣","子":"喪門","丑":"貫索","寅":"官符","卯":"小耗","辰":"大耗","巳":"龍德","午":"白虎","未":"天德","申":"弔客","酉":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2019,"age":30,"gz":"己亥","taisui_palace":"命宮","branch":"亥","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"子","流鉞":"申","流昌":"酉","流馬":"巳"},"suiqian":{"亥":"太歲","子":"晦氣","丑":"喪門","寅":"貫索","卯":"官符","辰":"小耗","巳":"大耗","午":"龍德","未":"白虎","申":"天德","酉":"弔客","戌":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2020,"age":31,"gz":"庚子","taisui_palace":"父母宮","branch":"子","sihua":["太陽化祿","武曲化權","太陰化科","天同化忌"],"sihua_landing":{"化祿":"遷移宮","化權":"交友宮","化科":"夫妻宮","化忌":"官祿宮"},"flow_stars":{"流祿":"申","流羊":"酉","流陀":"未","流魁":"丑","流鉞":"未","流昌":"亥","流馬":"寅"},"suiqian":{"子":"太歲","丑":"晦氣","寅":"喪門","卯":"貫索","辰":"官符","巳":"小耗","午":"大耗","未":"龍德","申":"白虎","酉":"天德","戌":"弔客","亥":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2021,"age":32,"gz":"辛丑","taisui_palace":"福德宮","branch":"丑","sihua":["巨門化祿","太陽化權","文曲化科","文昌化忌"],"sihua_landing":{"化祿":"命宮","化權":"遷移宮","化科":"命宮","化忌":"官祿宮"},"flow_stars":{"流祿":"酉","流羊":"戌","流陀":"申","流魁":"午","流鉞":"寅","流昌":"子","流馬":"亥"},"suiqian":{"丑":"太歲","寅":"晦氣","卯":"喪門","辰":"貫索","巳":"官符","午":"小耗","未":"大耗","申":"龍德","酉":"白虎","戌":"天德","亥":"弔客","子":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2022,"age":33,"gz":"壬寅","taisui_palace":"田宅宮","branch":"寅","sihua":["天梁化祿","紫微化權","左輔化科","武曲化忌"],"sihua_landing":{"化祿":"福德宮","化權":"子女宮","化科":"子女宮","化忌":"交友宮"},"flow_stars":{"流祿":"亥","流羊":"子","流陀":"戌","流魁":"卯","流鉞":"巳","流昌":"寅","流馬":"申"},"suiqian":{"寅":"太歲","卯":"晦氣","辰":"喪門","巳":"貫索","午":"官符","未":"小耗","申":"大耗","酉":"龍德","戌":"白虎","亥":"天德","子":"弔客","丑":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2023,"age":34,"gz":"癸卯","taisui_palace":"官祿宮","branch":"卯","sihua":["破軍化祿","巨門化權","太陰化科","貪狼化忌"],"sihua_landing":{"化祿":"疾厄宮","化權":"命宮","化科":"夫妻宮","化忌":"兄弟宮"},"flow_stars":{"流祿":"子","流羊":"丑","流陀":"亥","流魁":"卯","流鉞":"巳","流昌":"卯","流馬":"巳"},"suiqian":{"卯":"太歲","辰":"晦氣","巳":"喪門","午":"貫索","未":"官符","申":"小耗","酉":"大耗","戌":"龍德","亥":"白虎","子":"天德","丑":"弔客","寅":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false}
      ]},
      {"index":3,"palace":"子女宮","branch":"申","stem":"甲","gz":"甲申","ages":[35,44],"years":[2024,2033],"changsheng":"長生","sihua":["廉貞化祿","破軍化權","武曲化科","太陽化忌"],"sihua_landing":{"化祿":"父母宮","化權":"疾厄宮","化科":"交友宮","化忌":"遷移宮"},"current":true,"liunian":[
        {"year":2024,"age":35,"gz":"甲辰","taisui_palace":"交友宮","branch":"辰","sihua":["廉貞化祿","破軍化權","武曲化科","太陽化忌"],"sihua_landing":{"化祿":"父母宮","化權":"疾厄宮","化科":"交友宮","化忌":"遷移宮"},"flow_stars":{"流祿":"寅","流羊":"卯","流陀":"丑","流魁":"丑","流鉞":"未","流昌":"巳","流馬":"寅"},"suiqian":{"辰":"太歲","巳":"晦氣","午":"喪門","未":"貫索","申":"官符","酉":"小耗","戌":"大耗","亥":"龍德","子":"白虎","丑":"天德","寅":"弔客","卯":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2025,"age":36,"gz":"乙巳","taisui_palace":"遷移宮","branch":"巳","sihua":["天機化祿","天梁化權","紫微化科","太陰化忌"],"sihua_landing":{"化祿":"財帛宮","化權":"福德宮","化科":"子女宮","化忌":"夫妻宮"},"flow_stars":{"流祿":"卯","流羊":"辰","流陀":"寅","流魁":"子","流鉞":"申","流昌":"午","流馬":"亥"},"suiqian":{"巳":"太歲","午":"晦氣","未":"喪門","申":"貫索","酉":"官符","戌":"小耗","亥":"大耗","子":"龍德","丑":"白虎","寅":"天德","卯":"弔客","辰":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2026,"age":37,"gz":"丙午","taisui_palace":"疾厄宮","branch":"午","sihua":["天同化祿","天機化權","文昌化科","廉貞化忌"],"sihua_landing":{"化祿":"官祿宮","化權":"財帛宮","化科":"官祿宮","化忌":"父母宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"亥","流鉞":"酉","流昌":"申","流馬":"申"},"suiqian":{"午":"太歲","未":"晦氣","申":"喪門","酉":"貫索","戌":"官符","亥":"小耗","子":"大耗","丑":"龍德","寅":"白虎","卯":"天德","辰":"弔客","巳":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":true},
        {"year":2027,"age":38,"gz":"丁未","taisui_palace":"財帛宮","branch":"未","sihua":["太陰化祿","天同化權","天機化科","巨門化忌"],"sihua_landing":{"化祿":"夫妻宮","化權":"官祿宮","化科":"財帛宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"亥","流鉞":"酉","流昌":"酉","流馬":"巳"},"suiqian":{"未":"太歲","申":"晦氣","酉":"喪門","戌":"貫索","亥":"官符","子":"小耗","丑":"大耗","寅":"龍德","卯":"白虎","辰":"天德","巳":"弔客","午":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2028,"age":39,"gz":"戊申","taisui_palace":"子女宮","branch":"申","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"丑","流鉞":"未","流昌":"申","流馬":"寅"},"suiqian":{"申":"太歲","酉":"晦氣","戌":"喪門","亥":"貫索","子":"官符","丑":"小耗","寅":"大耗","卯":"龍德","辰":"白虎","巳":"天德","午":"弔客","未":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2029,"age":40,"gz":"己酉","taisui_palace":"夫妻宮","branch":"酉","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"子","流鉞":"申","流昌":"酉","流馬":"亥"},"suiqian":{"酉":"太歲","戌":"晦氣","亥":"喪門","子":"貫索","丑":"官符","寅":"小耗","卯":"大耗","辰":"龍德","巳":"白虎","午":"天德","未":"弔客","申":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2030,"age":41,"gz":"庚戌","taisui_palace":"兄弟宮","branch":"戌","sihua":["太陽化祿","武曲化權","太陰化科","天同化忌"],"sihua_landing":{"化祿":"遷移宮","化權":"交友宮","化科":"夫妻宮","化忌":"官祿宮"},"flow_stars":{"流祿":"申","流羊":"酉","流陀":"未","流魁":"丑","流鉞":"未","流昌":"亥","流馬":"申"},"suiqian":{"戌":"太歲","亥":"晦氣","子":"喪門","丑":"貫索","寅":"官符","卯":"小耗","辰":"大耗","巳":"龍德","午":"白虎","未":"天德","申":"弔客","酉":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2031,"age":42,"gz":"辛亥","taisui_palace":"命宮","branch":"亥","sihua":["巨門化祿","太陽化權","文曲化科","文昌化忌"],"sihua_landing":{"化祿":"命宮","化權":"遷移宮","化科":"命宮","化忌":"官祿宮"},"flow_stars":{"流祿":"酉","流羊":"戌","流陀":"申","流魁":"午","流鉞":"寅","流昌":"子","流馬":"巳"},"suiqian":{"亥":"太歲","子":"晦氣","丑":"喪門","寅":"貫索","卯":"官符","辰":"小耗","巳":"大耗","午":"龍德","未":"白虎","申":"天德","酉":"弔客","戌":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2032,"age":43,"gz":"壬子","taisui_palace":"父母宮","branch":"子","sihua":["天梁化祿","紫微化權","左輔化科","武曲化忌"],"sihua_landing":{"化祿":"福德宮","化權":"子女宮","化科":"子女宮","化忌":"交友宮"},"flow_stars":{"流祿":"亥","流羊":"子","流陀":"戌","流魁":"卯","流鉞":"巳","流昌":"寅","流馬":"寅"},"suiqian":{"子":"太歲","丑":"晦氣","寅":"喪門","卯":"貫索","辰":"官符","巳":"小耗","午":"大耗","未":"龍德","申":"白虎","酉":"天德","戌":"弔客","亥":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2033,"age":44,"gz":"癸丑","taisui_palace":"福德宮","branch":"丑","sihua":["破軍化祿","巨門化權","太陰化科","貪狼化忌"],"sihua_landing":{"化祿":"疾厄宮","化權":"命宮","化科":"夫妻宮","化忌":"兄弟宮"},"flow_stars":{"流祿":"子","流羊":"丑","流陀":"亥","流魁":"卯","流鉞":"巳","流昌":"卯","流馬":"亥"},"suiqian":{"丑":"太歲","寅":"晦氣","卯":"喪門","辰":"貫索","巳":"官符","午":"小耗","未":"大耗","申":"龍德","酉":"白虎","戌":"天德","亥":"弔客","子":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false}
      ]},
      {"index":4,"palace":"財帛宮","branch":"未","stem":"癸","gz":"癸未","ages":[45,54],"years":[2034,2043],"changsheng":"沐浴","sihua":["破軍化祿","巨門化權","太陰化科","貪狼化忌"],"sihua_landing":{"化祿":"疾厄宮","化權":"命宮","化科":"夫妻宮","化忌":"兄弟宮"},"current":false,"liunian":[
        {"year":2034,"age":45,"gz":"甲寅","taisui_palace":"田宅宮","branch":"寅","sihua":["廉貞化祿","破軍化權","武曲化科","太陽化忌"],"sihua_landing":{"化祿":"父母宮","化權":"疾厄宮","化科":"交友宮","化忌":"遷移宮"},"flow_stars":{"流祿":"寅","流羊":"卯","流陀":"丑","流魁":"丑","流鉞":"未","流昌":"巳","流馬":"申"},"suiqian":{"寅":"太歲","卯":"晦氣","辰":"喪門","巳":"貫索","午":"官符","未":"小耗","申":"大耗","酉":"龍德","戌":"白虎","亥":"天德","子":"弔客","丑":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2035,"age":46,"gz":"乙卯","taisui_palace":"官祿宮","branch":"卯","sihua":["天機化祿","天梁化權","紫微化科","太陰化忌"],"sihua_landing":{"化祿":"財帛宮","化權":"福德宮","化科":"子女宮","化忌":"夫妻宮"},"flow_stars":{"流祿":"卯","流羊":"辰","流陀":"寅","流魁":"子","流鉞":"申","流昌":"午","流馬":"巳"},"suiqian":{"卯":"太歲","辰":"晦氣","巳":"喪門","午":"貫索","未":"官符","申":"小耗","酉":"大耗","戌":"龍德","亥":"白虎","子":"天德","丑":"弔客","寅":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2036,"age":47,"gz":"丙辰","taisui_palace":"交友宮","branch":"辰","sihua":["天同化祿","天機化權","文昌化科","廉貞化忌"],"sihua_landing":{"化祿":"官祿宮","化權":"財帛宮","化科":"官祿宮","化忌":"父母宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"亥","流鉞":"酉","流昌":"申","流馬":"寅"},"suiqian":{"辰":"太歲","巳":"晦氣","午":"喪門","未":"貫索","申":"官符","酉":"小耗","戌":"大耗","亥":"龍德","子":"白虎","丑":"天德","寅":"弔客","卯":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2037,"age":48,"gz":"丁巳","taisui_palace":"遷移宮","branch":"巳","sihua":["太陰化祿","天同化權","天機化科","巨門化忌"],"sihua_landing":{"化祿":"夫妻宮","化權":"官祿宮","化科":"財帛宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"亥","流鉞":"酉","流昌":"酉","流馬":"亥"},"suiqian":{"巳":"太歲","午":"晦氣","未":"喪門","申":"貫索","酉":"官符","戌":"小耗","亥":"大耗","子":"龍德","丑":"白虎","寅":"天德","卯":"弔客","辰":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2038,"age":49,"gz":"戊午","taisui_palace":"疾厄宮","branch":"午","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"丑","流鉞":"未","流昌":"申","流馬":"申"},"suiqian":{"午":"太歲","未":"晦氣","申":"喪門","酉":"貫索","戌":"官符","亥":"小耗","子":"大耗","丑":"龍德","寅":"白虎","卯":"天德","辰":"弔客","巳":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2039,"age":50,"gz":"己未","taisui_palace":"財帛宮","branch":"未","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"子","流鉞":"申","流昌":"酉","流馬":"巳"},"suiqian":{"未":"太歲","申":"晦氣","酉":"喪門","戌":"貫索","亥":"官符","子":"小耗","丑":"大耗","寅":"龍德","卯":"白虎","辰":"天德","巳":"弔客","午":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2040,"age":51,"gz":"庚申","taisui_palace":"子女宮","branch":"申","sihua":["太陽化祿","武曲化權","太陰化科","天同化忌"],"sihua_landing":{"化祿":"遷移宮","化權":"交友宮","化科":"夫妻宮","化忌":"官祿宮"},"flow_stars":{"流祿":"申","流羊":"酉","流陀":"未","流魁":"丑","流鉞":"未","流昌":"亥","流馬":"寅"},"suiqian":{"申":"太歲","酉":"晦氣","戌":"喪門","亥":"貫索","子":"官符","丑":"小耗","寅":"大耗","卯":"龍德","辰":"白虎","巳":"天德","午":"弔客","未":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2041,"age":52,"gz":"辛酉","taisui_palace":"夫妻宮","branch":"酉","sihua":["巨門化祿","太陽化權","文曲化科","文昌化忌"],"sihua_landing":{"化祿":"命宮","化權":"遷移宮","化科":"命宮","化忌":"官祿宮"},"flow_stars":{"流祿":"酉","流羊":"戌","流陀":"申","流魁":"午","流鉞":"寅","流昌":"子","流馬":"亥"},"suiqian":{"酉":"太歲","戌":"晦氣","亥":"喪門","子":"貫索","丑":"官符","寅":"小耗","卯":"大耗","辰":"龍德","巳":"白虎","午":"天德","未":"弔客","申":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2042,"age":53,"gz":"壬戌","taisui_palace":"兄弟宮","branch":"戌","sihua":["天梁化祿","紫微化權","左輔化科","武曲化忌"],"sihua_landing":{"化祿":"福德宮","化權":"子女宮","化科":"子女宮","化忌":"交友宮"},"flow_stars":{"流祿":"亥","流羊":"子","流陀":"戌","流魁":"卯","流鉞":"巳","流昌":"寅","流馬":"申"},"suiqian":{"戌":"太歲","亥":"晦氣","子":"喪門","丑":"貫索","寅":"官符","卯":"小耗","辰":"大耗","巳":"龍德","午":"白虎","未":"天德","申":"弔客","酉":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2043,"age":54,"gz":"癸亥","taisui_palace":"命宮","branch":"亥","sihua":["破軍化祿","巨門化權","太陰化科","貪狼化忌"],"sihua_landing":{"化祿":"疾厄宮","化權":"命宮","化科":"夫妻宮","化忌":"兄弟宮"},"flow_stars":{"流祿":"子","流羊":"丑","流陀":"亥","流魁":"卯","流鉞":"巳","流昌":"卯","流馬":"巳"},"suiqian":{"亥":"太歲","子":"晦氣","丑":"喪門","寅":"貫索","卯":"官符","辰":"小耗","巳":"大耗","午":"龍德","未":"白虎","申":"天德","酉":"弔客","戌":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false}
      ]},
      {"index":5,"palace":"疾厄宮","branch":"午","stem":"壬","gz":"壬午","ages":[55,64],"years":[2044,2053],"changsheng":"冠帶","sihua":["天梁化祿","紫微化權","左輔化科","武曲化忌"],"sihua_landing":{"化祿":"福德宮","化權":"子女宮","化科":"子女宮","化忌":"交友宮"},"current":false,"liunian":[
        {"year":2044,"age":55,"gz":"甲子","taisui_palace":"父母宮","branch":"子","sihua":["廉貞化祿","破軍化權","武曲化科","太陽化忌"],"sihua_landing":{"化祿":"父母宮","化權":"疾厄宮","化科":"交友宮","化忌":"遷移宮"},"flow_stars":{"流祿":"寅","流羊":"卯","流陀":"丑","流魁":"丑","流鉞":"未","流昌":"巳","流馬":"寅"},"suiqian":{"子":"太歲","丑":"晦氣","寅":"喪門","卯":"貫索","辰":"官符","巳":"小耗","午":"大耗","未":"龍德","申":"白虎","酉":"天德","戌":"弔客","亥":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2045,"age":56,"gz":"乙丑","taisui_palace":"福德宮","branch":"丑","sihua":["天機化祿","天梁化權","紫微化科","太陰化忌"],"sihua_landing":{"化祿":"財帛宮","化權":"福德宮","化科":"子女宮","化忌":"夫妻宮"},"flow_stars":{"流祿":"卯","流羊":"辰","流陀":"寅","流魁":"子","流鉞":"申","流昌":"午","流馬":"亥"},"suiqian":{"丑":"太歲","寅":"晦氣","卯":"喪門","辰":"貫索","巳":"官符","午":"小耗","未":"大耗","申":"龍德","酉":"白虎","戌":"天德","亥":"弔客","子":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2046,"age":57,"gz":"丙寅","taisui_palace":"田宅宮","branch":"寅","sihua":["天同化祿","天機化權","文昌化科","廉貞化忌"],"sihua_landing":{"化祿":"官祿宮","化權":"財帛宮","化科":"官祿宮","化忌":"父母宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"亥","流鉞":"酉","流昌":"申","流馬":"申"},"suiqian":{"寅":"太歲","卯":"晦氣","辰":"喪門","巳":"貫索","午":"官符","未":"小耗","申":"大耗","酉":"龍德","戌":"白虎","亥":"天德","子":"弔客","丑":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2047,"age":58,"gz":"丁卯","taisui_palace":"官祿宮","branch":"卯","sihua":["太陰化祿","天同化權","天機化科","巨門化忌"],"sihua_landing":{"化祿":"夫妻宮","化權":"官祿宮","化科":"財帛宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"亥","流鉞":"酉","流昌":"酉","流馬":"巳"},"suiqian":{"卯":"太歲","辰":"晦氣","巳":"喪門","午":"貫索","未":"官符","申":"小耗","酉":"大耗","戌":"龍德","亥":"白虎","子":"天德","丑":"弔客","寅":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2048,"age":59,"gz":"戊辰","taisui_palace":"交友宮","branch":"辰","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"丑","流鉞":"未","流昌":"申","流馬":"寅"},"suiqian":{"辰":"太歲","巳":"晦氣","午":"喪門","未":"貫索","申":"官符","酉":"小耗","戌":"大耗","亥":"龍德","子":"白虎","丑":"天德","寅":"弔客","卯":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2049,"age":60,"gz":"己巳","taisui_palace":"遷移宮","branch":"巳","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"子","流鉞":"申","流昌":"酉","流馬":"亥"},"suiqian":{"巳":"太歲","午":"晦氣","未":"喪門","申":"貫索","酉":"官符","戌":"小耗","亥":"大耗","子":"龍德","丑":"白虎","寅":"天德","卯":"弔客","辰":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2050,"age":61,"gz":"庚午","taisui_palace":"疾厄宮","branch":"午","sihua":["太陽化祿","武曲化權","太陰化科","天同化忌"],"sihua_landing":{"化祿":"遷移宮","化權":"交友宮","化科":"夫妻宮","化忌":"官祿宮"},"flow_stars":{"流祿":"申","流羊":"酉","流陀":"未","流魁":"丑","流鉞":"未","流昌":"亥","流馬":"申"},"suiqian":{"午":"太歲","未":"晦氣","申":"喪門","酉":"貫索","戌":"官符","亥":"小耗","子":"大耗","丑":"龍德","寅":"白虎","卯":"天德","辰":"弔客","巳":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2051,"age":62,"gz":"辛未","taisui_palace":"財帛宮","branch":"未","sihua":["巨門化祿","太陽化權","文曲化科","文昌化忌"],"sihua_landing":{"化祿":"命宮","化權":"遷移宮","化科":"命宮","化忌":"官祿宮"},"flow_stars":{"流祿":"酉","流羊":"戌","流陀":"申","流魁":"午","流鉞":"寅","流昌":"子","流馬":"巳"},"suiqian":{"未":"太歲","申":"晦氣","酉":"喪門","戌":"貫索","亥":"官符","子":"小耗","丑":"大耗","寅":"龍德","卯":"白虎","辰":"天德","巳":"弔客","午":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2052,"age":63,"gz":"壬申","taisui_palace":"子女宮","branch":"申","sihua":["天梁化祿","紫微化權","左輔化科","武曲化忌"],"sihua_landing":{"化祿":"福德宮","化權":"子女宮","化科":"子女宮","化忌":"交友宮"},"flow_stars":{"流祿":"亥","流羊":"子","流陀":"戌","流魁":"卯","流鉞":"巳","流昌":"寅","流馬":"寅"},"suiqian":{"申":"太歲","酉":"晦氣","戌":"喪門","亥":"貫索","子":"官符","丑":"小耗","寅":"大耗","卯":"龍德","辰":"白虎","巳":"天德","午":"弔客","未":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2053,"age":64,"gz":"癸酉","taisui_palace":"夫妻宮","branch":"酉","sihua":["破軍化祿","巨門化權","太陰化科","貪狼化忌"],"sihua_landing":{"化祿":"疾厄宮","化權":"命宮","化科":"夫妻宮","化忌":"兄弟宮"},"flow_stars":{"流祿":"子","流羊":"丑","流陀":"亥","流魁":"卯","流鉞":"巳","流昌":"卯","流馬":"亥"},"suiqian":{"酉":"太歲","戌":"晦氣","亥":"喪門","子":"貫索","丑":"官符","寅":"小耗","卯":"大耗","辰":"龍德","巳":"白虎","午":"天德","未":"弔客","申":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false}
      ]},
      {"index":6,"palace":"遷移宮","branch":"巳","stem":"辛","gz":"辛巳","ages":[65,74],"years":[2054,2063],"changsheng":"臨官","sihua":["巨門化祿","太陽化權","文曲化科","文昌化忌"],"sihua_landing":{"化祿":"命宮","化權":"遷移宮","化科":"命宮","化忌":"官祿宮"},"current":false,"liunian":[
        {"year":2054,"age":65,"gz":"甲戌","taisui_palace":"兄弟宮","branch":"戌","sihua":["廉貞化祿","破軍化權","武曲化科","太陽化忌"],"sihua_landing":{"化祿":"父母宮","化權":"疾厄宮","化科":"交友宮","化忌":"遷移宮"},"flow_stars":{"流祿":"寅","流羊":"卯","流陀":"丑","流魁":"丑","流鉞":"未","流昌":"巳","流馬":"申"},"suiqian":{"戌":"太歲","亥":"晦氣","子":"喪門","丑":"貫索","寅":"官符","卯":"小耗","辰":"大耗","巳":"龍德","午":"白虎","未":"天德","申":"弔客","酉":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2055,"age":66,"gz":"乙亥","taisui_palace":"命宮","branch":"亥","sihua":["天機化祿","天梁化權","紫微化科","太陰化忌"],"sihua_landing":{"化祿":"財帛宮","化權":"福德宮","化科":"子女宮","化忌":"夫妻宮"},"flow_stars":{"流祿":"卯","流羊":"辰","流陀":"寅","流魁":"子","流鉞":"申","流昌":"午","流馬":"巳"},"suiqian":{"亥":"太歲","子":"晦氣","丑":"喪門","寅":"貫索","卯":"官符","辰":"小耗","巳":"大耗","午":"龍德","未":"白虎","申":"天德","酉":"弔客","戌":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2056,"age":67,"gz":"丙子","taisui_palace":"父母宮","branch":"子","sihua":["天同化祿","天機化權","文昌化科","廉貞化忌"],"sihua_landing":{"化祿":"官祿宮","化權":"財帛宮","化科":"官祿宮","化忌":"父母宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"亥","流鉞":"酉","流昌":"申","流馬":"寅"},"suiqian":{"子":"太歲","丑":"晦氣","寅":"喪門","卯":"貫索","辰":"官符","巳":"小耗","午":"大耗","未":"龍德","申":"白虎","酉":"天德","戌":"弔客","亥":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2057,"age":68,"gz":"丁丑","taisui_palace":"福德宮","branch":"丑","sihua":["太陰化祿","天同化權","天機化科","巨門化忌"],"sihua_landing":{"化祿":"夫妻宮","化權":"官祿宮","化科":"財帛宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"亥","流鉞":"酉","流昌":"酉","流馬":"亥"},"suiqian":{"丑":"太歲","寅":"晦氣","卯":"喪門","辰":"貫索","巳":"官符","午":"小耗","未":"大耗","申":"龍德","酉":"白虎","戌":"天德","亥":"弔客","子":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2058,"age":69,"gz":"戊寅","taisui_palace":"田宅宮","branch":"寅","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"丑","流鉞":"未","流昌":"申","流馬":"申"},"suiqian":{"寅":"太歲","卯":"晦氣","辰":"喪門","巳":"貫索","午":"官符","未":"小耗","申":"大耗","酉":"龍德","戌":"白虎","亥":"天德","子":"弔客","丑":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2059,"age":70,"gz":"己卯","taisui_palace":"官祿宮","branch":"卯","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"子","流鉞":"申","流昌":"酉","流馬":"巳"},"suiqian":{"卯":"太歲","辰":"晦氣","巳":"喪門","午":"貫索","未":"官符","申":"小耗","酉":"大耗","戌":"龍德","亥":"白虎","子":"天德","丑":"弔客","寅":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2060,"age":71,"gz":"庚辰","taisui_palace":"交友宮","branch":"辰","sihua":["太陽化祿","武曲化權","太陰化科","天同化忌"],"sihua_landing":{"化祿":"遷移宮","化權":"交友宮","化科":"夫妻宮","化忌":"官祿宮"},"flow_stars":{"流祿":"申","流羊":"酉","流陀":"未","流魁":"丑","流鉞":"未","流昌":"亥","流馬":"寅"},"suiqian":{"辰":"太歲","巳":"晦氣","午":"喪門","未":"貫索","申":"官符","酉":"小耗","戌":"大耗","亥":"龍德","子":"白虎","丑":"天德","寅":"弔客","卯":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2061,"age":72,"gz":"辛巳","taisui_palace":"遷移宮","branch":"巳","sihua":["巨門化祿","太陽化權","文曲化科","文昌化忌"],"sihua_landing":{"化祿":"命宮","化權":"遷移宮","化科":"命宮","化忌":"官祿宮"},"flow_stars":{"流祿":"酉","流羊":"戌","流陀":"申","流魁":"午","流鉞":"寅","流昌":"子","流馬":"亥"},"suiqian":{"巳":"太歲","午":"晦氣","未":"喪門","申":"貫索","酉":"官符","戌":"小耗","亥":"大耗","子":"龍德","丑":"白虎","寅":"天德","卯":"弔客","辰":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2062,"age":73,"gz":"壬午","taisui_palace":"疾厄宮","branch":"午","sihua":["天梁化祿","紫微化權","左輔化科","武曲化忌"],"sihua_landing":{"化祿":"福德宮","化權":"子女宮","化科":"子女宮","化忌":"交友宮"},"flow_stars":{"流祿":"亥","流羊":"子","流陀":"戌","流魁":"卯","流鉞":"巳","流昌":"寅","流馬":"申"},"suiqian":{"午":"太歲","未":"晦氣","申":"喪門","酉":"貫索","戌":"官符","亥":"小耗","子":"大耗","丑":"龍德","寅":"白虎","卯":"天德","辰":"弔客","巳":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2063,"age":74,"gz":"癸未","taisui_palace":"財帛宮","branch":"未","sihua":["破軍化祿","巨門化權","太陰化科","貪狼化忌"],"sihua_landing":{"化祿":"疾厄宮","化權":"命宮","化科":"夫妻宮","化忌":"兄弟宮"},"flow_stars":{"流祿":"子","流羊":"丑","流陀":"亥","流魁":"卯","流鉞":"巳","流昌":"卯","流馬":"巳"},"suiqian":{"未":"太歲","申":"晦氣","酉":"喪門","戌":"貫索","亥":"官符","子":"小耗","丑":"大耗","寅":"龍德","卯":"白虎","辰":"天德","巳":"弔客","午":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false}
      ]},
      {"index":7,"palace":"交友宮","branch":"辰","stem":"庚","gz":"庚辰","ages":[75,84],"years":[2064,2073],"changsheng":"帝旺","sihua":["太陽化祿","武曲化權","太陰化科","天同化忌"],"sihua_landing":{"化祿":"遷移宮","化權":"交友宮","化科":"夫妻宮","化忌":"官祿宮"},"current":false,"liunian":[
        {"year":2064,"age":75,"gz":"甲申","taisui_palace":"子女宮","branch":"申","sihua":["廉貞化祿","破軍化權","武曲化科","太陽化忌"],"sihua_landing":{"化祿":"父母宮","化權":"疾厄宮","化科":"交友宮","化忌":"遷移宮"},"flow_stars":{"流祿":"寅","流羊":"卯","流陀":"丑","流魁":"丑","流鉞":"未","流昌":"巳","流馬":"寅"},"suiqian":{"申":"太歲","酉":"晦氣","戌":"喪門","亥":"貫索","子":"官符","丑":"小耗","寅":"大耗","卯":"龍德","辰":"白虎","巳":"天德","午":"弔客","未":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2065,"age":76,"gz":"乙酉","taisui_palace":"夫妻宮","branch":"酉","sihua":["天機化祿","天梁化權","紫微化科","太陰化忌"],"sihua_landing":{"化祿":"財帛宮","化權":"福德宮","化科":"子女宮","化忌":"夫妻宮"},"flow_stars":{"流祿":"卯","流羊":"辰","流陀":"寅","流魁":"子","流鉞":"申","流昌":"午","流馬":"亥"},"suiqian":{"酉":"太歲","戌":"晦氣","亥":"喪門","子":"貫索","丑":"官符","寅":"小耗","卯":"大耗","辰":"龍德","巳":"白虎","午":"天德","未":"弔客","申":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2066,"age":77,"gz":"丙戌","taisui_palace":"兄弟宮","branch":"戌","sihua":["天同化祿","天機化權","文昌化科","廉貞化忌"],"sihua_landing":{"化祿":"官祿宮","化權":"財帛宮","化科":"官祿宮","化忌":"父母宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"亥","流鉞":"酉","流昌":"申","流馬":"申"},"suiqian":{"戌":"太歲","亥":"晦氣","子":"喪門","丑":"貫索","寅":"官符","卯":"小耗","辰":"大耗","巳":"龍德","午":"白虎","未":"天德","申":"弔客","酉":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2067,"age":78,"gz":"丁亥","taisui_palace":"命宮","branch":"亥","sihua":["太陰化祿","天同化權","天機化科","巨門化忌"],"sihua_landing":{"化祿":"夫妻宮","化權":"官祿宮","化科":"財帛宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"亥","流鉞":"酉","流昌":"酉","流馬":"巳"},"suiqian":{"亥":"太歲","子":"晦氣","丑":"喪門","寅":"貫索","卯":"官符","辰":"小耗","巳":"大耗","午":"龍德","未":"白虎","申":"天德","酉":"弔客","戌":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2068,"age":79,"gz":"戊子","taisui_palace":"父母宮","branch":"子","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"丑","流鉞":"未","流昌":"申","流馬":"寅"},"suiqian":{"子":"太歲","丑":"晦氣","寅":"喪門","卯":"貫索","辰":"官符","巳":"小耗","午":"大耗","未":"龍德","申":"白虎","酉":"天德","戌":"弔客","亥":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2069,"age":80,"gz":"己丑","taisui_palace":"福德宮","branch":"丑","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"子","流鉞":"申","流昌":"酉","流馬":"亥"},"suiqian":{"丑":"太歲","寅":"晦氣","卯":"喪門","辰":"貫索","巳":"官符","午":"小耗","未":"大耗","申":"龍德","酉":"白虎","戌":"天德","亥":"弔客","子":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2070,"age":81,"gz":"庚寅","taisui_palace":"田宅宮","branch":"寅","sihua":["太陽化祿","武曲化權","太陰化科","天同化忌"],"sihua_landing":{"化祿":"遷移宮","化權":"交友宮","化科":"夫妻宮","化忌":"官祿宮"},"flow_stars":{"流祿":"申","流羊":"酉","流陀":"未","流魁":"丑","流鉞":"未","流昌":"亥","流馬":"申"},"suiqian":{"寅":"太歲","卯":"晦氣","辰":"喪門","巳":"貫索","午":"官符","未":"小耗","申":"大耗","酉":"龍德","戌":"白虎","亥":"天德","子":"弔客","丑":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2071,"age":82,"gz":"辛卯","taisui_palace":"官祿宮","branch":"卯","sihua":["巨門化祿","太陽化權","文曲化科","文昌化忌"],"sihua_landing":{"化祿":"命宮","化權":"遷移宮","化科":"命宮","化忌":"官祿宮"},"flow_stars":{"流祿":"酉","流羊":"戌","流陀":"申","流魁":"午","流鉞":"寅","流昌":"子","流馬":"巳"},"suiqian":{"卯":"太歲","辰":"晦氣","巳":"喪門","午":"貫索","未":"官符","申":"小耗","酉":"大耗","戌":"龍德","亥":"白虎","子":"天德","丑":"弔客","寅":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2072,"age":83,"gz":"壬辰","taisui_palace":"交友宮","branch":"辰","sihua":["天梁化祿","紫微化權","左輔化科","武曲化忌"],"sihua_landing":{"化祿":"福德宮","化權":"子女宮","化科":"子女宮","化忌":"交友宮"},"flow_stars":{"流祿":"亥","流羊":"子","流陀":"戌","流魁":"卯","流鉞":"巳","流昌":"寅","流馬":"寅"},"suiqian":{"辰":"太歲","巳":"晦氣","午":"喪門","未":"貫索","申":"官符","酉":"小耗","戌":"大耗","亥":"龍德","子":"白虎","丑":"天德","寅":"弔客","卯":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2073,"age":84,"gz":"癸巳","taisui_palace":"遷移宮","branch":"巳","sihua":["破軍化祿","巨門化權","太陰化科","貪狼化忌"],"sihua_landing":{"化祿":"疾厄宮","化權":"命宮","化科":"夫妻宮","化忌":"兄弟宮"},"flow_stars":{"流祿":"子","流羊":"丑","流陀":"亥","流魁":"卯","流鉞":"巳","流昌":"卯","流馬":"亥"},"suiqian":{"巳":"太歲","午":"晦氣","未":"喪門","申":"貫索","酉":"官符","戌":"小耗","亥":"大耗","子":"龍德","丑":"白虎","寅":"天德","卯":"弔客","辰":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false}
      ]},
      {"index":8,"palace":"官祿宮","branch":"卯","stem":"己","gz":"己卯","ages":[85,94],"years":[2074,2083],"changsheng":"衰","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"current":false,"liunian":[
        {"year":2074,"age":85,"gz":"甲午","taisui_palace":"疾厄宮","branch":"午","sihua":["廉貞化祿","破軍化權","武曲化科","太陽化忌"],"sihua_landing":{"化祿":"父母宮","化權":"疾厄宮","化科":"交友宮","化忌":"遷移宮"},"flow_stars":{"流祿":"寅","流羊":"卯","流陀":"丑","流魁":"丑","流鉞":"未","流昌":"巳","流馬":"申"},"suiqian":{"午":"太歲","未":"晦氣","申":"喪門","酉":"貫索","戌":"官符","亥":"小耗","子":"大耗","丑":"龍德","寅":"白虎","卯":"天德","辰":"弔客","巳":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2075,"age":86,"gz":"乙未","taisui_palace":"財帛宮","branch":"未","sihua":["天機化祿","天梁化權","紫微化科","太陰化忌"],"sihua_landing":{"化祿":"財帛宮","化權":"福德宮","化科":"子女宮","化忌":"夫妻宮"},"flow_stars":{"流祿":"卯","流羊":"辰","流陀":"寅","流魁":"子","流鉞":"申","流昌":"午","流馬":"巳"},"suiqian":{"未":"太歲","申":"晦氣","酉":"喪門","戌":"貫索","亥":"官符","子":"小耗","丑":"大耗","寅":"龍德","卯":"白虎","辰":"天德","巳":"弔客","午":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2076,"age":87,"gz":"丙申","taisui_palace":"子女宮","branch":"申","sihua":["天同化祿","天機化權","文昌化科","廉貞化忌"],"sihua_landing":{"化祿":"官祿宮","化權":"財帛宮","化科":"官祿宮","化忌":"父母宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"亥","流鉞":"酉","流昌":"申","流馬":"寅"},"suiqian":{"申":"太歲","酉":"晦氣","戌":"喪門","亥":"貫索","子":"官符","丑":"小耗","寅":"大耗","卯":"龍德","辰":"白虎","巳":"天德","午":"弔客","未":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2077,"age":88,"gz":"丁酉","taisui_palace":"夫妻宮","branch":"酉","sihua":["太陰化祿","天同化權","天機化科","巨門化忌"],"sihua_landing":{"化祿":"夫妻宮","化權":"官祿宮","化科":"財帛宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"亥","流鉞":"酉","流昌":"酉","流馬":"亥"},"suiqian":{"酉":"太歲","戌":"晦氣","亥":"喪門","子":"貫索","丑":"官符","寅":"小耗","卯":"大耗","辰":"龍德","巳":"白虎","午":"天德","未":"弔客","申":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2078,"age":89,"gz":"戊戌","taisui_palace":"兄弟宮","branch":"戌","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"丑","流鉞":"未","流昌":"申","流馬":"申"},"suiqian":{"戌":"太歲","亥":"晦氣","子":"喪門","丑":"貫索","寅":"官符","卯":"小耗","辰":"大耗","巳":"龍德","午":"白虎","未":"天德","申":"弔客","酉":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2079,"age":90,"gz":"己亥","taisui_palace":"命宮","branch":"亥","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"子","流鉞":"申","流昌":"酉","流馬":"巳"},"suiqian":{"亥":"太歲","子":"晦氣","丑":"喪門","寅":"貫索","卯":"官符","辰":"小耗","巳":"大耗","午":"龍德","未":"白虎","申":"天德","酉":"弔客","戌":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2080,"age":91,"gz":"庚子","taisui_palace":"父母宮","branch":"子","sihua":["太陽化祿","武曲化權","太陰化科","天同化忌"],"sihua_landing":{"化祿":"遷移宮","化權":"交友宮","化科":"夫妻宮","化忌":"官祿宮"},"flow_stars":{"流祿":"申","流羊":"酉","流陀":"未","流魁":"丑","流鉞":"未","流昌":"亥","流馬":"寅"},"suiqian":{"子":"太歲","丑":"晦氣","寅":"喪門","卯":"貫索","辰":"官符","巳":"小耗","午":"大耗","未":"龍德","申":"白虎","酉":"天德","戌":"弔客","亥":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2081,"age":92,"gz":"辛丑","taisui_palace":"福德宮","branch":"丑","sihua":["巨門化祿","太陽化權","文曲化科","文昌化忌"],"sihua_landing":{"化祿":"命宮","化權":"遷移宮","化科":"命宮","化忌":"官祿宮"},"flow_stars":{"流祿":"酉","流羊":"戌","流陀":"申","流魁":"午","流鉞":"寅","流昌":"子","流馬":"亥"},"suiqian":{"丑":"太歲","寅":"晦氣","卯":"喪門","辰":"貫索","巳":"官符","午":"小耗","未":"大耗","申":"龍德","酉":"白虎","戌":"天德","亥":"弔客","子":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2082,"age":93,"gz":"壬寅","taisui_palace":"田宅宮","branch":"寅","sihua":["天梁化祿","紫微化權","左輔化科","武曲化忌"],"sihua_landing":{"化祿":"福德宮","化權":"子女宮","化科":"子女宮","化忌":"交友宮"},"flow_stars":{"流祿":"亥","流羊":"子","流陀":"戌","流魁":"卯","流鉞":"巳","流昌":"寅","流馬":"申"},"suiqian":{"寅":"太歲","卯":"晦氣","辰":"喪門","巳":"貫索","午":"官符","未":"小耗","申":"大耗","酉":"龍德","戌":"白虎","亥":"天德","子":"弔客","丑":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2083,"age":94,"gz":"癸卯","taisui_palace":"官祿宮","branch":"卯","sihua":["破軍化祿","巨門化權","太陰化科","貪狼化忌"],"sihua_landing":{"化祿":"疾厄宮","化權":"命宮","化科":"夫妻宮","化忌":"兄弟宮"},"flow_stars":{"流祿":"子","流羊":"丑","流陀":"亥","流魁":"卯","流鉞":"巳","流昌":"卯","流馬":"巳"},"suiqian":{"卯":"太歲","辰":"晦氣","巳":"喪門","午":"貫索","未":"官符","申":"小耗","酉":"大耗","戌":"龍德","亥":"白虎","子":"天德","丑":"弔客","寅":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false}
      ]},
      {"index":9,"palace":"田宅宮","branch":"寅","stem":"戊","gz":"戊寅","ages":[95,104],"years":[2084,2093],"changsheng":"病","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"current":false,"liunian":[
        {"year":2084,"age":95,"gz":"甲辰","taisui_palace":"交友宮","branch":"辰","sihua":["廉貞化祿","破軍化權","武曲化科","太陽化忌"],"sihua_landing":{"化祿":"父母宮","化權":"疾厄宮","化科":"交友宮","化忌":"遷移宮"},"flow_stars":{"流祿":"寅","流羊":"卯","流陀":"丑","流魁":"丑","流鉞":"未","流昌":"巳","流馬":"寅"},"suiqian":{"辰":"太歲","巳":"晦氣","午":"喪門","未":"貫索","申":"官符","酉":"小耗","戌":"大耗","亥":"龍德","子":"白虎","丑":"天德","寅":"弔客","卯":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2085,"age":96,"gz":"乙巳","taisui_palace":"遷移宮","branch":"巳","sihua":["天機化祿","天梁化權","紫微化科","太陰化忌"],"sihua_landing":{"化祿":"財帛宮","化權":"福德宮","化科":"子女宮","化忌":"夫妻宮"},"flow_stars":{"流祿":"卯","流羊":"辰","流陀":"寅","流魁":"子","流鉞":"申","流昌":"午","流馬":"亥"},"suiqian":{"巳":"太歲","午":"晦氣","未":"喪門","申":"貫索","酉":"官符","戌":"小耗","亥":"大耗","子":"龍德","丑":"白虎","寅":"天德","卯":"弔客","辰":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2086,"age":97,"gz":"丙午","taisui_palace":"疾厄宮","branch":"午","sihua":["天同化祿","天機化權","文昌化科","廉貞化忌"],"sihua_landing":{"化祿":"官祿宮","化權":"財帛宮","化科":"官祿宮","化忌":"父母宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"亥","流鉞":"酉","流昌":"申","流馬":"申"},"suiqian":{"午":"太歲","未":"晦氣","申":"喪門","酉":"貫索","戌":"官符","亥":"小耗","子":"大耗","丑":"龍德","寅":"白虎","卯":"天德","辰":"弔客","巳":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2087,"age":98,"gz":"丁未","taisui_palace":"財帛宮","branch":"未","sihua":["太陰化祿","天同化權","天機化科","巨門化忌"],"sihua_landing":{"化祿":"夫妻宮","化權":"官祿宮","化科":"財帛宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"亥","流鉞":"酉","流昌":"酉","流馬":"巳"},"suiqian":{"未":"太歲","申":"晦氣","酉":"喪門","戌":"貫索","亥":"官符","子":"小耗","丑":"大耗","寅":"龍德","卯":"白虎","辰":"天德","巳":"弔客","午":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2088,"age":99,"gz":"戊申","taisui_palace":"子女宮","branch":"申","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"丑","流鉞":"未","流昌":"申","流馬":"寅"},"suiqian":{"申":"太歲","酉":"晦氣","戌":"喪門","亥":"貫索","子":"官符","丑":"小耗","寅":"大耗","卯":"龍德","辰":"白虎","巳":"天德","午":"弔客","未":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2089,"age":100,"gz":"己酉","taisui_palace":"夫妻宮","branch":"酉","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"子","流鉞":"申","流昌":"酉","流馬":"亥"},"suiqian":{"酉":"太歲","戌":"晦氣","亥":"喪門","子":"貫索","丑":"官符","寅":"小耗","卯":"大耗","辰":"龍德","巳":"白虎","午":"天德","未":"弔客","申":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2090,"age":101,"gz":"庚戌","taisui_palace":"兄弟宮","branch":"戌","sihua":["太陽化祿","武曲化權","太陰化科","天同化忌"],"sihua_landing":{"化祿":"遷移宮","化權":"交友宮","化科":"夫妻宮","化忌":"官祿宮"},"flow_stars":{"流祿":"申","流羊":"酉","流陀":"未","流魁":"丑","流鉞":"未","流昌":"亥","流馬":"申"},"suiqian":{"戌":"太歲","亥":"晦氣","子":"喪門","丑":"貫索","寅":"官符","卯":"小耗","辰":"大耗","巳":"龍德","午":"白虎","未":"天德","申":"弔客","酉":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2091,"age":102,"gz":"辛亥","taisui_palace":"命宮","branch":"亥","sihua":["巨門化祿","太陽化權","文曲化科","文昌化忌"],"sihua_landing":{"化祿":"命宮","化權":"遷移宮","化科":"命宮","化忌":"官祿宮"},"flow_stars":{"流祿":"酉","流羊":"戌","流陀":"申","流魁":"午","流鉞":"寅","流昌":"子","流馬":"巳"},"suiqian":{"亥":"太歲","子":"晦氣","丑":"喪門","寅":"貫索","卯":"官符","辰":"小耗","巳":"大耗","午":"龍德","未":"白虎","申":"天德","酉":"弔客","戌":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2092,"age":103,"gz":"壬子","taisui_palace":"父母宮","branch":"子","sihua":["天梁化祿","紫微化權","左輔化科","武曲化忌"],"sihua_landing":{"化祿":"福德宮","化權":"子女宮","化科":"子女宮","化忌":"交友宮"},"flow_stars":{"流祿":"亥","流羊":"子","流陀":"戌","流魁":"卯","流鉞":"巳","流昌":"寅","流馬":"寅"},"suiqian":{"子":"太歲","丑":"晦氣","寅":"喪門","卯":"貫索","辰":"官符","巳":"小耗","午":"大耗","未":"龍德","申":"白虎","酉":"天德","戌":"弔客","亥":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2093,"age":104,"gz":"癸丑","taisui_palace":"福德宮","branch":"丑","sihua":["破軍化祿","巨門化權","太陰化科","貪狼化忌"],"sihua_landing":{"化祿":"疾厄宮","化權":"命宮","化科":"夫妻宮","化忌":"兄弟宮"},"flow_stars":{"流祿":"子","流羊":"丑","流陀":"亥","流魁":"卯","流鉞":"巳","流昌":"卯","流馬":"亥"},"suiqian":{"丑":"太歲","寅":"晦氣","卯":"喪門","辰":"貫索","巳":"官符","午":"小耗","未":"大耗","申":"龍德","酉":"白虎","戌":"天德","亥":"弔客","子":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false}
      ]},
      {"index":10,"palace":"福德宮","branch":"丑","stem":"己","gz":"己丑","ages":[105,114],"years":[2094,2103],"changsheng":"死","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"current":false,"liunian":[
        {"year":2094,"age":105,"gz":"甲寅","taisui_palace":"田宅宮","branch":"寅","sihua":["廉貞化祿","破軍化權","武曲化科","太陽化忌"],"sihua_landing":{"化祿":"父母宮","化權":"疾厄宮","化科":"交友宮","化忌":"遷移宮"},"flow_stars":{"流祿":"寅","流羊":"卯","流陀":"丑","流魁":"丑","流鉞":"未","流昌":"巳","流馬":"申"},"suiqian":{"寅":"太歲","卯":"晦氣","辰":"喪門","巳":"貫索","午":"官符","未":"小耗","申":"大耗","酉":"龍德","戌":"白虎","亥":"天德","子":"弔客","丑":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2095,"age":106,"gz":"乙卯","taisui_palace":"官祿宮","branch":"卯","sihua":["天機化祿","天梁化權","紫微化科","太陰化忌"],"sihua_landing":{"化祿":"財帛宮","化權":"福德宮","化科":"子女宮","化忌":"夫妻宮"},"flow_stars":{"流祿":"卯","流羊":"辰","流陀":"寅","流魁":"子","流鉞":"申","流昌":"午","流馬":"巳"},"suiqian":{"卯":"太歲","辰":"晦氣","巳":"喪門","午":"貫索","未":"官符","申":"小耗","酉":"大耗","戌":"龍德","亥":"白虎","子":"天德","丑":"弔客","寅":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2096,"age":107,"gz":"丙辰","taisui_palace":"交友宮","branch":"辰","sihua":["天同化祿","天機化權","文昌化科","廉貞化忌"],"sihua_landing":{"化祿":"官祿宮","化權":"財帛宮","化科":"官祿宮","化忌":"父母宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"亥","流鉞":"酉","流昌":"申","流馬":"寅"},"suiqian":{"辰":"太歲","巳":"晦氣","午":"喪門","未":"貫索","申":"官符","酉":"小耗","戌":"大耗","亥":"龍德","子":"白虎","丑":"天德","寅":"弔客","卯":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2097,"age":108,"gz":"丁巳","taisui_palace":"遷移宮","branch":"巳","sihua":["太陰化祿","天同化權","天機化科","巨門化忌"],"sihua_landing":{"化祿":"夫妻宮","化權":"官祿宮","化科":"財帛宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"亥","流鉞":"酉","流昌":"酉","流馬":"亥"},"suiqian":{"巳":"太歲","午":"晦氣","未":"喪門","申":"貫索","酉":"官符","戌":"小耗","亥":"大耗","子":"龍德","丑":"白虎","寅":"天德","卯":"弔客","辰":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2098,"age":109,"gz":"戊午","taisui_palace":"疾厄宮","branch":"午","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"丑","流鉞":"未","流昌":"申","流馬":"申"},"suiqian":{"午":"太歲","未":"晦氣","申":"喪門","酉":"貫索","戌":"官符","亥":"小耗","子":"大耗","丑":"龍德","寅":"白虎","卯":"天德","辰":"弔客","巳":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2099,"age":110,"gz":"己未","taisui_palace":"財帛宮","branch":"未","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"子","流鉞":"申","流昌":"酉","流馬":"巳"},"suiqian":{"未":"太歲","申":"晦氣","酉":"喪門","戌":"貫索","亥":"官符","子":"小耗","丑":"大耗","寅":"龍德","卯":"白虎","辰":"天德","巳":"弔客","午":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2100,"age":111,"gz":"庚申","taisui_palace":"子女宮","branch":"申","sihua":["太陽化祿","武曲化權","太陰化科","天同化忌"],"sihua_landing":{"化祿":"遷移宮","化權":"交友宮","化科":"夫妻宮","化忌":"官祿宮"},"flow_stars":{"流祿":"申","流羊":"酉","流陀":"未","流魁":"丑","流鉞":"未","流昌":"亥","流馬":"寅"},"suiqian":{"申":"太歲","酉":"晦氣","戌":"喪門","亥":"貫索","子":"官符","丑":"小耗","寅":"大耗","卯":"龍德","辰":"白虎","巳":"天德","午":"弔客","未":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2101,"age":112,"gz":"辛酉","taisui_palace":"夫妻宮","branch":"酉","sihua":["巨門化祿","太陽化權","文曲化科","文昌化忌"],"sihua_landing":{"化祿":"命宮","化權":"遷移宮","化科":"命宮","化忌":"官祿宮"},"flow_stars":{"流祿":"酉","流羊":"戌","流陀":"申","流魁":"午","流鉞":"寅","流昌":"子","流馬":"亥"},"suiqian":{"酉":"太歲","戌":"晦氣","亥":"喪門","子":"貫索","丑":"官符","寅":"小耗","卯":"大耗","辰":"龍德","巳":"白虎","午":"天德","未":"弔客","申":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2102,"age":113,"gz":"壬戌","taisui_palace":"兄弟宮","branch":"戌","sihua":["天梁化祿","紫微化權","左輔化科","武曲化忌"],"sihua_landing":{"化祿":"福德宮","化權":"子女宮","化科":"子女宮","化忌":"交友宮"},"flow_stars":{"流祿":"亥","流羊":"子","流陀":"戌","流魁":"卯","流鉞":"巳","流昌":"寅","流馬":"申"},"suiqian":{"戌":"太歲","亥":"晦氣","子":"喪門","丑":"貫索","寅":"官符","卯":"小耗","辰":"大耗","巳":"龍德","午":"白虎","未":"天德","申":"弔客","酉":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2103,"age":114,"gz":"癸亥","taisui_palace":"命宮","branch":"亥","sihua":["破軍化祿","巨門化權","太陰化科","貪狼化忌"],"sihua_landing":{"化祿":"疾厄宮","化權":"命宮","化科":"夫妻宮","化忌":"兄弟宮"},"flow_stars":{"流祿":"子","流羊":"丑","流陀":"亥","流魁":"卯","流鉞":"巳","流昌":"卯","流馬":"巳"},"suiqian":{"亥":"太歲","子":"晦氣","丑":"喪門","寅":"貫索","卯":"官符","辰":"小耗","巳":"大耗","午":"龍德","未":"白虎","申":"天德","酉":"弔客","戌":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false}
      ]},
      {"index":11,"palace":"父母宮","branch":"子","stem":"戊","gz":"戊子","ages":[115,124],"years":[2104,2113],"changsheng":"墓","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"current":false,"liunian":[
        {"year":2104,"age":115,"gz":"甲子","taisui_palace":"父母宮","branch":"子","sihua":["廉貞化祿","破軍化權","武曲化科","太陽化忌"],"sihua_landing":{"化祿":"父母宮","化權":"疾厄宮","化科":"交友宮","化忌":"遷移宮"},"flow_stars":{"流祿":"寅","流羊":"卯","流陀":"丑","流魁":"丑","流鉞":"未","流昌":"巳","流馬":"寅"},"suiqian":{"子":"太歲","丑":"晦氣","寅":"喪門","卯":"貫索","辰":"官符","巳":"小耗","午":"大耗","未":"龍德","申":"白虎","酉":"天德","戌":"弔客","亥":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2105,"age":116,"gz":"乙丑","taisui_palace":"福德宮","branch":"丑","sihua":["天機化祿","天梁化權","紫微化科","太陰化忌"],"sihua_landing":{"化祿":"財帛宮","化權":"福德宮","化科":"子女宮","化忌":"夫妻宮"},"flow_stars":{"流祿":"卯","流羊":"辰","流陀":"寅","流魁":"子","流鉞":"申","流昌":"午","流馬":"亥"},"suiqian":{"丑":"太歲","寅":"晦氣","卯":"喪門","辰":"貫索","巳":"官符","午":"小耗","未":"大耗","申":"龍德","酉":"白虎","戌":"天德","亥":"弔客","子":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2106,"age":117,"gz":"丙寅","taisui_palace":"田宅宮","branch":"寅","sihua":["天同化祿","天機化權","文昌化科","廉貞化忌"],"sihua_landing":{"化祿":"官祿宮","化權":"財帛宮","化科":"官祿宮","化忌":"父母宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"亥","流鉞":"酉","流昌":"申","流馬":"申"},"suiqian":{"寅":"太歲","卯":"晦氣","辰":"喪門","巳":"貫索","午":"官符","未":"小耗","申":"大耗","酉":"龍德","戌":"白虎","亥":"天德","子":"弔客","丑":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2107,"age":118,"gz":"丁卯","taisui_palace":"官祿宮","branch":"卯","sihua":["太陰化祿","天同化權","天機化科","巨門化忌"],"sihua_landing":{"化祿":"夫妻宮","化權":"官祿宮","化科":"財帛宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"亥","流鉞":"酉","流昌":"酉","流馬":"巳"},"suiqian":{"卯":"太歲","辰":"晦氣","巳":"喪門","午":"貫索","未":"官符","申":"小耗","酉":"大耗","戌":"龍德","亥":"白虎","子":"天德","丑":"弔客","寅":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2108,"age":119,"gz":"戊辰","taisui_palace":"交友宮","branch":"辰","sihua":["貪狼化祿","太陰化權","右弼化科","天機化忌"],"sihua_landing":{"化祿":"兄弟宮","化權":"夫妻宮","化科":"疾厄宮","化忌":"財帛宮"},"flow_stars":{"流祿":"巳","流羊":"午","流陀":"辰","流魁":"丑","流鉞":"未","流昌":"申","流馬":"寅"},"suiqian":{"辰":"太歲","巳":"晦氣","午":"喪門","未":"貫索","申":"官符","酉":"小耗","戌":"大耗","亥":"龍德","子":"白虎","丑":"天德","寅":"弔客","卯":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2109,"age":120,"gz":"己巳","taisui_palace":"遷移宮","branch":"巳","sihua":["武曲化祿","貪狼化權","天梁化科","文曲化忌"],"sihua_landing":{"化祿":"交友宮","化權":"兄弟宮","化科":"福德宮","化忌":"命宮"},"flow_stars":{"流祿":"午","流羊":"未","流陀":"巳","流魁":"子","流鉞":"申","流昌":"酉","流馬":"亥"},"suiqian":{"巳":"太歲","午":"晦氣","未":"喪門","申":"貫索","酉":"官符","戌":"小耗","亥":"大耗","子":"龍德","丑":"白虎","寅":"天德","卯":"弔客","辰":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false},
        {"year":2110,"age":121,"gz":"庚午","taisui_palace":"疾厄宮","branch":"午","sihua":["太陽化祿","武曲化權","太陰化科","天同化忌"],"sihua_landing":{"化祿":"遷移宮","化權":"交友宮","化科":"夫妻宮","化忌":"官祿宮"},"flow_stars":{"流祿":"申","流羊":"酉","流陀":"未","流魁":"丑","流鉞":"未","流昌":"亥","流馬":"申"},"suiqian":{"午":"太歲","未":"晦氣","申":"喪門","酉":"貫索","戌":"官符","亥":"小耗","子":"大耗","丑":"龍德","寅":"白虎","卯":"天德","辰":"弔客","巳":"病符"},"jiangqian":{"午":"將星","未":"攀鞍","申":"歲驛","酉":"息神","戌":"華蓋","亥":"劫煞","子":"災煞","丑":"天煞","寅":"指背","卯":"咸池","辰":"月煞","巳":"亡神"},"current":false},
        {"year":2111,"age":122,"gz":"辛未","taisui_palace":"財帛宮","branch":"未","sihua":["巨門化祿","太陽化權","文曲化科","文昌化忌"],"sihua_landing":{"化祿":"命宮","化權":"遷移宮","化科":"命宮","化忌":"官祿宮"},"flow_stars":{"流祿":"酉","流羊":"戌","流陀":"申","流魁":"午","流鉞":"寅","流昌":"子","流馬":"巳"},"suiqian":{"未":"太歲","申":"晦氣","酉":"喪門","戌":"貫索","亥":"官符","子":"小耗","丑":"大耗","寅":"龍德","卯":"白虎","辰":"天德","巳":"弔客","午":"病符"},"jiangqian":{"卯":"將星","辰":"攀鞍","巳":"歲驛","午":"息神","未":"華蓋","申":"劫煞","酉":"災煞","戌":"天煞","亥":"指背","子":"咸池","丑":"月煞","寅":"亡神"},"current":false},
        {"year":2112,"age":123,"gz":"壬申","taisui_palace":"子女宮","branch":"申","sihua":["天梁化祿","紫微化權","左輔化科","武曲化忌"],"sihua_landing":{"化祿":"福德宮","化權":"子女宮","化科":"子女宮","化忌":"交友宮"},"flow_stars":{"流祿":"亥","流羊":"子","流陀":"戌","流魁":"卯","流鉞":"巳","流昌":"寅","流馬":"寅"},"suiqian":{"申":"太歲","酉":"晦氣","戌":"喪門","亥":"貫索","子":"官符","丑":"小耗","寅":"大耗","卯":"龍德","辰":"白虎","巳":"天德","午":"弔客","未":"病符"},"jiangqian":{"子":"將星","丑":"攀鞍","寅":"歲驛","卯":"息神","辰":"華蓋","巳":"劫煞","午":"災煞","未":"天煞","申":"指背","酉":"咸池","戌":"月煞","亥":"亡神"},"current":false},
        {"year":2113,"age":124,"gz":"癸酉","taisui_palace":"夫妻宮","branch":"酉","sihua":["破軍化祿","巨門化權","太陰化科","貪狼化忌"],"sihua_landing":{"化祿":"疾厄宮","化權":"命宮","化科":"夫妻宮","化忌":"兄弟宮"},"flow_stars":{"流祿":"子","流羊":"丑","流陀":"亥","流魁":"卯","流鉞":"巳","流昌":"卯","流馬":"亥"},"suiqian":{"酉":"太歲","戌":"晦氣","亥":"喪門","子":"貫索","丑":"官符","寅":"小耗","卯":"大耗","辰":"龍德","巳":"白虎","午":"天德","未":"弔客","申":"病符"},"jiangqian":{"酉":"將星","戌":"攀鞍","亥":"歲驛","子":"息神","丑":"華蓋","寅":"劫煞","卯":"災煞","辰":"天煞","巳":"指背","午":"咸池","未":"月煞","申":"亡神"},"current":false}
      ]}
    ]};
  const ENRICH = {"patterns": [{"name": "祿馬交馳", "palace": "子女", "broken": false, "stars": ["祿存", "天馬"]}, {"name": "文星朝命", "palace": "命宮", "broken": true, "stars": ["文昌", "文曲"]}, {"name": "文星暗拱", "palace": "命宮", "broken": false, "stars": ["文昌", "文曲"]}], "source": "x-iztro（MIT，iztro 的 Rust 移植）"};
  const ZW_FACTS = [
    {
      "id": "ziwei.daxian.current",
      "group": "大限",
      "label": "目前大限（37 歲）",
      "value": "子女宮（35–44 歲）",
      "note": "主星 紫微、天府；吉星 左輔；煞星 火星；祿存、天馬；大限四化（甲干）：廉貞化祿入父母宮、破軍化權入疾厄宮、武曲化科入交友宮、太陽化忌入遷移宮；大限十二長生 長生",
      "how": "第一大限從命宮起、以局數為起歲，每宮十年；陽男陰女順行（往父母宮）、陰男陽女逆行（往兄弟宮）。大限四化以大限宮干起。",
      "alternatives": []
    },
    {
      "id": "ziwei.liunian.2026",
      "group": "流年",
      "label": "2026 流年命宮",
      "value": "落在本命疾厄宮（午）：破軍",
      "note": "流年四化（丙干）：天同化祿、天機化權、文昌化科、廉貞化忌；四化落宮：天同化祿入官祿宮、天機化權入財帛宮、文昌化科入官祿宮、廉貞化忌入父母宮；流曜：流祿巳、流羊午、流陀辰、流魁亥、流鉞酉、流昌申、流馬申・今年",
      "how": "流年命宮＝該年地支所在的本命宮；流年四化以該年天干起；流祿羊陀魁鉞昌依年干、流馬依年支三合。",
      "alternatives": []
    },
    {
      "id": "ziwei.liunian.2027",
      "group": "流年",
      "label": "2027 流年命宮",
      "value": "落在本命財帛宮（未）：天機",
      "note": "流年四化（丁干）：太陰化祿、天同化權、天機化科、巨門化忌；四化落宮：太陰化祿入夫妻宮、天同化權入官祿宮、天機化科入財帛宮、巨門化忌入命宮；流曜：流祿午、流羊未、流陀巳、流魁亥、流鉞酉、流昌酉、流馬巳",
      "how": "流年命宮＝該年地支所在的本命宮；流年四化以該年天干起；流祿羊陀魁鉞昌依年干、流馬依年支三合。",
      "alternatives": []
    },
    {
      "id": "ziwei.liunian.2028",
      "group": "流年",
      "label": "2028 流年命宮",
      "value": "落在本命子女宮（申）：紫微、天府",
      "note": "流年四化（戊干）：貪狼化祿、太陰化權、右弼化科、天機化忌；四化落宮：貪狼化祿入兄弟宮、太陰化權入夫妻宮、右弼化科入疾厄宮、天機化忌入財帛宮；流曜：流祿巳、流羊午、流陀辰、流魁丑、流鉞未、流昌申、流馬寅",
      "how": "流年命宮＝該年地支所在的本命宮；流年四化以該年天干起；流祿羊陀魁鉞昌依年干、流馬依年支三合。",
      "alternatives": []
    }
  ];
  const patchZiwei = (chart, { keepStars = false } = {}) => {
    if (!chart || !chart.payload) return;
    for (const pl of chart.payload.palaces || []) {
      const src = PALACES.find((x) => x.branch === pl.branch);
      if (!src) continue;
      pl.changsheng = src.changsheng; pl.boshi = src.boshi;
      // 廟旺只標本宮真的有的星（合盤乙方的宮被改過星）
      const stars = new Set([...(pl.major || []), ...(pl.lucky || []), ...(pl.unlucky || []), ...(pl.other || [])]);
      pl.brightness = Object.fromEntries(Object.entries(src.brightness || {}).filter(([s, b]) => b && stars.has(s)));
      pl.adjective_stars = keepStars ? [] : clone(src.adjective_stars || []);
    }
    chart.payload.luck = clone(LUCK);
    chart.payload.enrich = clone(ENRICH);
    for (const f of ZW_FACTS) {
      const i = (chart.facts || []).findIndex((x) => x && x.id === f.id);
      if (i >= 0) chart.facts[i] = { ...chart.facts[i], ...clone(f) };
    }
  };
  patchZiwei(M.ziwei);
  patchZiwei(M.synastry && M.synastry.a_ziwei);
  patchZiwei(M.synastry && M.synastry.b_ziwei, { keepStars: true });

  // --- 流派 schema：旺衰多了 v2（預設）；各盤的 chart.school 重算
  const sm = M.schools && M.schools.schema && M.schools.schema.bazi && M.schools.schema.bazi.strength_method;
  if (sm) { sm.options = { score_v2: '旺衰 v2：月令旺相休囚死＋加權通根＋透干，附用神／調候／格局', score_v1: '旺衰 v1：課程簡化計分（月令±、天干生扶、通根）' }; sm.default = 'score_v2'; }
  if (typeof M.schoolFor === 'function') for (const c of [M.bazi, M.ziwei, M.bazi_b, M.synastry.a, M.synastry.b, M.synastry.a_ziwei, M.synastry.b_ziwei]) if (c) c.school = M.schoolFor({});

  // --- GET /api/cities（約 100 城，中／英／日別名）與 GET /api/geo?place=&date=（台灣日光節約時間依出生日套用）
  M.cities = [
    {"name":"Taipei","aliases":["台北","臺北","台北市","新北","新北市","Taipei City","New Taipei"],"latitude":25.04,"longitude":121.56,"tz":8},
    {"name":"Taoyuan","aliases":["桃園","桃園市"],"latitude":24.99,"longitude":121.3,"tz":8},
    {"name":"Hsinchu","aliases":["新竹","新竹市","新竹縣"],"latitude":24.8,"longitude":120.97,"tz":8},
    {"name":"Taichung","aliases":["台中","臺中","台中市"],"latitude":24.15,"longitude":120.67,"tz":8},
    {"name":"Changhua","aliases":["彰化"],"latitude":24.08,"longitude":120.54,"tz":8},
    {"name":"Chiayi","aliases":["嘉義"],"latitude":23.48,"longitude":120.45,"tz":8},
    {"name":"Tainan","aliases":["台南","臺南","台南市"],"latitude":22.99,"longitude":120.21,"tz":8},
    {"name":"Kaohsiung","aliases":["高雄","高雄市"],"latitude":22.63,"longitude":120.3,"tz":8},
    {"name":"Pingtung","aliases":["屏東"],"latitude":22.67,"longitude":120.49,"tz":8},
    {"name":"Yilan","aliases":["宜蘭"],"latitude":24.76,"longitude":121.75,"tz":8},
    {"name":"Hualien","aliases":["花蓮"],"latitude":23.99,"longitude":121.6,"tz":8},
    {"name":"Taitung","aliases":["台東","臺東"],"latitude":22.76,"longitude":121.14,"tz":8},
    {"name":"Keelung","aliases":["基隆"],"latitude":25.13,"longitude":121.74,"tz":8},
    {"name":"Hong Kong","aliases":["香港","HK"],"latitude":22.3,"longitude":114.17,"tz":8},
    {"name":"Macau","aliases":["澳門"],"latitude":22.2,"longitude":113.54,"tz":8},
    {"name":"Beijing","aliases":["北京"],"latitude":39.9,"longitude":116.4,"tz":8},
    {"name":"Shanghai","aliases":["上海"],"latitude":31.23,"longitude":121.47,"tz":8},
    {"name":"Guangzhou","aliases":["廣州","广州"],"latitude":23.13,"longitude":113.26,"tz":8},
    {"name":"Shenzhen","aliases":["深圳"],"latitude":22.54,"longitude":114.06,"tz":8},
    {"name":"Chengdu","aliases":["成都"],"latitude":30.57,"longitude":104.07,"tz":8},
    {"name":"Chongqing","aliases":["重慶","重庆"],"latitude":29.56,"longitude":106.55,"tz":8},
    {"name":"Wuhan","aliases":["武漢","武汉"],"latitude":30.59,"longitude":114.31,"tz":8},
    {"name":"Xi'an","aliases":["Xian","西安"],"latitude":34.34,"longitude":108.94,"tz":8},
    {"name":"Hangzhou","aliases":["杭州"],"latitude":30.27,"longitude":120.15,"tz":8},
    {"name":"Nanjing","aliases":["南京"],"latitude":32.06,"longitude":118.8,"tz":8},
    {"name":"Xiamen","aliases":["廈門","厦门"],"latitude":24.48,"longitude":118.09,"tz":8},
    {"name":"Fuzhou","aliases":["福州"],"latitude":26.07,"longitude":119.3,"tz":8},
    {"name":"Harbin","aliases":["哈爾濱","哈尔滨"],"latitude":45.8,"longitude":126.53,"tz":8},
    {"name":"Urumqi","aliases":["烏魯木齊","乌鲁木齐"],"latitude":43.83,"longitude":87.62,"tz":8},
    {"name":"Lhasa","aliases":["拉薩","拉萨"],"latitude":29.65,"longitude":91.11,"tz":8},
    {"name":"Singapore","aliases":["新加坡"],"latitude":1.35,"longitude":103.82,"tz":8},
    {"name":"Kuala Lumpur","aliases":["吉隆坡"],"latitude":3.14,"longitude":101.69,"tz":8},
    {"name":"Manila","aliases":["馬尼拉","马尼拉"],"latitude":14.6,"longitude":120.98,"tz":8},
    {"name":"Tokyo","aliases":["東京","东京"],"latitude":35.68,"longitude":139.69,"tz":9},
    {"name":"Osaka","aliases":["大阪"],"latitude":34.69,"longitude":135.5,"tz":9},
    {"name":"Kyoto","aliases":["京都"],"latitude":35.01,"longitude":135.77,"tz":9},
    {"name":"Nagoya","aliases":["名古屋"],"latitude":35.18,"longitude":136.91,"tz":9},
    {"name":"Sapporo","aliases":["札幌"],"latitude":43.06,"longitude":141.35,"tz":9},
    {"name":"Fukuoka","aliases":["福岡","福冈"],"latitude":33.59,"longitude":130.4,"tz":9},
    {"name":"Seoul","aliases":["首爾","首尔","서울"],"latitude":37.57,"longitude":126.98,"tz":9},
    {"name":"Busan","aliases":["釜山","부산"],"latitude":35.18,"longitude":129.08,"tz":9},
    {"name":"Bangkok","aliases":["曼谷"],"latitude":13.76,"longitude":100.5,"tz":7},
    {"name":"Hanoi","aliases":["河內","河内"],"latitude":21.03,"longitude":105.85,"tz":7},
    {"name":"Ho Chi Minh City","aliases":["Saigon","胡志明市","西貢"],"latitude":10.82,"longitude":106.63,"tz":7},
    {"name":"Jakarta","aliases":["雅加達","雅加达"],"latitude":-6.21,"longitude":106.85,"tz":7},
    {"name":"Yangon","aliases":["仰光"],"latitude":16.87,"longitude":96.2,"tz":6.5},
    {"name":"Kolkata","aliases":["Calcutta","加爾各答"],"latitude":22.57,"longitude":88.36,"tz":5.5},
    {"name":"Mumbai","aliases":["Bombay","孟買"],"latitude":19.08,"longitude":72.88,"tz":5.5},
    {"name":"New Delhi","aliases":["Delhi","新德里"],"latitude":28.61,"longitude":77.21,"tz":5.5},
    {"name":"Bangalore","aliases":["Bengaluru","班加羅爾"],"latitude":12.97,"longitude":77.59,"tz":5.5},
    {"name":"Chennai","aliases":["Madras","清奈"],"latitude":13.08,"longitude":80.27,"tz":5.5},
    {"name":"Dubai","aliases":["杜拜","迪拜"],"latitude":25.2,"longitude":55.27,"tz":4},
    {"name":"Moscow","aliases":["莫斯科"],"latitude":55.76,"longitude":37.62,"tz":3},
    {"name":"Istanbul","aliases":["伊斯坦堡"],"latitude":41.01,"longitude":28.98,"tz":3},
    {"name":"Athens","aliases":["雅典"],"latitude":37.98,"longitude":23.73,"tz":2},
    {"name":"Cairo","aliases":["開羅"],"latitude":30.04,"longitude":31.24,"tz":2},
    {"name":"Berlin","aliases":["柏林"],"latitude":52.52,"longitude":13.41,"tz":1},
    {"name":"Munich","aliases":["München","慕尼黑"],"latitude":48.14,"longitude":11.58,"tz":1},
    {"name":"Vienna","aliases":["Wien","維也納"],"latitude":48.21,"longitude":16.37,"tz":1},
    {"name":"Zurich","aliases":["Zürich","蘇黎世"],"latitude":47.38,"longitude":8.54,"tz":1},
    {"name":"Paris","aliases":["巴黎"],"latitude":48.86,"longitude":2.35,"tz":1},
    {"name":"Amsterdam","aliases":["阿姆斯特丹"],"latitude":52.37,"longitude":4.9,"tz":1},
    {"name":"Brussels","aliases":["布魯塞爾"],"latitude":50.85,"longitude":4.35,"tz":1},
    {"name":"Rome","aliases":["Roma","羅馬"],"latitude":41.9,"longitude":12.5,"tz":1},
    {"name":"Milan","aliases":["Milano","米蘭"],"latitude":45.46,"longitude":9.19,"tz":1},
    {"name":"Madrid","aliases":["馬德里"],"latitude":40.42,"longitude":-3.7,"tz":1},
    {"name":"Barcelona","aliases":["巴塞隆納"],"latitude":41.39,"longitude":2.17,"tz":1},
    {"name":"Stockholm","aliases":["斯德哥爾摩"],"latitude":59.33,"longitude":18.07,"tz":1},
    {"name":"Copenhagen","aliases":["哥本哈根"],"latitude":55.68,"longitude":12.57,"tz":1},
    {"name":"Warsaw","aliases":["華沙"],"latitude":52.23,"longitude":21.01,"tz":1},
    {"name":"London","aliases":["倫敦","伦敦"],"latitude":51.51,"longitude":-0.13,"tz":0},
    {"name":"Manchester","aliases":["曼徹斯特"],"latitude":53.48,"longitude":-2.24,"tz":0},
    {"name":"Edinburgh","aliases":["愛丁堡"],"latitude":55.95,"longitude":-3.19,"tz":0},
    {"name":"Dublin","aliases":["都柏林"],"latitude":53.35,"longitude":-6.26,"tz":0},
    {"name":"Lisbon","aliases":["里斯本"],"latitude":38.72,"longitude":-9.14,"tz":0},
    {"name":"São Paulo","aliases":["Sao Paulo","聖保羅"],"latitude":-23.55,"longitude":-46.63,"tz":-3},
    {"name":"Buenos Aires","aliases":["布宜諾斯艾利斯"],"latitude":-34.6,"longitude":-58.38,"tz":-3},
    {"name":"Rio de Janeiro","aliases":["里約"],"latitude":-22.91,"longitude":-43.17,"tz":-3},
    {"name":"New York","aliases":["NYC","紐約","纽约"],"latitude":40.71,"longitude":-74.01,"tz":-5},
    {"name":"Boston","aliases":["波士頓"],"latitude":42.36,"longitude":-71.06,"tz":-5},
    {"name":"Washington","aliases":["Washington DC","華盛頓"],"latitude":38.91,"longitude":-77.04,"tz":-5},
    {"name":"Toronto","aliases":["多倫多"],"latitude":43.65,"longitude":-79.38,"tz":-5},
    {"name":"Montreal","aliases":["蒙特婁"],"latitude":45.5,"longitude":-73.57,"tz":-5},
    {"name":"Miami","aliases":["邁阿密"],"latitude":25.76,"longitude":-80.19,"tz":-5},
    {"name":"Chicago","aliases":["芝加哥"],"latitude":41.88,"longitude":-87.63,"tz":-6},
    {"name":"Houston","aliases":["休士頓"],"latitude":29.76,"longitude":-95.37,"tz":-6},
    {"name":"Dallas","aliases":["達拉斯"],"latitude":32.78,"longitude":-96.8,"tz":-6},
    {"name":"Mexico City","aliases":["墨西哥城"],"latitude":19.43,"longitude":-99.13,"tz":-6},
    {"name":"Denver","aliases":["丹佛"],"latitude":39.74,"longitude":-104.99,"tz":-7},
    {"name":"Phoenix","aliases":["鳳凰城"],"latitude":33.45,"longitude":-112.07,"tz":-7},
    {"name":"Los Angeles","aliases":["LA","洛杉磯","洛杉矶"],"latitude":34.05,"longitude":-118.24,"tz":-8},
    {"name":"San Francisco","aliases":["SF","舊金山","三藩市"],"latitude":37.77,"longitude":-122.42,"tz":-8},
    {"name":"San Jose","aliases":["聖荷西"],"latitude":37.34,"longitude":-121.89,"tz":-8},
    {"name":"Seattle","aliases":["西雅圖"],"latitude":47.61,"longitude":-122.33,"tz":-8},
    {"name":"Vancouver","aliases":["溫哥華"],"latitude":49.28,"longitude":-123.12,"tz":-8},
    {"name":"Honolulu","aliases":["檀香山"],"latitude":21.31,"longitude":-157.86,"tz":-10},
    {"name":"Sydney","aliases":["雪梨","悉尼"],"latitude":-33.87,"longitude":151.21,"tz":10},
    {"name":"Melbourne","aliases":["墨爾本"],"latitude":-37.81,"longitude":144.96,"tz":10},
    {"name":"Brisbane","aliases":["布里斯本"],"latitude":-27.47,"longitude":153.03,"tz":10},
    {"name":"Perth","aliases":["伯斯"],"latitude":-31.95,"longitude":115.86,"tz":8},
    {"name":"Auckland","aliases":["奧克蘭"],"latitude":-36.85,"longitude":174.76,"tz":12}
  ];
  M.geo = {
    "台北_1975": {
      "name": "Taipei",
      "latitude": 25.04,
      "longitude": 121.56,
      "tz_offset_hours": 9,
      "dst": true,
      "note": "台灣日光節約時間 1975（4/1–9/30）時鐘撥快 1 小時 → UTC+9"
    },
    "台北_1990": {
      "name": "Taipei",
      "latitude": 25.04,
      "longitude": 121.56,
      "tz_offset_hours": 8,
      "dst": false,
      "note": ""
    },
    "台中": {
      "name": "Taichung",
      "latitude": 24.15,
      "longitude": 120.67,
      "tz_offset_hours": 8,
      "dst": false,
      "note": ""
    }
  };   // 幾個範例回應（/api/geo 的形狀）
  const TAIWAN_DST = {"1946":[[5,15],[9,30]],"1947":[[4,15],[10,31]],"1948":[[5,1],[9,30]],"1949":[[5,1],[9,30]],"1950":[[5,1],[9,30]],"1951":[[5,1],[9,30]],"1952":[[3,1],[10,31]],"1953":[[4,1],[10,31]],"1954":[[4,1],[10,31]],"1955":[[4,1],[9,30]],"1956":[[4,1],[9,30]],"1957":[[4,1],[9,30]],"1958":[[4,1],[9,30]],"1959":[[4,1],[9,30]],"1960":[[6,1],[9,30]],"1961":[[6,1],[9,30]],"1974":[[4,1],[9,30]],"1975":[[4,1],[9,30]],"1979":[[7,1],[9,30]]};
  const TAIWAN_CITIES = 13;                                  // 城市表前 13 筆是台灣
  M.geoLookup = (place, date) => {
    const q = String(place || '').trim().toLowerCase();
    if (!q) return { name: null, message: '請輸入出生地' };
    let best = null, bestLen = 0, bestIdx = -1;
    M.cities.forEach((c, idx) => {
      for (const n of [c.name, ...(c.aliases || [])]) {
        const nl = String(n).toLowerCase();
        const ascii = /^[\x00-\x7f]*$/.test(nl);
        const hit = q === nl || (ascii ? nl.length >= 3 && new RegExp('(?<![a-z])' + nl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?![a-z])').test(q) : nl.length >= 2 && q.includes(nl));
        if (hit && nl.length > bestLen) { best = c; bestLen = nl.length; bestIdx = idx; }
      }
    });
    if (!best) return { name: null, message: `查不到「${place}」，請手動填經度與時區` };
    const m = String(date || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    const w = m && TAIWAN_DST[m[1]];
    const inWin = (md) => (w[0][0] < md[0] || (w[0][0] === md[0] && w[0][1] <= md[1])) && (md[0] < w[1][0] || (md[0] === w[1][0] && md[1] <= w[1][1]));
    const dst = Boolean(w && bestIdx < TAIWAN_CITIES && inWin([Number(m[2]), Number(m[3])]));
    return { name: best.name, latitude: best.latitude, longitude: best.longitude, tz_offset_hours: best.tz + (dst ? 1 : 0), dst,
      note: dst ? `台灣日光節約時間 ${m[1]}（${w[0][0]}/${w[0][1]}–${w[1][0]}/${w[1][1]}）時鐘撥快 1 小時 → UTC+9` : '' };
  };
})(window.MOCK_DATA);

// 姓名學（陳美玲，出生資料同小美）：ChartData 與離線解讀由 fortune.chart／fortune.reading 實際產生。
window.MOCK_DATA.xingming = {
  "system": "xingming",
  "system_zh": "姓名學",
  "subject": "小美・1990-06-15 14:30・台北",
  "birth": {
    "name": "小美",
    "full_name": "陳美玲",
    "birth_date": "1990-06-15",
    "birth_time": "14:30:00",
    "gender": "female",
    "place": "台北",
    "longitude": 121.5,
    "tz_offset_hours": 8.0,
    "use_true_solar_time": null
  },
  "cast_at": "2026-10-08T10:00:00",
  "facts": [
    {
      "id": "xingming.name",
      "group": "姓名",
      "label": "姓名",
      "value": "陳美玲",
      "note": "單姓「陳」、2 字名「美玲」；第一個字當姓；複姓或冠夫姓請在姓與名之間加空白（例：歐陽 娜娜）",
      "how": "",
      "alternatives": []
    },
    {
      "id": "xingming.char.1",
      "group": "筆畫",
      "label": "陳（姓）",
      "value": "16 畫",
      "note": "康熙 16 畫、現代 10 畫",
      "how": "康熙筆畫：部首阜（左阝） 8 畫（還原原形）＋其餘 8 畫＝16（Unihan kRSUnicode 170.8）",
      "alternatives": [
        {
          "switch": "xingming.stroke_basis",
          "option": "modern",
          "label": "現代筆畫（照字形數）",
          "value": "10 畫"
        }
      ]
    },
    {
      "id": "xingming.char.2",
      "group": "筆畫",
      "label": "美（名）",
      "value": "9 畫",
      "note": "康熙 9 畫、現代 9 畫",
      "how": "康熙筆畫：部首羊 6 畫＋其餘 3 畫＝9（Unihan kRSUnicode 123.3）",
      "alternatives": []
    },
    {
      "id": "xingming.char.3",
      "group": "筆畫",
      "label": "玲（名）",
      "value": "10 畫",
      "note": "康熙 10 畫、現代 9 畫",
      "how": "康熙筆畫：部首玉（王） 5 畫（還原原形）＋其餘 5 畫＝10（Unihan kRSUnicode 96.5）",
      "alternatives": [
        {
          "switch": "xingming.stroke_basis",
          "option": "modern",
          "label": "現代筆畫（照字形數）",
          "value": "9 畫"
        }
      ]
    },
    {
      "id": "xingming.ge.tian",
      "group": "五格",
      "label": "天格",
      "value": "17・金・吉",
      "note": "陽數；單姓：陳16＋假數 1；祖運：姓氏帶來的先天格，多數流派認為影響小、不單獨論吉凶",
      "how": "單姓：姓的筆畫＋假數 1；複姓：兩字相加。數理吉凶查 81 數理表（超過 81 減 80 循環）；五行看尾數：1、2 木，3、4 火，5、6 土，7、8 金，9、0 水；奇數陽、偶數陰。",
      "alternatives": [
        {
          "switch": "xingming.stroke_basis",
          "option": "modern",
          "label": "現代筆畫（照字形數）",
          "value": "11・木・吉"
        },
        {
          "switch": "xingming.jiashu",
          "option": "off",
          "label": "不加假數",
          "value": "16・土・吉"
        }
      ]
    },
    {
      "id": "xingming.ge.ren",
      "group": "五格",
      "label": "人格",
      "value": "25・土・吉",
      "note": "陽數；姓末字＋名首字：陳16＋美9；主運：姓名的核心，主性格與一生主軸",
      "how": "姓的最後一字＋名的第一字。數理吉凶查 81 數理表（超過 81 減 80 循環）；五行看尾數：1、2 木，3、4 火，5、6 土，7、8 金，9、0 水；奇數陽、偶數陰。",
      "alternatives": [
        {
          "switch": "xingming.stroke_basis",
          "option": "modern",
          "label": "現代筆畫（照字形數）",
          "value": "19・水・凶"
        }
      ]
    },
    {
      "id": "xingming.ge.di",
      "group": "五格",
      "label": "地格",
      "value": "19・水・凶",
      "note": "陽數；名字筆畫合計：美9＋玲10；前運：名字的部分，主早年、家庭、配偶與子女",
      "how": "單名：名的筆畫＋假數 1；雙名以上：名字各字相加。數理吉凶查 81 數理表（超過 81 減 80 循環）；五行看尾數：1、2 木，3、4 火，5、6 土，7、8 金，9、0 水；奇數陽、偶數陰。",
      "alternatives": [
        {
          "switch": "xingming.stroke_basis",
          "option": "modern",
          "label": "現代筆畫（照字形數）",
          "value": "18・金・吉"
        }
      ]
    },
    {
      "id": "xingming.ge.wai",
      "group": "五格",
      "label": "外格",
      "value": "11・木・吉",
      "note": "陽數；天格＋地格－人格：17＋19－25；副運：主人際、外在環境與社交",
      "how": "天格＋地格－人格（加假數時，單姓雙名＝1＋名末字、單姓單名固定為 2）。數理吉凶查 81 數理表（超過 81 減 80 循環）；五行看尾數：1、2 木，3、4 火，5、6 土，7、8 金，9、0 水；奇數陽、偶數陰。",
      "alternatives": [
        {
          "switch": "xingming.stroke_basis",
          "option": "modern",
          "label": "現代筆畫（照字形數）",
          "value": "10・水・凶"
        },
        {
          "switch": "xingming.jiashu",
          "option": "off",
          "label": "不加假數",
          "value": "10・水・凶"
        }
      ]
    },
    {
      "id": "xingming.ge.zong",
      "group": "五格",
      "label": "總格",
      "value": "35・土・吉",
      "note": "陽數；全部筆畫合計（不含假數）：陳16＋美9＋玲10；後運：全名合計，主中晚年與整體",
      "how": "姓名全部筆畫相加，不含假數。數理吉凶查 81 數理表（超過 81 減 80 循環）；五行看尾數：1、2 木，3、4 火，5、6 土，7、8 金，9、0 水；奇數陽、偶數陰。",
      "alternatives": [
        {
          "switch": "xingming.stroke_basis",
          "option": "modern",
          "label": "現代筆畫（照字形數）",
          "value": "28・金・凶"
        }
      ]
    },
    {
      "id": "xingming.sancai",
      "group": "三才",
      "label": "三才配置",
      "value": "金土水",
      "note": "天格金、人格土、地格水；人格土生天格金；人格土剋地格水",
      "how": "三才＝天格、人格、地格三格的五行，依序排列。",
      "alternatives": [
        {
          "switch": "xingming.stroke_basis",
          "option": "modern",
          "label": "現代筆畫（照字形數）",
          "value": "木水金"
        },
        {
          "switch": "xingming.jiashu",
          "option": "off",
          "label": "不加假數",
          "value": "土土水"
        }
      ]
    },
    {
      "id": "xingming.yun.success",
      "group": "三才",
      "label": "成功運",
      "value": "相生",
      "note": "人格土生天格金",
      "how": "看天格與人格兩格五行的生剋：相生、比和、相剋。課程規則：相生 +1、比和 0、相剋 −1。",
      "alternatives": [
        {
          "switch": "xingming.jiashu",
          "option": "off",
          "label": "不加假數",
          "value": "比和"
        }
      ]
    },
    {
      "id": "xingming.yun.base",
      "group": "三才",
      "label": "基礎運",
      "value": "相剋",
      "note": "人格土剋地格水",
      "how": "看人格與地格兩格五行的生剋：相生、比和、相剋。課程規則：相生 +1、比和 0、相剋 −1。",
      "alternatives": [
        {
          "switch": "xingming.stroke_basis",
          "option": "modern",
          "label": "現代筆畫（照字形數）",
          "value": "相生"
        }
      ]
    },
    {
      "id": "xingming.yun.social",
      "group": "三才",
      "label": "社交運",
      "value": "相剋",
      "note": "外格木剋人格土",
      "how": "看人格與外格兩格五行的生剋：相生、比和、相剋。課程規則：相生 +1、比和 0、相剋 −1。",
      "alternatives": [
        {
          "switch": "xingming.stroke_basis",
          "option": "modern",
          "label": "現代筆畫（照字形數）",
          "value": "比和"
        }
      ]
    },
    {
      "id": "xingming.bazi.favourable",
      "group": "八字配合",
      "label": "八字喜用五行",
      "value": "土、金",
      "note": "忌 木、水、火；日主辛金，身弱",
      "how": "與八字排盤 bazi.favourable 同一套旺衰規則（流派的旺衰開關也套用）。",
      "alternatives": []
    },
    {
      "id": "xingming.bazi.link",
      "group": "八字配合",
      "label": "人格五行對八字",
      "value": "人格土：喜用",
      "note": "天格金（喜用）、人格土（喜用）、地格水（忌）、外格木（忌）、總格土（喜用）",
      "how": "各格五行落在八字喜用為「喜用」、落在忌神為「忌」，其餘為「閒」。姓名學論八字以人格為主。",
      "alternatives": [
        {
          "switch": "xingming.stroke_basis",
          "option": "modern",
          "label": "現代筆畫（照字形數）",
          "value": "人格水：忌"
        }
      ]
    }
  ],
  "payload": {
    "surname": "陳",
    "given": "美玲",
    "split_note": "第一個字當姓；複姓或冠夫姓請在姓與名之間加空白（例：歐陽 娜娜）",
    "chars": [
      {
        "char": "陳",
        "role": "姓",
        "strokes": 16,
        "kangxi": 16,
        "modern": 10,
        "traditional": "",
        "how": "康熙筆畫：部首阜（左阝） 8 畫（還原原形）＋其餘 8 畫＝16（Unihan kRSUnicode 170.8）"
      },
      {
        "char": "美",
        "role": "名",
        "strokes": 9,
        "kangxi": 9,
        "modern": 9,
        "traditional": "",
        "how": "康熙筆畫：部首羊 6 畫＋其餘 3 畫＝9（Unihan kRSUnicode 123.3）"
      },
      {
        "char": "玲",
        "role": "名",
        "strokes": 10,
        "kangxi": 10,
        "modern": 9,
        "traditional": "",
        "how": "康熙筆畫：部首玉（王） 5 畫（還原原形）＋其餘 5 畫＝10（Unihan kRSUnicode 96.5）"
      }
    ],
    "grids": [
      {
        "name": "天格",
        "id": "tian",
        "number": 17,
        "shuli": 17,
        "element": "金",
        "yinyang": "陽",
        "luck": "吉",
        "formula": "單姓：陳16＋假數 1",
        "role": "祖運：姓氏帶來的先天格，多數流派認為影響小、不單獨論吉凶",
        "bazi": "喜用"
      },
      {
        "name": "人格",
        "id": "ren",
        "number": 25,
        "shuli": 25,
        "element": "土",
        "yinyang": "陽",
        "luck": "吉",
        "formula": "姓末字＋名首字：陳16＋美9",
        "role": "主運：姓名的核心，主性格與一生主軸",
        "bazi": "喜用"
      },
      {
        "name": "地格",
        "id": "di",
        "number": 19,
        "shuli": 19,
        "element": "水",
        "yinyang": "陽",
        "luck": "凶",
        "formula": "名字筆畫合計：美9＋玲10",
        "role": "前運：名字的部分，主早年、家庭、配偶與子女",
        "bazi": "忌"
      },
      {
        "name": "外格",
        "id": "wai",
        "number": 11,
        "shuli": 11,
        "element": "木",
        "yinyang": "陽",
        "luck": "吉",
        "formula": "天格＋地格－人格：17＋19－25",
        "role": "副運：主人際、外在環境與社交",
        "bazi": "忌"
      },
      {
        "name": "總格",
        "id": "zong",
        "number": 35,
        "shuli": 35,
        "element": "土",
        "yinyang": "陽",
        "luck": "吉",
        "formula": "全部筆畫合計（不含假數）：陳16＋美9＋玲10",
        "role": "後運：全名合計，主中晚年與整體",
        "bazi": "喜用"
      }
    ],
    "sancai": "金土水",
    "relations": {
      "成功運": {
        "kind": "相生",
        "text": "人格土生天格金",
        "score": 1
      },
      "基礎運": {
        "kind": "相剋",
        "text": "人格土剋地格水",
        "score": -1
      },
      "社交運": {
        "kind": "相剋",
        "text": "外格木剋人格土",
        "score": -1
      }
    },
    "bazi": {
      "favourable": [
        "土",
        "金"
      ],
      "avoid": [
        "木",
        "水",
        "火"
      ],
      "day_master": "辛",
      "strength": "身弱"
    },
    "school_dependent": [
      "xingming.char.1",
      "xingming.char.3",
      "xingming.ge.tian",
      "xingming.ge.ren",
      "xingming.ge.di",
      "xingming.ge.wai",
      "xingming.ge.zong",
      "xingming.sancai",
      "xingming.yun.success",
      "xingming.yun.base",
      "xingming.yun.social",
      "xingming.bazi.link"
    ]
  },
  "warnings": [],
  "missing": [],
  "school": {
    "name": "default",
    "title": "課程預設",
    "source": "課程編寫，綜合《子平真詮》《滴天髓》《紫微斗數全書》通論與多數排盤軟體的預設",
    "summary": "課程預設：年柱以立春換年、晚子時換日、時辰用真太陽時、命宮生月以節、閏月上半歸本月下半歸次月、四化通行表、姓名筆畫用康熙",
    "settings": {
      "bazi": {
        "year_boundary": "lichun",
        "month_stem_follows": "year_pillar",
        "late_zi": "next_day",
        "true_solar_time": "on",
        "minggong_month": "jie",
        "yangren_yin_stems": "chenwei",
        "xusui_boundary": "lunar_new_year",
        "chenggu_year": "lichun",
        "strength_method": "score_v2"
      },
      "ziwei": {
        "leap_month": "split",
        "sihua_variant": "standard",
        "hour_source": "true_solar",
        "late_zi": "same_day",
        "tianma_basis": "year_branch"
      },
      "xingming": {
        "stroke_basis": "kangxi",
        "numeral_strokes": "value",
        "jiashu": "on"
      }
    }
  }
};
window.MOCK_DATA.reading_xingming = {
  "system": "xingming",
  "system_zh": "姓名學",
  "subject": "小美・1990-06-15 14:30・台北",
  "persona": "玄機",
  "sections": [
    {
      "key": "overview",
      "title": "總論",
      "direction": "吉",
      "direction_reason": "三才金土水：成功運相生、基礎運相剋；總格 35 數理吉（規則：相生 +1、比和 0、相剋 −1；數理吉 +1、半吉 0、凶 −1）",
      "text": "「陳美玲」的三才配置是金土水，總格 35（土・吉）。人格土生天格金，人格土剋地格水。整體順勢。這一段的方向來自：三才金土水：成功運相生、基礎運相剋；總格 35 數理吉（規則：相生 +1、比和 0、相剋 −1；數理吉 +1、半吉 0、凶 −1）。",
      "evidence": [
        "xingming.name",
        "xingming.sancai",
        "xingming.yun.success",
        "xingming.yun.base",
        "xingming.ge.zong"
      ],
      "cards": [
        "sancai.peizhi",
        "wuge.zong",
        "shuli.ji"
      ]
    },
    {
      "key": "personality",
      "title": "性格",
      "direction": "平",
      "direction_reason": "性格段為描述，不判吉凶",
      "text": "性格以人格為主軸：人格 25（土・吉）。人格是姓的最後一字加名的第一字，代表姓名的核心；土的人格特質見知識卡。",
      "evidence": [
        "xingming.ge.ren",
        "xingming.sancai"
      ],
      "cards": [
        "wuge.ren",
        "wuxing.tu"
      ]
    },
    {
      "key": "career",
      "title": "事業",
      "direction": "吉",
      "direction_reason": "人格 25 數理吉、成功運相生（人格土生天格金）",
      "text": "事業看人格與成功運：人格 25（土・吉），成功運相生（人格土生天格金）。整體順勢；判定規則：人格 25 數理吉、成功運相生（人格土生天格金）。",
      "evidence": [
        "xingming.ge.ren",
        "xingming.yun.success"
      ],
      "cards": [
        "wuge.ren",
        "sancai.xiangsheng"
      ]
    },
    {
      "key": "love",
      "title": "感情",
      "direction": "凶",
      "direction_reason": "地格 19 數理凶、基礎運相剋（人格土剋地格水）",
      "text": "感情與家庭看地格與基礎運：地格 19（水・凶），基礎運相剋（人格土剋地格水）。阻力較多，宜守不宜攻；判定規則：地格 19 數理凶、基礎運相剋（人格土剋地格水）。",
      "evidence": [
        "xingming.ge.di",
        "xingming.yun.base"
      ],
      "cards": [
        "wuge.di",
        "sancai.xiangke"
      ]
    },
    {
      "key": "wealth",
      "title": "財運",
      "direction": "吉",
      "direction_reason": "人格 25 數理吉、總格 35 數理吉",
      "text": "財運看人格與總格：人格 25（土・吉）、總格 35（土・吉）。整體順勢。",
      "evidence": [
        "xingming.ge.ren",
        "xingming.ge.zong"
      ],
      "cards": [
        "wuge.zong",
        "shuli.ji"
      ]
    },
    {
      "key": "year",
      "title": "八字配合",
      "direction": "吉",
      "direction_reason": "人格土：喜用（八字喜用 土、金；規則：人格五行屬喜用為吉、屬忌為凶、其餘為平）",
      "text": "八字喜用五行為土、金（忌 木、水、火；日主辛金，身弱）。姓名這邊人格土：喜用；各格對照：天格金（喜用）、人格土（喜用）、地格水（忌）、外格木（忌）、總格土（喜用）。整體順勢。姓名不隨年份變，這一段看的是名字與八字的配合，不是流年。",
      "evidence": [
        "xingming.bazi.link",
        "xingming.bazi.favourable"
      ],
      "cards": [
        "sancai.bazi"
      ]
    }
  ],
  "disclaimer": "本報告由 AI 依據命盤事實與課程編寫的知識卡自動整理，內容屬於傳統命理的通論與傾向描述，僅供參考與自我探索之用。\n命理不能取代醫療、法律、財務等專業意見，相關問題請諮詢合格的專業人員。\n任何人生決定都應由你自己綜合實際情況後做出，本報告不構成任何形式的建議或承諾。\n若你正處於情緒低潮，請聯繫安心專線 1925 或生命線 1995。",
  "checks": {
    "passed": true,
    "chart_check": {
      "ok": true,
      "issues": [],
      "label": "盤面核對"
    },
    "citation_check": {
      "ok": true,
      "issues": [],
      "label": "引用核對"
    },
    "boundary_check": {
      "ok": true,
      "issues": [],
      "label": "越界檢查"
    },
    "summary": "3/3 通過（一致性另以 /api/consistency 檢查）"
  },
  "cost_usd": 0.0,
  "backend": "mock",
  "model": "",
  "byok": false,
  "usage": {
    "input_tokens": 0,
    "output_tokens": 0,
    "cache_read_tokens": 0
  },
  "warnings": []
};
