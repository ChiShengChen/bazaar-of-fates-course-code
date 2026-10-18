"""統一命盤格式（4-1）— 八字與紫微共用同一套介面。

核心是 `facts`：一張盤被拆成一條條「事實」，每條有固定的 id。
之後的解讀（引用 id）、畫面（顯示）、合盤（比對）、查核（對照）都從這份資料出發，不會各算各的。
`payload` 保留系統原生的結構（四柱 / 十二宮）給畫面畫圖用。
"""

from __future__ import annotations

from datetime import date, datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

from fortune.birth import BirthInput


class Fact(BaseModel):
    id: str                      # 穩定 id，例如 bazi.day_master、ziwei.palace.命宮
    group: str                   # 分組：四柱 / 十神 / 旺衰 / 大運 / 流年 / 宮位 / 四化 …
    label: str                   # 人看的名稱
    value: str                   # 人看的值
    note: str = ""               # 補充（藏干、依據的規則…）
    how: str = ""                # 這條事實是怎麼算出來的（查哪張表、哪條規則）— 「查得到」做到底
    alternatives: list[dict[str, Any]] = Field(default_factory=list)   # 換一派會得到什麼：[{switch, option, label, value}]


class ChartData(BaseModel):
    system: Literal["bazi", "ziwei", "xingming"]
    system_zh: str
    subject: str
    birth: dict[str, Any]
    cast_at: datetime
    facts: list[Fact] = Field(default_factory=list)
    payload: dict[str, Any] = Field(default_factory=dict)
    warnings: list[str] = Field(default_factory=list)   # 流派差異、資料不足等，解讀時要帶給使用者
    missing: list[str] = Field(default_factory=list)    # hour / gender
    school: dict[str, Any] = Field(default_factory=dict)  # 本盤採用的流派（name/title/summary/settings）

    def fact(self, fid: str) -> Fact | None:
        return next((f for f in self.facts if f.id == fid), None)

    def fact_ids(self) -> set[str]:
        return {f.id for f in self.facts}

    def facts_text(self) -> str:
        """給 AI 讀的純文字版：一行一條事實，前面帶 id。"""
        lines = []
        for f in self.facts:
            line = f"[{f.id}] {f.label}：{f.value}"
            if f.note:
                line += f"（{f.note}）"
            lines.append(line)
        alts = [f"[{f.id}] 另一派：" + "；".join(f"{a['label']}→{a['value']}" for a in f.alternatives) for f in self.facts if f.alternatives]
        if alts:
            lines.append("")
            lines.append("流派歧見（本盤採 " + self.school.get("title", "課程預設") + "）：")
            lines.extend(alts)
        if self.warnings:
            lines.append("")
            lines.append("注意事項：" + "；".join(self.warnings))
        return "\n".join(lines)


_HOW_PILLAR = {
    "year": "年柱：以立春（太陽黃經 315°）的精確時刻換年，1984 年＝甲子年，依序推算。",
    "month": "月柱：月支以十二「節」的精確時刻換月（太陽黃經每 30°）；月干用五虎遁（年干定寅月天干）。",
    "day": "日柱：以儒略日數推算，2000-01-07＝甲子日；23 時後依「晚子時換日」派算隔日（可設定）。",
    "hour": "時柱：先把手錶時間換成真太陽時（經度差＋均時差）定時支；時干用五鼠遁（日干定子時天干）。",
}


def _age_on(birth_date: date, today: date, boundary: str = "lunar_new_year") -> int:
    """虛歲（命理慣用）：出生算 1 歲，每過一個農曆新年（或依流派：立春）加 1。"""
    if boundary == "lichun":
        return _bazi_year_of(today) - _bazi_year_of(birth_date) + 1
    from lunardate import LunarDate
    ly_birth = LunarDate.from_solar_date(birth_date.year, birth_date.month, birth_date.day).year
    ly_today = LunarDate.from_solar_date(today.year, today.month, today.day).year
    return ly_today - ly_birth + 1


def _bazi_year_of(today: date) -> int:
    """八字的「今年」：立春為界（1 月、2 月初仍算前一年）。"""
    from datetime import datetime, timedelta, timezone
    from fortune.calendar.solar_terms import bazi_year_at
    return bazi_year_at(datetime.combine(today, datetime.min.time().replace(hour=12), tzinfo=timezone(timedelta(hours=8))))


def _lunar_year_of(today: date) -> int:
    """紫微的「今年」：農曆新年為界。"""
    from lunardate import LunarDate
    return LunarDate.from_solar_date(today.year, today.month, today.day).year


# ---------------------------------------------------------------- 八字 → ChartData
def bazi_chart(birth: BirthInput, *, today: date | None = None, years_ahead: int = 2, school=None, _no_alt: bool = False) -> ChartData:
    from fortune.bazi import engine as E
    from fortune.school import resolve as _resolve_school

    school = school or _resolve_school()
    today = today or date.today()
    c = E.cast(birth, school=school)
    dm = c.day_master
    facts: list[Fact] = []
    dm_elem = E.STEM_ELEM[E.STEMS.index(dm)]

    for key in ("year", "month", "day", "hour"):
        if key not in c.pillars:
            facts.append(Fact(id="bazi.pillar.hour", group="四柱", label="時柱", value="資料不足（時辰不明）"))
            continue
        p = c.pillars[key]
        d = p.as_dict(dm)
        facts.append(Fact(
            id=f"bazi.pillar.{key}", group="四柱", label=p.name, value=p.gz,
            note=f"{d['stem_elem']}{d['branch_elem']}・{d['zodiac']}・藏干 {'、'.join(d['hidden_stems'])}",
            how=_HOW_PILLAR[key],
        ))
        if key != "day":
            facts.append(Fact(id=f"bazi.god.{key}_stem", group="十神", label=f"{p.name}天干 {p.stem}",
                              value=d["stem_god"]))
        facts.append(Fact(id=f"bazi.god.{key}_branch", group="十神", label=f"{p.name}地支 {p.branch} 藏干",
                          value="、".join(f"{h}{g}" for h, g in zip(d["hidden_stems"], d["hidden_gods"]))))

    g = {"male": "男命", "female": "女命"}.get(birth.gender or "", "未填（大運／大限方向與男女命論法無法判定）")
    facts.append(Fact(id="bazi.gender", group="基本", label="性別", value=g))
    facts.append(Fact(id="bazi.day_master", group="日主", label="日主", value=f"{dm}{dm_elem}",
                      note=f"{'陽' if E.STEM_YANG[E.STEMS.index(dm)] else '陰'}{dm_elem}"))
    gods = sorted({f.value for f in facts if f.id.endswith("_stem")} |
                  {g for f in facts if f.id.endswith("_branch") for g in [x[1:] for x in f.value.split("、")]})
    absent = [g for g in E.TEN_GODS if g not in gods]
    facts.append(Fact(id="bazi.gods.present", group="十神", label="命中出現的十神", value="、".join(gods)))
    facts.append(Fact(id="bazi.gods.absent", group="十神", label="命中未出現的十神", value="、".join(absent) or "無"))

    s = c.strength
    if s.get("method") == "score_v2":
        facts.append(Fact(id="bazi.strength", group="旺衰", label="日主旺衰", value=s["label"],
                          note=f"生扶 {s['support']}（比劫 {s['support_by']['比劫']}、印 {s['support_by']['印']}）vs 耗洩 {s['drain']}"
                               f"（食傷 {s['drain_by']['食傷']}、財 {s['drain_by']['財']}、官殺 {s['drain_by']['官殺']}），比例 {s['ratio']}；" + "；".join(s["notes"]),
                          how="月令旺相休囚死（+3/+2/−1/−2/−3）；四柱藏干通根（本氣 1.0、中氣 0.5、餘氣 0.3；月令 ×1.5、日支 ×1.2）；年月時干透出 ±1；生扶÷(生扶＋耗洩) ≥0.58 身強、≤0.42 身弱、其間中和；無根且 <0.22 疑從格。"))
        facts.append(Fact(id="bazi.favourable", group="旺衰", label="喜用五行", value="、".join(s["favourable"]),
                          note=f"忌 {'、'.join(s['avoid'])}", how="身強喜洩剋耗（食傷、財、官殺）；身弱喜生扶（印、比劫）；從格順勢。"))
        facts.append(Fact(id="bazi.yongshen", group="旺衰", label="用神", value=s["yongshen"], note=s["yongshen_why"],
                          how="扶抑：身強看比劫與印何者旺（比劫旺取官殺、印旺取財）；身弱看耗洩最重的一類（財多取比劫、官殺旺取印、食傷旺取印）。"))
        facts.append(Fact(id="bazi.tiaohou", group="旺衰", label="調候", value=s["tiaohou"] or "不急", note=s["tiaohou_note"],
                          how="冬月（亥子丑）喜火、夏月（巳午未）喜水，春秋不急。"))
        facts.append(Fact(id="bazi.pattern", group="格局", label="月令格局", value=s["pattern"], note=s["pattern_note"],
                          how="以月支本氣對日主的十神取格；比肩為建祿格，劫財陽干為羊刃格、陰干為月劫格。"))
    else:
        facts.append(Fact(id="bazi.strength", group="旺衰", label="日主旺衰", value=s["label"],
                          note="；".join(s["notes"]) + "。" + s["disclaimer"],
                          how="簡化計分：月令得令 +3／生日主 +2／失令 -2；其他三柱天干生扶 +1、耗洩 -1；地支藏干通根 +1。總分 ≥0 身強，否則身弱。"))
        facts.append(Fact(id="bazi.favourable", group="旺衰", label="喜用五行", value="、".join(s["favourable"]),
                          how="身強取剋洩耗（官殺、食傷、財）；身弱取生扶（印、比劫）。流派差異大，僅為課程示範規則。"))

    age = _age_on(birth.birth_date, today, school.bazi.xusui_boundary)
    this_year = _bazi_year_of(today)
    for dy in c.dayun:
        cur = date.fromisoformat(dy["start_date"]) <= today < date.fromisoformat(dy["start_date"]).replace(year=date.fromisoformat(dy["start_date"]).year + 10)
        facts.append(Fact(
            id=f"bazi.dayun.{dy['index']}", group="大運", label=f"第{dy['index']}大運",
            value=f"{dy['gz']}（{dy['start_year']}–{dy['start_year'] + 9} 年，虛歲 {dy['xusui']}–{dy['xusui'] + 9}）",
            note=f"天干{dy['stem_god']}、地支本氣{dy['branch_god']}" + ("・目前所在" if cur else ""),
            how="大運從月柱的下一個（順行）或上一個（逆行）干支起，每運十年；順逆由年干陰陽×性別決定。",
        ))
        if cur:
            facts.append(Fact(id="bazi.dayun.current", group="大運", label="目前大運", value=dy["gz"],
                              note=f"{dy['stem_god']}/{dy['branch_god']}"))
    if not c.dayun:
        facts.append(Fact(id="bazi.dayun.current", group="大運", label="目前大運", value="資料不足（性別未填）"))
    elif today < date.fromisoformat(c.dayun[0]["start_date"]):
        d0 = c.dayun[0]
        facts.append(Fact(id="bazi.dayun.current", group="大運", label="目前大運",
                          value=f"尚未起運（{d0['start_date']} 交運，虛歲 {d0['xusui']}，第一步大運 {d0['gz']}）",
                          note="起運前傳統以小運或月令論，本課程不另算"))

    fav = set(s["favourable"])
    for y in range(this_year, this_year + years_ahead + 1):
        ln = E.liunian(y, dm)
        se = E.STEM_ELEM[E.STEMS.index(ln["stem"])]
        be = E.BRANCH_ELEM[E.BRANCHES.index(ln["branch"])]
        tone = "喜用到位" if se in fav and be in fav else ("部分喜用" if se in fav or be in fav else "非喜用")
        facts.append(Fact(
            id=f"bazi.liunian.{y}", group="流年", label=f"{y} 流年", value=f"{ln['gz']}・{ln['stem_god']}/{ln['branch_god']}",
            note=f"流年五行 {se}{be}，對喜用 {'、'.join(s['favourable'])} 而言：{tone}" + ("・今年" if y == this_year else ""),
            how="流年干支＝(年−4) mod 10、mod 12（立春後算該年）；十神以流年天干與地支本氣對日主。",
        ))
    facts.append(Fact(id="bazi.liunian.current", group="流年", label="今年流年", value=E.liunian(this_year, dm)["gz"],
                      note="以立春為界" + (f"（今天尚未立春，仍算 {this_year} 年）" if this_year != today.year else "")))

    # 詳細盤面（納音、空亡、胎元、命宮、長生、神煞、關係、大運流年、流月、稱骨）
    from fortune.bazi import extras as X
    ex = X.build(c, birth, today=today)
    facts.append(Fact(id="bazi.relations", group="刑沖合會", label="盤內合沖",
                      value="、".join(r["text"] for r in ex.relations) or "無明顯合沖"))
    facts.append(Fact(id="bazi.lunar", group="基本", label="農曆生日", value=ex.lunar["text"]))
    facts.append(Fact(id="bazi.terms", group="基本", label="節氣",
                      value=f"{ex.terms['prev']['name']} {ex.terms['prev']['time'][5:].replace('T', ' ')} ～ {ex.terms['next']['name']} {ex.terms['next']['time'][5:].replace('T', ' ')}"))
    if c.qiyun:
        facts.append(Fact(id="bazi.qiyun", group="大運", label="起運", value=c.qiyun["text"],
                          how="陽男陰女順行數到下一個節、陰男陽女逆行數到上一個節；三天折一年（一天＝四個月、一時辰＝十天），交節時刻用手錶時間比。"))
    facts.append(Fact(id="bazi.taiyuan", group="基本", label="胎元", value=f"{ex.taiyuan['gz']}（{ex.taiyuan['nayin']}）"))
    if ex.minggong:
        facts.append(Fact(id="bazi.minggong", group="基本", label="命宮", value=f"{ex.minggong['gz']}（{ex.minggong['nayin']}）", note="生月以節為準，另一派以中氣為準"))
    for key, zh in (("year", "年柱"), ("month", "月柱"), ("day", "日柱"), ("hour", "時柱")):
        if key in ex.pillar_extra:
            e = ex.pillar_extra[key]
            facts.append(Fact(id=f"bazi.nayin.{key}", group="納音", label=f"{zh}納音", value=e["nayin"]))
            facts.append(Fact(id=f"bazi.kongwang.{key}", group="空亡", label=f"{zh}空亡", value=e["kongwang"]))
            facts.append(Fact(id=f"bazi.changsheng.{key}", group="長生", label=f"日主在{zh}地支", value=e["changsheng"]))
    facts.append(Fact(id="bazi.shensha", group="神煞", label="神煞",
                      value="、".join(f"{x['name']}（{x['where']}）" for x in ex.shensha) or "無",
                      note="；".join(f"{x['name']}：{x['basis']}" for x in ex.shensha),
                      how="全部查表：以年干／日干查貴人、祿刃；以年支／日支的三合局查將星、驛馬、桃花、華蓋、劫煞、亡神；紅鸞天喜、孤辰寡宿依年支；天醫依月支。表見 fortune/bazi/extras.py。"))
    facts.append(Fact(id="bazi.chenggu", group="稱骨", label="稱骨", value=ex.chenggu["text"], note=ex.chenggu["verse"] or ex.chenggu["note"],
                      how=f"袁天罡稱骨：年柱干支 {ex.chenggu['parts']['year']/10:.1f} 兩＋農曆月 {ex.chenggu['parts']['month']/10:.1f} 兩＋農曆日 {ex.chenggu['parts']['day']/10:.1f} 兩＋時辰 {ex.chenggu['parts']['hour']/10:.1f} 兩。"))

    pillars_payload = []
    for k in ("year", "month", "day", "hour"):
        if k in c.pillars:
            d = c.pillars[k].as_dict(dm)
            d.update(ex.pillar_extra.get(k, {}))
            pillars_payload.append(d)
    dayun_payload = [{**dy, **xd} for dy, xd in zip(c.dayun, ex.dayun_extra)]
    payload = {
        "pillars": pillars_payload,
        "day_master": dm, "strength": s, "dayun": dayun_payload, "age": age,
        "true_solar_time": c.true_solar_dt.strftime("%H:%M") if c.true_solar_dt else None,
        "solar_correction_min": c.solar_correction_min, "month_term": c.month_term,
        "lunar": ex.lunar, "terms": ex.terms, "qiyun": c.qiyun or None, "taiyuan": ex.taiyuan, "minggong": ex.minggong,
        "relations": ex.relations, "shensha": ex.shensha, "liuyue": ex.liuyue, "chenggu": ex.chenggu,
        "almanac": __import__("fortune.bazi.almanac", fromlist=["build"]).build(birth.birth_date, birth.birth_time.hour if birth.birth_time else None),
    }
    return ChartData(system="bazi", system_zh="八字", subject=birth.label(), birth=birth.model_dump(mode="json"),
                     cast_at=datetime.now(), facts=facts, payload=payload, warnings=c.warnings, missing=c.missing,
                     school=_school_info(school, "bazi"))


# ---------------------------------------------------------------- 紫微 → ChartData
def ziwei_chart(birth: BirthInput, *, today: date | None = None, years_ahead: int = 2, school=None, _no_alt: bool = False) -> ChartData:
    from fortune.ziwei import engine as Z
    from fortune.school import resolve as _resolve_school

    school = school or _resolve_school()
    today = today or date.today()
    c = Z.cast(birth, school=school)        # 無時辰會丟 NeedsBirthTime，由上層接住
    facts: list[Fact] = []
    lunar = c.lunar
    g = {"male": "男命", "female": "女命"}.get(birth.gender or "", "未填（大運／大限方向與男女命論法無法判定）")
    facts.append(Fact(id="ziwei.gender", group="基本", label="性別", value=g))
    facts.append(Fact(id="ziwei.lunar", group="基本", label="農曆生日",
                      value=f"{lunar['year_gz']}年{'閏' if lunar['is_leap'] else ''}{lunar['raw_month']}月{lunar['day']}日 {c.hour_branch}時",
                      note=lunar["note"]))
    life = c.palace("命宮")
    body = next(p for p in c.palaces if p.is_body)
    facts.append(Fact(id="ziwei.life_palace", group="基本", label="命宮", value=f"{life.stem}{life.branch}",
                      note=_stars_text(life), how="寅宮起正月順數到生月，再從該宮起子時逆數到生時；宮干用五虎遁。生月以農曆為準（閏月規則可設定）。"))
    facts.append(Fact(id="ziwei.body_palace", group="基本", label="身宮", value=f"在{body.name}（{body.branch}）",
                      note=_stars_text(body)))
    facts.append(Fact(id="ziwei.five_class", group="基本", label="五行局", value=c.five_class, how="命宮干支的納音五行：水二、木三、金四、土五、火六局。"))
    facts.append(Fact(id="ziwei.soul_star", group="基本", label="命主星", value=c.soul_star, note="依命宮地支而定，不是命宮裡的星"))
    facts.append(Fact(id="ziwei.body_star", group="基本", label="身主星", value=c.body_star, note="依生年地支而定"))

    for name in Z.PALACE_NAMES:
        p = c.palace(name)
        majors = "、".join(p.major) if p.major else "空宮"
        opp = c.palaces[(Z.BRANCHES.index(p.branch) + 6) % 12]
        note = _stars_text(p)
        if not p.major:
            note += f"；對宮{opp.name}主星 {'、'.join(opp.major) or '亦空'}，借對宮看"
        facts.append(Fact(id=f"ziwei.palace.{name}", group="宮位", label=f"{name}（{p.stem}{p.branch}）", value=majors, note=note))

    for star, hua in sorted(((s, h) for p in c.palaces for s, h in p.hua.items()), key=lambda x: Z.HUA_NAMES.index(x[1])):
        p = next(p for p in c.palaces if star in p.hua)
        facts.append(Fact(id=f"ziwei.hua.{hua}", group="四化", label=f"生年{hua}", value=f"{star}（在{p.name}）"))

    age = _age_on(birth.birth_date, today, school.bazi.xusui_boundary)
    cur = c.current_daxian(age)
    from fortune.ziwei import luck as L
    male = {"male": True, "female": False}.get(birth.gender or "")
    luck = L.build(c, male, today, sihua_variant=school.ziwei.sihua_variant, xusui=age)
    if cur:
        dx = next((d for d in (luck or {}).get("daxian", []) if d["current"]), None)
        note = _stars_text(cur)
        if dx:
            note += f"；大限四化（{dx['stem']}干）：" + "、".join(f"{h}入{dx['sihua_landing'][h[-2:]]}" for h in dx["sihua"]) + f"；大限十二長生 {dx['changsheng']}"
        facts.append(Fact(id="ziwei.daxian.current", group="大限", label=f"目前大限（{age} 歲）",
                          value=f"{cur.name}（{cur.daxian[0]}–{cur.daxian[1]} 歲）", note=note,
                          how="第一大限從命宮起、以局數為起歲，每宮十年；陽男陰女順行（往父母宮）、陰男陽女逆行（往兄弟宮）。大限四化以大限宮干起。"))
    elif "gender" in c.missing:
        facts.append(Fact(id="ziwei.daxian.current", group="大限", label="目前大限", value="資料不足（性別未填）"))
    else:
        first = min((p for p in c.palaces if p.daxian), key=lambda p: p.daxian[0])
        facts.append(Fact(id="ziwei.daxian.current", group="大限", label=f"目前大限（{age} 歲）",
                          value=f"尚未起大限（{first.daxian[0]} 歲起第一大限，在{first.name}）", note="起限前傳統以童限論，本課程不另算"))

    lunar_this = _lunar_year_of(today)
    for y in range(lunar_this, lunar_this + years_ahead + 1):
        yb = (y - 4) % 12
        ys = Z.STEMS[(y - 4) % 10]
        p = c.palaces[yb]
        hua = "、".join(f"{s}{h}" for s, h in zip(Z.SIHUA[ys], Z.HUA_NAMES))
        ln = next((x for d in (luck or {}).get("daxian", []) for x in d["liunian"] if x["year"] == y), None)
        extra = ""
        if ln:
            land = "、".join(f"{h}入{ln['sihua_landing'][h[-2:]]}" for h in ln["sihua"])
            fs = "、".join(f"{k}{v}" for k, v in ln["flow_stars"].items())
            extra = f"；四化落宮：{land}；流曜：{fs}"
        facts.append(Fact(id=f"ziwei.liunian.{y}", group="流年", label=f"{y} 流年命宮",
                          value=f"落在本命{p.name}（{p.branch}）：{'、'.join(p.major) or '空宮'}",
                          note=f"流年四化（{ys}干）：{hua}" + extra + ("・今年" if y == lunar_this else "") + ("（以農曆新年為界）" if lunar_this != today.year and y == lunar_this else ""),
                          how="流年命宮＝該年地支所在的本命宮；流年四化以該年天干起；流祿羊陀魁鉞昌依年干、流馬依年支三合。"))

    enrich = L.iztro_enrich(birth.birth_date, Z.BRANCHES.index(c.hour_branch), bool(male), school.ziwei.late_zi == "next_day") if male is not None else None
    pal_payload = []
    for p in c.palaces:
        d = p.as_dict()
        d["changsheng"] = getattr(p, "changsheng", None)
        d["boshi"] = getattr(p, "boshi", None)
        if enrich and p.branch in enrich["palaces"]:
            d["brightness"] = enrich["palaces"][p.branch]["brightness"]
            d["adjective_stars"] = enrich["palaces"][p.branch]["adjective_stars"]
        pal_payload.append(d)
    payload = {
        "palaces": pal_payload, "life_branch": c.life_branch, "body_branch": c.body_branch,
        "five_class": c.five_class, "soul_star": c.soul_star, "body_star": c.body_star, "lunar": lunar,
        "hour_branch": c.hour_branch, "age": age,
        "luck": luck, "enrich": ({"patterns": enrich["patterns"], "source": enrich["source"]} if enrich else None),
    }
    return ChartData(system="ziwei", system_zh="紫微斗數", subject=birth.label(), birth=birth.model_dump(mode="json"),
                     cast_at=datetime.now(), facts=facts, payload=payload, warnings=c.warnings, missing=c.missing,
                     school=_school_info(school, "ziwei"))


# ---------------------------------------------------------------- 姓名學 → ChartData
_GRID_ROLE = {
    "天格": "祖運：姓氏帶來的先天格，多數流派認為影響小、不單獨論吉凶",
    "人格": "主運：姓名的核心，主性格與一生主軸",
    "地格": "前運：名字的部分，主早年、家庭、配偶與子女",
    "外格": "副運：主人際、外在環境與社交",
    "總格": "後運：全名合計，主中晚年與整體",
}
_HOW_GRID = {
    "天格": "單姓：姓的筆畫＋假數 1；複姓：兩字相加。",
    "人格": "姓的最後一字＋名的第一字。",
    "地格": "單名：名的筆畫＋假數 1；雙名以上：名字各字相加。",
    "外格": "天格＋地格－人格（加假數時，單姓雙名＝1＋名末字、單姓單名固定為 2）。",
    "總格": "姓名全部筆畫相加，不含假數。",
}
_HOW_NUM = "數理吉凶查 81 數理表（超過 81 減 80 循環）；五行看尾數：1、2 木，3、4 火，5、6 土，7、8 金，9、0 水；奇數陽、偶數陰。"


def xingming_chart(birth: BirthInput, *, today: date | None = None, years_ahead: int = 2, school=None, _no_alt: bool = False) -> ChartData:
    from fortune.bazi import engine as E
    from fortune.school import resolve as _resolve_school
    from fortune.xingming import engine as N

    school = school or _resolve_school()
    nc = N.analyze(birth.full_name or "", N.Rules(**school.xingming.model_dump()))   # 姓名不合規丟 NameInputError，由上層接住
    facts: list[Fact] = []
    facts.append(Fact(id="xingming.name", group="姓名", label="姓名", value=nc.surname + nc.given,
                      note=f"{'複姓' if len(nc.surname) > 1 else '單姓'}「{nc.surname}」、{'單名' if len(nc.given) == 1 else f'{len(nc.given)} 字名'}「{nc.given}」；{nc.split_note}"))
    for i, c in enumerate(nc.chars, 1):
        facts.append(Fact(id=f"xingming.char.{i}", group="筆畫", label=f"{c.char}（{c.role}）", value=f"{c.strokes} 畫",
                          note=f"康熙 {c.kangxi} 畫、現代 {c.modern} 畫" + (f"；簡化字，以正體「{c.traditional}」計" if c.traditional else ""),
                          how=c.how))
    for name in N.GRID_NAMES:
        g = nc.grids[name]
        num = f"{g.number}" + (f"（數理取 {g.shuli}）" if g.shuli != g.number else "")
        facts.append(Fact(id=f"xingming.ge.{N.GRID_IDS[name]}", group="五格", label=name,
                          value=f"{num}・{g.element}・{g.luck}", note=f"{g.yinyang}數；{g.formula}；{_GRID_ROLE[name]}",
                          how=_HOW_GRID[name] + _HOW_NUM))
    t, r, d = (nc.grids[x].element for x in ("天格", "人格", "地格"))
    facts.append(Fact(id="xingming.sancai", group="三才", label="三才配置", value=nc.sancai,
                      note=f"天格{t}、人格{r}、地格{d}；" + "；".join(nc.relations[k]["text"] for k in ("成功運", "基礎運")),
                      how="三才＝天格、人格、地格三格的五行，依序排列。"))
    for key, fid, axis in (("成功運", "success", "天格與人格"), ("基礎運", "base", "人格與地格"), ("社交運", "social", "人格與外格")):
        rel = nc.relations[key]
        facts.append(Fact(id=f"xingming.yun.{fid}", group="三才", label=key, value=rel["kind"], note=rel["text"],
                          how=f"看{axis}兩格五行的生剋：相生、比和、相剋。課程規則：相生 +1、比和 0、相剋 −1。"))

    # 八字連動：姓名的五行對照八字喜用（同一套旺衰規則）
    bc = E.cast(birth, school=school)
    s = bc.strength
    fav = list(s["favourable"])
    avoid = list(s.get("avoid") or [e for e in N.ELEMENTS if e not in fav])
    dm = bc.day_master
    tag = lambda e: "喜用" if e in fav else ("忌" if e in avoid else "閒")  # noqa: E731
    facts.append(Fact(id="xingming.bazi.favourable", group="八字配合", label="八字喜用五行", value="、".join(fav),
                      note=f"忌 {'、'.join(avoid) or '無'}；日主{dm}{E.STEM_ELEM[E.STEMS.index(dm)]}，{s['label'].split('（')[0]}"
                           + ("；時辰不明，喜用依三柱估算" if "hour" in bc.missing else ""),
                      how="與八字排盤 bazi.favourable 同一套旺衰規則（流派的旺衰開關也套用）。"))
    facts.append(Fact(id="xingming.bazi.link", group="八字配合", label="人格五行對八字", value=f"人格{r}：{tag(r)}",
                      note=f"天格{t}（{tag(t)}）、人格{r}（{tag(r)}）、地格{d}（{tag(d)}）、外格{nc.grids['外格'].element}（{tag(nc.grids['外格'].element)}）、總格{nc.grids['總格'].element}（{tag(nc.grids['總格'].element)}）",
                      how="各格五行落在八字喜用為「喜用」、落在忌神為「忌」，其餘為「閒」。姓名學論八字以人格為主。"))

    payload = {
        "surname": nc.surname, "given": nc.given, "split_note": nc.split_note,
        "chars": [{"char": c.char, "role": c.role, "strokes": c.strokes, "kangxi": c.kangxi, "modern": c.modern,
                   "traditional": c.traditional, "how": c.how} for c in nc.chars],
        "grids": [{"name": g.name, "id": N.GRID_IDS[g.name], "number": g.number, "shuli": g.shuli, "element": g.element,
                   "yinyang": g.yinyang, "luck": g.luck, "formula": g.formula, "role": _GRID_ROLE[g.name], "bazi": tag(g.element)}
                  for g in nc.grids.values()],
        "sancai": nc.sancai, "relations": nc.relations,
        "bazi": {"favourable": fav, "avoid": avoid, "day_master": dm, "strength": s["label"].split("（")[0]},
    }
    return ChartData(system="xingming", system_zh="姓名學", subject=birth.label(), birth=birth.model_dump(mode="json"),
                     cast_at=datetime.now(), facts=facts, payload=payload, warnings=nc.warnings, missing=[],
                     school=_school_info(school, "xingming"))


def _stars_text(p) -> str:
    parts = []
    if p.major:
        parts.append("主星 " + "、".join(s + (f"({p.hua[s]})" if s in p.hua else "") for s in p.major))
    if p.lucky:
        parts.append("吉星 " + "、".join(s + (f"({p.hua[s]})" if s in p.hua else "") for s in p.lucky))
    if p.unlucky:
        parts.append("煞星 " + "、".join(p.unlucky))
    if p.other:
        parts.append("、".join(p.other))
    return "；".join(parts) or "無星"


def _school_info(school, system: str | None = None) -> dict[str, Any]:
    return {"name": school.name, "title": school.title, "source": school.source, "summary": school.summary(system),
            "settings": {"bazi": school.bazi.model_dump(), "ziwei": school.ziwei.model_dump(), "xingming": school.xingming.model_dump()}}


# 哪些開關會影響哪個系統的盤；換一派重排一次、把值不同的事實標出來
_SWITCHES = {
    "bazi": [("bazi", k) for k in ("year_boundary", "month_stem_follows", "late_zi", "true_solar_time", "minggong_month", "yangren_yin_stems", "xusui_boundary", "chenggu_year")],
    "ziwei": [("ziwei", k) for k in ("leap_month", "sihua_variant", "hour_source", "late_zi", "tianma_basis")] + [("bazi", "xusui_boundary")],
    "xingming": [("xingming", k) for k in ("stroke_basis", "numeral_strokes", "jiashu")] + [("bazi", "strength_method")],
}


_CHART_FN = {"bazi": bazi_chart, "ziwei": ziwei_chart, "xingming": xingming_chart}


def _attach_alternatives(chart: ChartData, birth: BirthInput, today: date, school, years_ahead: int) -> None:
    """對每個流派開關，用其他選項重排一次，值不一樣的事實記到 alternatives。"""
    from fortune.school import OPTION_LABELS, School
    from fortune.ziwei.engine import NeedsBirthTime
    base = {f.id: f for f in chart.facts}
    for sysname, key in _SWITCHES[chart.system]:
        current = getattr(getattr(school, sysname), key)
        for option in OPTION_LABELS[sysname][key]:
            if option == current:
                continue
            data = school.model_dump()
            data[sysname][key] = option
            alt_school = School.model_validate(data)
            try:
                alt = _CHART_FN[chart.system](birth, today=today, years_ahead=years_ahead, school=alt_school, _no_alt=True)
            except NeedsBirthTime:
                continue
            for f in alt.facts:
                b = base.get(f.id)
                if b and b.value != f.value and not f.id.startswith(("bazi.liunian.", "ziwei.liunian.", "bazi.dayun.")):
                    b.alternatives.append({"switch": f"{sysname}.{key}", "option": option,
                                           "label": OPTION_LABELS[sysname][key][option], "value": f.value})
    chart.payload["school_dependent"] = [f.id for f in chart.facts if f.alternatives]


def cast(system: str, birth: BirthInput, *, school=None, school_name: str | None = None,
         overrides: dict[str, Any] | None = None, with_alternatives: bool = True, **kw) -> ChartData:
    """school（School 物件）或 school_name＋overrides 擇一；預設會附上「換一派會得到什麼」。"""
    from fortune.school import resolve as _resolve_school
    school = school or _resolve_school(school_name, overrides)
    birth = birth.with_geo()
    if system not in _CHART_FN:
        raise KeyError(f"未知系統：{system}（課程版有 bazi / ziwei / xingming）")
    chart = _CHART_FN[system](birth, school=school, **kw)
    if with_alternatives:
        _attach_alternatives(chart, birth, kw.get("today") or date.today(), school, kw.get("years_ahead", 2))
    return chart
