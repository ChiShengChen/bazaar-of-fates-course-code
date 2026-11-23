"""六段固定段落（5-3）與「結論方向」規則（6-5）；10-4 加了第二種報告「事業流年」（四段）。

方向（吉／平／凶）由程式依規則先判定，AI 只負責措辭。這是「同一張盤問三次，
結論方向不能變」的來源：措辭可以不同，方向由這裡決定。
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from fortune.chart import ChartData

SECTIONS = [
    ("overview", "總論"), ("personality", "性格"), ("career", "事業"),
    ("love", "感情"), ("wealth", "財運"), ("year", "流年"),
]
SECTION_TITLES = dict(SECTIONS)
# 姓名不隨年份變，第六段改看姓名五行與八字喜用的配合；段落 key 不變，畫面、查核、一致性照常運作
SECTIONS_BY_SYSTEM = {"xingming": [(k, "八字配合" if k == "year" else t) for k, t in SECTIONS]}

# 報告種類：一般解讀（六段）｜事業流年（10-4：指定一年，只談那一年的事業，四段）
REPORT_KINDS = {"general": "一般解讀", "career_year": "事業流年"}
CAREER_YEAR_SECTIONS = [("overview", "年度總覽"), ("trend", "事業走勢"), ("chances", "可以把握的"), ("cautions", "要留意的")]


def sections_for(system: str, kind: str = "general") -> list[tuple[str, str]]:
    if kind == "career_year":
        return CAREER_YEAR_SECTIONS
    return SECTIONS_BY_SYSTEM.get(system, SECTIONS)


@dataclass
class Direction:
    key: str
    direction: str          # 吉 | 平 | 凶
    reason: str             # 規則說明（給畫面與 AI）
    evidence: list[str]     # 判定用到的事實 id


def _d(score: int) -> str:
    return "吉" if score >= 1 else ("凶" if score <= -1 else "平")


# ---------------------------------------------------------------- 八字
_OFFICER = {"正官", "七殺"}
_WEALTH = {"正財", "偏財"}
_SEAL = {"正印", "偏印"}
_OUTPUT = {"食神", "傷官"}


def _bazi_directions(c: ChartData) -> list[Direction]:
    f = {x.id: x for x in c.facts}
    fav_list = [x for x in (f["bazi.favourable"].value if "bazi.favourable" in f else "").split("、") if x]   # 照事實的順序顯示
    fav = set(fav_list)
    present = set((f["bazi.gods.present"].value if "bazi.gods.present" in f else "").split("、"))
    out: list[Direction] = []

    # 總論：目前大運天干／地支十神是否屬喜用
    cur = f.get("bazi.dayun.current")
    score, why = 0, []
    if cur and "尚未起運" in cur.value:
        out.append(Direction("overview", "平", "尚未起運，總論以日主與旺衰描述為主：" + cur.value, ["bazi.dayun.current", "bazi.day_master", "bazi.strength"]))
    elif cur and "資料不足" not in cur.value:
        from fortune.bazi.engine import BRANCH_ELEM, BRANCHES, STEM_ELEM, STEMS
        se, be = STEM_ELEM[STEMS.index(cur.value[0])], BRANCH_ELEM[BRANCHES.index(cur.value[1])]
        score = (1 if se in fav else -1) + (1 if be in fav else -1)
        why.append(f"目前大運{cur.value}五行{se}{be}，喜用為{'、'.join(fav_list)}")
        out.append(Direction("overview", _d(score), "；".join(why), ["bazi.dayun.current", "bazi.favourable", "bazi.strength"]))
    else:
        out.append(Direction("overview", "平", "大運資料不足，總論以日主與旺衰描述為主", ["bazi.day_master", "bazi.strength"]))

    out.append(Direction("personality", "平", "性格段為描述，不判吉凶", ["bazi.day_master", "bazi.gods.present"]))

    # 事業：官殺或印有無、與喜用
    s = 0
    if present & _OFFICER:
        s += 1
    if present & _SEAL:
        s += 1
    if not (present & _OFFICER) and not (present & _SEAL):
        s -= 1
    if "傷官" in present and "正官" in present:
        s -= 1
    out.append(Direction("career", _d(s - 1 if s >= 2 else s), "依官殺、印星是否在命中出現，及傷官見官與否",
                         ["bazi.gods.present", "bazi.gods.absent"]))

    # 感情：男看財、女看官（通論）；缺則平
    g = (c.birth.get("gender") or "")
    star = _WEALTH if g == "male" else (_OFFICER if g == "female" else _WEALTH | _OFFICER)
    s = 1 if present & star else -1
    if "正官" in present and "七殺" in present and g == "female":
        s -= 1
    if "正財" in present and "偏財" in present and g == "male":
        s -= 1
    out.append(Direction("love", _d(s), "通論：男命看財星、女命看官星是否出現、是否混雜（流派差異大，僅示範）",
                         ["bazi.gods.present", "bazi.day_master"]))

    # 財運：財星 + 食傷生財 + 今年流年
    s = (1 if present & _WEALTH else -1) + (1 if present & _OUTPUT else 0)
    out.append(Direction("wealth", _d(min(s, 1)), "依財星與食傷是否出現", ["bazi.gods.present", "bazi.favourable"]))

    # 流年：今年流年五行對喜用
    ln = next((x for x in c.facts if x.id.startswith("bazi.liunian.") and "今年" in x.note), None)
    if ln:
        d = "吉" if "喜用到位" in ln.note else ("平" if "部分喜用" in ln.note else "凶")
        out.append(Direction("year", d, "今年流年五行對喜用神：" + ln.note.split("：")[-1].replace("・今年", ""), [ln.id, "bazi.favourable"]))
    else:
        out.append(Direction("year", "平", "無流年資料", []))
    return out


# ---------------------------------------------------------------- 紫微
def _palace_score(p: dict) -> tuple[int, str]:
    s = len(p["lucky"]) - len(p["unlucky"])
    for star, h in p["hua"].items():
        s += -1 if h == "化忌" else 1
    if "祿存" in p["other"]:
        s += 1
    why = f"吉星{len(p['lucky'])}、煞星{len(p['unlucky'])}、四化{'、'.join(p['hua'].values()) or '無'}"
    return s, why


def _ziwei_directions(c: ChartData) -> list[Direction]:
    pal = {p["name"]: p for p in c.payload["palaces"]}
    out: list[Direction] = []
    for key, name in (("overview", "命宮"), ("career", "官祿宮"), ("love", "夫妻宮"), ("wealth", "財帛宮")):
        s, why = _palace_score(pal[name])
        if key == "love":                    # 月老：感情不只看夫妻宮，福德宮（心情、安全感）一起算
            s2, why2 = _palace_score(pal["福德宮"])
            out.append(Direction(key, _d(s + s2), f"夫妻宮：{why}；福德宮：{why2}（規則：兩宮合計，吉星+1、煞星-1、祿權科+1、忌-1）",
                                 ["ziwei.palace.夫妻宮", "ziwei.palace.福德宮"]))
            continue
        out.append(Direction(key, _d(s), f"{name}：{why}（規則：吉星+1、煞星-1、祿權科+1、忌-1）", [f"ziwei.palace.{name}"]))
    out.insert(1, Direction("personality", "平", "性格段為描述，不判吉凶", ["ziwei.palace.命宮", "ziwei.soul_star"]))
    ln = next((x for x in c.facts if x.id.startswith("ziwei.liunian.") and "今年" in x.note), None)
    if ln:
        branch = ln.value.split("（")[1][0]
        p = next(p for p in c.payload["palaces"] if p["branch"] == branch)
        s, why = _palace_score(p)
        # 流年化忌落在流年命宮再 -1
        ji = ln.note.split("化忌")[0].split("、")[-1] if "化忌" in ln.note else ""
        if ji and ji in p["major"] + p["lucky"]:
            s -= 1
            why += f"、流年{ji}化忌入流年命宮"
        out.append(Direction("year", _d(s), f"流年命宮（本命{p['name']}）：{why}", [ln.id, f"ziwei.palace.{p['name']}"]))
    else:
        out.append(Direction("year", "平", "無流年資料", []))
    return out


# ---------------------------------------------------------------- 姓名學
_LUCK = {"吉": 1, "半吉": 0, "凶": -1}


def _xingming_directions(c: ChartData) -> list[Direction]:
    f = {x.id: x for x in c.facts}
    grid = {g["name"]: g for g in c.payload["grids"]}
    rel = c.payload["relations"]
    luck = lambda name: _LUCK[grid[name]["luck"]]  # noqa: E731
    out: list[Direction] = []

    s = rel["成功運"]["score"] + rel["基礎運"]["score"] + luck("總格")
    out.append(Direction("overview", _d(s), f"三才{c.payload['sancai']}：成功運{rel['成功運']['kind']}、基礎運{rel['基礎運']['kind']}；"
                         f"總格 {grid['總格']['shuli']} 數理{grid['總格']['luck']}（規則：相生 +1、比和 0、相剋 −1；數理吉 +1、半吉 0、凶 −1）",
                         ["xingming.sancai", "xingming.yun.success", "xingming.yun.base", "xingming.ge.zong"]))
    out.append(Direction("personality", "平", "性格段為描述，不判吉凶", ["xingming.ge.ren", "xingming.sancai"]))
    s = luck("人格") + rel["成功運"]["score"]
    out.append(Direction("career", _d(s), f"人格 {grid['人格']['shuli']} 數理{grid['人格']['luck']}、成功運{rel['成功運']['kind']}（{rel['成功運']['text']}）",
                         ["xingming.ge.ren", "xingming.yun.success"]))
    s = luck("地格") + rel["基礎運"]["score"]
    out.append(Direction("love", _d(s), f"地格 {grid['地格']['shuli']} 數理{grid['地格']['luck']}、基礎運{rel['基礎運']['kind']}（{rel['基礎運']['text']}）",
                         ["xingming.ge.di", "xingming.yun.base"]))
    s = luck("人格") + luck("總格")
    out.append(Direction("wealth", _d(s), f"人格 {grid['人格']['shuli']} 數理{grid['人格']['luck']}、總格 {grid['總格']['shuli']} 數理{grid['總格']['luck']}",
                         ["xingming.ge.ren", "xingming.ge.zong"]))
    link = f["xingming.bazi.link"].value
    d = "吉" if "喜用" in link else ("凶" if link.endswith("忌") else "平")
    out.append(Direction("year", d, f"{link}（八字喜用 {f['xingming.bazi.favourable'].value}；規則：人格五行屬喜用為吉、屬忌為凶、其餘為平）",
                         ["xingming.bazi.link", "xingming.bazi.favourable"]))
    return out


# ---------------------------------------------------------------- 事業流年（10-4）
# 盤要用「那一年」的日期排（report.py 會處理），所以盤面事實裡標「今年」的流年、目前大運、目前大限就是那一年的。
_CHANCE = {"正官": "升遷與承擔責任", "正印": "進修、證照與貴人", "偏印": "專業技術與研究",
           "食神": "表現與作品", "正財": "穩定的收入與工作成果", "偏財": "業務與外部機會"}   # 七殺、傷官放在「要留意的」
_FAV_WORD = {"吉": "合喜用", "平": "部分合喜用", "凶": "非喜用"}
_SAN_FANG = ("命宮", "官祿宮", "財帛宮", "遷移宮")          # 命宮的三方四正
_HUA_INTO = re.compile(r"(.+?)化(祿|權|科|忌)入(.+宮)")


class NoYearFacts(ValueError):
    """盤面事實裡沒有那一年的流年（例如姓名學）。"""


def this_year_fact(c: ChartData, prefix: str):
    ln = next((x for x in c.facts if x.id.startswith(prefix) and "今年" in x.note), None)
    if ln is None:
        raise NoYearFacts(f"{c.system_zh}沒有流年事實，排不出事業流年")
    return ln


def _bazi_career_year(c: ChartData) -> list[Direction]:
    f = {x.id: x for x in c.facts}
    ln = this_year_fact(c, "bazi.liunian.")
    year = ln.id.rsplit(".", 1)[1]
    gz, gods = ln.value.split("・")
    year_gods = set(gods.split("/"))
    present = set(f["bazi.gods.present"].value.split("、"))
    cur = f.get("bazi.dayun.current")
    dy_gods = set(cur.note.split("・")[0].split("/")) if cur and "/" in cur.note else set()
    fav_tone = "吉" if "喜用到位" in ln.note else ("平" if "部分喜用" in ln.note else "凶")
    ev = [ln.id, "bazi.favourable"] + (["bazi.dayun.current"] if cur else [])
    out = [Direction("overview", fav_tone, f"{year} 流年{gz}五行對喜用：{ln.note.split('：')[-1].replace('・今年', '')}", ev)]

    s, why = 0, []
    if year_gods & _OFFICER:
        s += 1; why.append(f"流年見官殺（{'、'.join(sorted(year_gods & _OFFICER))}）+1")
    if year_gods & _SEAL:
        s += 1; why.append(f"流年見印（{'、'.join(sorted(year_gods & _SEAL))}）+1")
    if "傷官" in year_gods and "正官" in (present | year_gods):
        s -= 1; why.append("傷官見官 −1")
    if dy_gods & (_OFFICER | _SEAL):
        s += 1; why.append(f"大運{cur.value}帶{'、'.join(sorted(dy_gods & (_OFFICER | _SEAL)))} +1")
    d = "吉" if s >= 2 else ("凶" if s <= -1 else "平")
    out.append(Direction("trend", d, "；".join(why or ["流年與大運都沒有官殺、印"]) + "（規則：合計 2 以上為吉、−1 以下為凶）",
                         ev + ["bazi.gods.present"]))

    good = sorted(g for g in year_gods if g in _CHANCE)
    d = "吉" if good and fav_tone != "凶" else "平"
    out.append(Direction("chances", d, (f"流年十神{'、'.join(good)}：{'；'.join(_CHANCE[g] for g in good)}" if good else "流年十神沒有正官、印、食神、財")
                         + f"；流年五行{_FAV_WORD[fav_tone]}（規則：有可用的十神且五行不是非喜用為吉）", ev))

    risk = []
    if "七殺" in year_gods and not ((year_gods | dy_gods) & _SEAL):
        risk.append("七殺沒有印化：壓力與競爭")
    if "傷官" in year_gods and "正官" in (present | year_gods):
        risk.append("傷官見官：與上司或制度的摩擦")
    if fav_tone == "凶":
        risk.append("流年五行非喜用：心力消耗")
    d = "凶" if len(risk) >= 2 else ("平" if risk else "吉")
    out.append(Direction("cautions", d, ("；".join(risk) if risk else "沒有七殺無制、傷官見官、五行非喜用這三種情形")
                         + "（規則：兩項以上為凶、一項為平、沒有為吉）", ev + ["bazi.gods.present"]))
    return out


def hua_moves(note: str) -> list[tuple[str, str, str]]:
    """流年事實備註裡的「四化落宮：太陰化祿入夫妻宮、…」→ [(星, 祿/權/科/忌, 宮)]。"""
    part = next((p for p in note.split("；") if p.startswith("四化落宮：")), "")
    return [m.groups() for m in (_HUA_INTO.fullmatch(x.strip()) for x in part.removeprefix("四化落宮：").split("、")) if m]


def _ziwei_career_year(c: ChartData) -> list[Direction]:
    pal = {p["name"]: p for p in c.payload["palaces"]}
    ln = this_year_fact(c, "ziwei.liunian.")
    year = ln.id.rsplit(".", 1)[1]
    branch = ln.value.split("（")[1][0]
    p = next(x for x in c.payload["palaces"] if x["branch"] == branch)
    moves = hua_moves(ln.note)
    out = []

    s, why = _palace_score(p)
    ji = next((star for star, h, _ in moves if h == "忌"), "")
    if ji and ji in p["major"] + p["lucky"]:
        s -= 1; why += f"、流年{ji}化忌入流年命宮"
    out.append(Direction("overview", _d(s), f"{year} 流年命宮在本命{p['name']}：{why}（規則：吉星+1、煞星-1、祿權科+1、忌-1）",
                         [ln.id, f"ziwei.palace.{p['name']}"]))

    s, why = 0, []
    for star, h, to in moves:
        if to == "官祿宮":
            s += -1 if h == "忌" else 1
            why.append(f"{star}化{h}入官祿宮 {'−1' if h == '忌' else '+1'}")
    base, _ = _palace_score(pal["官祿宮"])
    if base:
        s += 1 if base > 0 else -1
        why.append(f"本命官祿宮{'偏吉' if base > 0 else '偏弱'} {'+1' if base > 0 else '−1'}")
    out.append(Direction("trend", _d(s), "；".join(why or ["流年四化沒有進官祿宮，本命官祿宮持平"]) + "（規則：祿權科入官祿宮 +1、忌 −1，本命官祿宮強弱 ±1）",
                         [ln.id, "ziwei.palace.官祿宮"]))

    good = [f"{star}化{h}入{to}" for star, h, to in moves if h != "忌" and to in _SAN_FANG]
    out.append(Direction("chances", "吉" if good else "平",
                         ("、".join(good) if good else "流年祿權科沒有進命宮的三方四正") + "（規則：祿權科進命、官、財、遷任一宮為吉）",
                         [ln.id, "ziwei.palace.官祿宮"]))

    bad = [(star, to) for star, h, to in moves if h == "忌" and to in _SAN_FANG]
    d = "凶" if bad else ("平" if p["unlucky"] else "吉")
    out.append(Direction("cautions", d, ("、".join(f"{s}化忌入{to}" for s, to in bad) if bad else f"化忌沒有進三方四正；流年命宮煞星 {len(p['unlucky'])} 顆")
                         + "（規則：化忌進命、官、財、遷為凶；否則流年命宮有煞星為平）",
                         [ln.id] + ([f"ziwei.palace.{to}" for _, to in bad] if bad else [f"ziwei.palace.{p['name']}"])))
    return out


def directions(chart: ChartData, kind: str = "general") -> list[Direction]:
    if kind == "career_year":
        fn = {"bazi": _bazi_career_year, "ziwei": _ziwei_career_year}.get(chart.system)
        if fn is None:
            raise NoYearFacts(f"{chart.system_zh}沒有事業流年報告")
        return fn(chart)
    return {"bazi": _bazi_directions, "ziwei": _ziwei_directions, "xingming": _xingming_directions}[chart.system](chart)
