"""人設設定檔（7-2）— persona/master.yaml。想換風格只改那個檔。"""

from __future__ import annotations

from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

import yaml

from fortune.config import get_settings


@dataclass
class Refusal:
    topic: str
    patterns: list[str]
    reply: str


@dataclass
class Persona:
    name: str = "玄機"
    title: str = "玄機先生"
    style: str = "溫和、節制，每句話都有依據。"
    opening: str = "請坐。報上生辰，我們一格一格看。"
    closing: str = "以上僅供參考，決定在你。"
    tone_rules: list[str] = field(default_factory=list)
    refusals: list[Refusal] = field(default_factory=lambda: [
        Refusal("醫療", ["生病", "會不會病", "癌", "開刀", "手術", "懷孕", "不孕", "壽命", "診斷"], "健康的事我不便從命盤斷言，請以醫師的判斷為準。我們可以談的是作息與壓力的面向。"),
        Refusal("投資", ["買股票", "股票", "比特幣", "加密", "進場", "出場", "樂透", "彩券", "期貨"], "具體標的與進出時機不在我的範圍。我能談的是財運的起伏與理財性格。"),
        Refusal("法律", ["官司", "訴訟", "提告", "判決", "違法"], "法律結果請交給律師。我可以談的是這段時間人際與是非的傾向。"),
        Refusal("生死", ["會死", "死期", "幾歲死", "活到", "自殺", "輕生"], "生死不是命盤能回答的。若你此刻很難受，請撥打安心專線 1925 或生命線 1995，有人願意聽你說。"),
    ])
    disclaimer: str = "本解讀為 AI 依命盤事實生成，僅供參考，不替代醫療、法律、財務等專業意見。"
    suggestions: list[str] = field(default_factory=lambda: [
        "我的性格有什麼特質？", "最近有桃花嗎？", "明年適合換工作嗎？", "我的財運怎麼看？",
        "今年整體運勢如何？", "正官是什麼意思？", "我的大運現在走到哪？", "紫微的命宮主星代表什麼？",
    ])

    def match_refusal(self, text: str) -> Refusal | None:
        for r in self.refusals:
            if any(p and p in text for p in r.patterns):
                return r
        return None

    def public(self) -> dict:
        return {"name": self.name, "title": self.title, "opening": self.opening,
                "closing": self.closing, "disclaimer": self.disclaimer,
                "refusal_topics": [r.topic for r in self.refusals], "suggestions": self.suggestions}


@lru_cache
def load_persona(path: str | None = None) -> Persona:
    p = Path(path) if path else get_settings().persona_path
    if not p.exists():
        return Persona()
    raw = yaml.safe_load(p.read_text(encoding="utf-8")) or {}
    refusals = [Refusal(topic=str(r.get("topic", "")), patterns=[str(x) for x in r.get("patterns", [])],
                        reply=str(r.get("reply", "")).strip()) for r in raw.get("refusals", [])]
    return Persona(
        name=str(raw.get("name", "玄機")), title=str(raw.get("title", "玄機先生")),
        style=str(raw.get("style", "")).strip(), opening=str(raw.get("opening", "")).strip(),
        closing=str(raw.get("closing", "")).strip(), tone_rules=[str(x) for x in raw.get("tone_rules", [])],
        refusals=refusals, disclaimer=str(raw.get("disclaimer", "")).strip(),
        **({"suggestions": [str(x) for x in raw["suggestions"]]} if raw.get("suggestions") else {}),
    )
