"""流派設定（4-3 延伸）— 流派不是對錯，是「可查的選擇」。

每個開關對應程式裡一個分支點；選項是封閉的枚舉（不是自由文字），所以：
1. 排盤仍是確定性的、可測試的
2. 兩個流派可以逐格 diff（fortune.tools.compare_schools）
3. AI 看得到這張盤用的是哪一派，解讀時能說「依你選的 X 派」

檔案放 schools/<name>.yaml；.env 的 SCHOOL 選站台預設；API 可帶 school 或 overrides 單次覆寫。
想加一派：複製 default.yaml 改開關、填 source（出處）。想加一個新選項：改這裡的 Literal、在引擎加分支、補標準命例。
"""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Any, Literal

import yaml
from pydantic import BaseModel, Field, ValidationError

from fortune.config import ROOT, get_settings

SCHOOLS_DIR = ROOT / "schools"


class BaziRules(BaseModel):
    year_boundary: Literal["lichun", "lunar_new_year"] = "lichun"          # 年柱換年：立春｜農曆新年
    month_stem_follows: Literal["year_pillar", "lichun_year"] = "year_pillar"  # 月干（五虎遁）依：年柱天干｜立春年天干（只在農曆新年換年時有差）
    late_zi: Literal["next_day", "same_day", "same_day_next_hour_stem"] = "next_day"   # 晚子時日柱：換日｜不換｜不換但時干依隔日日干（lunar-python 預設）
    true_solar_time: Literal["on", "off"] = "on"                          # 時辰是否換算真太陽時
    minggong_month: Literal["jie", "zhongqi"] = "jie"                      # 八字命宮的生月：以節｜以中氣
    yangren_yin_stems: Literal["chenwei", "yinshen", "none"] = "chenwei"   # 陰干羊刃：乙辰丁未己未辛戌癸丑｜乙寅丁申己申辛亥癸巳｜不論
    xusui_boundary: Literal["lunar_new_year", "lichun"] = "lunar_new_year"  # 虛歲加一的時點
    chenggu_year: Literal["lichun", "lunar_year"] = "lichun"               # 稱骨的年：年柱（立春）｜農曆年
    strength_method: Literal["score_v2", "score_v1"] = "score_v2"          # 旺衰：v2 可稽核（月令旺相休囚死＋加權通根＋透干＋用神調候格局）｜v1 課程簡化計分


class ZiweiRules(BaseModel):
    leap_month: Literal["split", "same", "next"] = "split"                 # 閏月：上半歸本月下半歸次月｜全算本月｜全算次月
    sihua_variant: Literal["standard", "tianfu_ke", "tianxiang_ji"] = "standard"  # 庚壬四化變體
    hour_source: Literal["true_solar", "clock"] = "true_solar"             # 時支用真太陽時｜手錶時間
    late_zi: Literal["same_day", "next_day"] = "same_day"                  # 晚子時的農曆日：不換｜換隔日
    tianma_basis: Literal["year_branch", "month_branch"] = "year_branch"   # 天馬以年支｜月支起


class XingmingRules(BaseModel):
    stroke_basis: Literal["kangxi", "modern"] = "kangxi"                   # 筆畫：康熙（部首還原原形）｜現代
    numeral_strokes: Literal["value", "shape"] = "value"                   # 一～十：照數值（四算 4、九算 9）｜照字形
    jiashu: Literal["on", "off"] = "on"                                    # 單姓天格、單名地格加假數 1｜不加


class School(BaseModel):
    name: str = "default"
    title: str = "課程預設"
    source: str = "課程編寫，綜合通論"
    description: str = ""
    bazi: BaziRules = Field(default_factory=BaziRules)
    ziwei: ZiweiRules = Field(default_factory=ZiweiRules)
    xingming: XingmingRules = Field(default_factory=XingmingRules)

    def summary(self, system: str | None = None) -> str:
        """給 AI 與畫面看的一行說明。姓名學的開關只在姓名學的盤上列出。"""
        b, z = self.bazi, self.ziwei
        parts = [
            f"年柱以{'立春' if b.year_boundary == 'lichun' else '農曆新年'}換年",
            f"晚子時{'換日' if b.late_zi == 'next_day' else '不換日'}",
            f"時辰{'用真太陽時' if b.true_solar_time == 'on' else '用手錶時間'}",
            f"命宮生月以{'節' if b.minggong_month == 'jie' else '中氣'}",
            f"閏月{ {'split': '上半歸本月下半歸次月', 'same': '全算本月', 'next': '全算次月'}[z.leap_month]}",
            f"四化{ {'standard': '通行表', 'tianfu_ke': '庚壬天府化科', 'tianxiang_ji': '庚天相化忌'}[z.sihua_variant]}",
        ]
        if system == "xingming":
            parts.append(f"姓名筆畫{'用康熙' if self.xingming.stroke_basis == 'kangxi' else '用現代'}")
        return f"{self.title}：" + "、".join(parts)

    def as_dict(self) -> dict[str, Any]:
        return self.model_dump()


OPTION_LABELS: dict[str, dict[str, dict[str, str]]] = {
    "bazi": {
        "year_boundary": {"lichun": "立春換年（通行）", "lunar_new_year": "農曆新年換年（民俗）"},
        "month_stem_follows": {"year_pillar": "月干跟著年柱天干（五虎遁）", "lichun_year": "月干永遠依立春年天干（只換年柱不動月柱）"},
        "late_zi": {"next_day": "晚子時換日柱", "same_day": "晚子時不換日柱", "same_day_next_hour_stem": "晚子時日柱不換、時干依隔日日干"},
        "true_solar_time": {"on": "時辰用真太陽時", "off": "時辰用手錶時間"},
        "minggong_month": {"jie": "命宮生月以節", "zhongqi": "命宮生月以中氣"},
        "yangren_yin_stems": {"chenwei": "陰干羊刃取辰未戌丑", "yinshen": "陰干羊刃取寅申巳亥", "none": "陰干不論羊刃"},
        "xusui_boundary": {"lunar_new_year": "虛歲過農曆年加一", "lichun": "虛歲過立春加一"},
        "chenggu_year": {"lichun": "稱骨年用年柱", "lunar_year": "稱骨年用農曆年"},
        "strength_method": {"score_v2": "旺衰 v2：月令旺相休囚死＋加權通根＋透干，附用神／調候／格局", "score_v1": "旺衰 v1：課程簡化計分（月令±、天干生扶、通根）"},
    },
    "ziwei": {
        "leap_month": {"split": "閏月上半歸本月、下半歸次月", "same": "閏月全算本月", "next": "閏月全算次月"},
        "sihua_variant": {"standard": "四化通行表", "tianfu_ke": "庚壬年天府化科", "tianxiang_ji": "庚年天相化忌"},
        "hour_source": {"true_solar": "時支用真太陽時", "clock": "時支用手錶時間"},
        "late_zi": {"same_day": "晚子時農曆日不換", "next_day": "晚子時農曆日算隔日"},
        "tianma_basis": {"year_branch": "天馬以年支起", "month_branch": "天馬以月支起"},
    },
    "xingming": {
        "stroke_basis": {"kangxi": "康熙筆畫（部首還原：氵算水 4、艹算艸 6）", "modern": "現代筆畫（照字形數）"},
        "numeral_strokes": {"value": "一～十照數值算（四算 4、九算 9）", "shape": "一～十照字形算（四算 5、九算 2）"},
        "jiashu": {"on": "單姓天格、單名地格加假數 1", "off": "不加假數"},
    },
}


def schema() -> dict[str, Any]:
    """所有開關與選項（給 /api/schools 與網頁面板）。"""
    return {sysname: {field: {"options": opts, "default": getattr(getattr(School(), sysname), field)}
                      for field, opts in fields.items()} for sysname, fields in OPTION_LABELS.items()}


@lru_cache
def load_school(name: str) -> School:
    p = SCHOOLS_DIR / f"{name}.yaml"
    if not p.exists():
        if name == "default":
            return School()
        raise KeyError(f"沒有 {name} 這個流派（schools/{name}.yaml）")
    raw = yaml.safe_load(p.read_text(encoding="utf-8")) or {}
    raw.setdefault("name", name)
    try:
        return School.model_validate(raw)
    except ValidationError as e:
        raise ValueError(f"schools/{name}.yaml 格式錯誤：{e}") from e


def list_schools() -> list[dict[str, str]]:
    out = []
    for p in sorted(SCHOOLS_DIR.glob("*.yaml")):
        try:
            s = load_school(p.stem)
            out.append({"name": s.name, "title": s.title, "source": s.source, "description": s.description})
        except Exception as e:  # noqa: BLE001
            out.append({"name": p.stem, "title": f"{p.stem}（讀取失敗）", "source": "", "description": str(e)})
    if not any(x["name"] == "default" for x in out):
        out.insert(0, {"name": "default", "title": "課程預設", "source": "課程編寫", "description": ""})
    return out


def resolve(name: str | None = None, overrides: dict[str, Any] | None = None) -> School:
    """站台預設（.env SCHOOL）→ 指定流派 → 單次覆寫，依序疊上去。"""
    base = load_school(name or get_settings().school or "default")
    if not overrides:
        return base
    data = base.model_dump()
    for sysname in ("bazi", "ziwei", "xingming"):
        for k, v in (overrides.get(sysname) or {}).items():
            if k in data[sysname]:
                data[sysname][k] = v
    data["name"] = f"{base.name}+custom"
    data["title"] = f"{base.title}（單次覆寫）"
    return School.model_validate(data)        # 不合法的選項值會在這裡丟 ValidationError
