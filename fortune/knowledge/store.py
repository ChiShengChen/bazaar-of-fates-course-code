"""知識卡倉庫 — 讀 cards/*.md，依命盤事實挑出相關的卡（5-1、5-2）。"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

import yaml

from fortune.chart import ChartData
from fortune.config import get_settings


@dataclass
class Card:
    id: str
    name: str
    type: str
    system: str
    keywords: list[str]
    source: str
    body: str                       # frontmatter 之後的 Markdown
    sections: dict[str, str] = field(default_factory=dict)   # 意義/正面/負面/常見組合/出處

    def brief(self) -> str:
        """給 AI 讀的精簡版：意義＋正面＋負面。"""
        parts = [f"【{self.id}】{self.name}（{self.type}）"]
        for k in ("意義", "正面", "負面", "常見組合"):
            if k in self.sections:
                parts.append(f"{k}：{self.sections[k].strip()}")
        return "\n".join(parts)

    def as_dict(self) -> dict:
        return {"id": self.id, "name": self.name, "type": self.type, "system": self.system,
                "keywords": self.keywords, "source": self.source, "sections": self.sections, "body": self.body}


_FM = re.compile(r"^---\s*\n(.*?)\n---\s*\n(.*)$", re.S)


def parse_card(path: Path) -> Card:
    text = path.read_text(encoding="utf-8")
    m = _FM.match(text)
    if not m:
        raise ValueError(f"{path.name}: 缺少 frontmatter")
    meta = yaml.safe_load(m.group(1)) or {}
    body = m.group(2)
    sections: dict[str, str] = {}
    for sec in re.split(r"^## ", body, flags=re.M)[1:]:
        title, _, content = sec.partition("\n")
        sections[title.strip()] = content.strip()
    kws = meta.get("keywords") or [meta.get("name", "")]
    return Card(id=str(meta["id"]), name=str(meta.get("name", "")), type=str(meta.get("type", "")),
                system=str(meta.get("system", "")), keywords=[str(k) for k in kws],
                source=str(meta.get("source", "")), body=body, sections=sections)


@lru_cache
def load_cards(cards_dir: str | None = None) -> dict[str, Card]:
    d = Path(cards_dir) if cards_dir else get_settings().cards_dir
    cards: dict[str, Card] = {}
    for p in sorted(d.glob("*.md")):
        c = parse_card(p)
        cards[c.id] = c
    return cards


def get_card(card_id: str) -> Card | None:
    return load_cards().get(card_id)


def select_cards(chart: ChartData, limit: int = 30) -> list[Card]:
    """依命盤事實的 value/note 裡出現的關鍵字，挑出這張盤用得到的卡。
    八字：十神與旺衰；紫微：命宮／夫妻／官祿／財帛／遷移／福德的主星、吉煞、四化；姓名學：五格、數理、三才、八字配合。"""
    cards = [c for c in load_cards().values() if c.system == chart.system]
    if chart.system == "bazi":
        text = " ".join(f.value + " " + f.note for f in chart.facts
                        if (f.group in ("十神", "旺衰", "神煞") and f.id != "bazi.gods.absent") or f.id in ("bazi.dayun.current", "bazi.liunian.current")
                        or f.id.startswith("bazi.liunian.") or f.id in ("bazi.changsheng.day", "bazi.changsheng.month"))
    elif chart.system == "xingming":
        text = " ".join(f.label + " " + f.value + " " + f.note for f in chart.facts if f.group != "筆畫")
    else:
        keys = ("ziwei.palace.命宮", "ziwei.palace.夫妻宮", "ziwei.palace.官祿宮", "ziwei.palace.財帛宮",
                "ziwei.palace.遷移宮", "ziwei.palace.福德宮", "ziwei.daxian.current", "ziwei.body_palace")
        text = " ".join(f.value + " " + f.note for f in chart.facts
                        if f.id in keys or f.group == "四化" or f.id.startswith("ziwei.liunian."))
        text += " 命宮 夫妻宮 官祿宮 財帛宮 遷移宮 福德宮"
    hits: list[tuple[int, Card]] = []
    for c in cards:
        n = sum(text.count(k) for k in c.keywords if k)
        if n:
            hits.append((n, c))
    hits.sort(key=lambda x: -x[0])
    return [c for _, c in hits[:limit]]
