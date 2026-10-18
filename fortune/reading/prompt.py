"""組 prompt（5-2）：AI 拿到的只有「引擎算好的盤面事實」和「查到的知識卡」。
程式算得出來的東西一律不問 AI；方向也由程式先定。"""

from __future__ import annotations

from fortune.chart import ChartData
from fortune.knowledge.store import Card
from fortune.reading.persona import Persona
from fortune.reading.sections import Direction, sections_for


def output_format(system: str = "bazi") -> str:
    titles = [t for _, t in sections_for(system)]
    rest = "\n".join(f"## {t}" for t in titles[2:])
    return f"""輸出格式（嚴格遵守，六段都要有，順序固定，不加其他標題）：

## {titles[0]}
方向：吉／平／凶（照我給的方向，不可自行更改）
（內文 120–200 字）
依據：事實id, 事實id, ...
知識卡：卡id, 卡id（沒有就寫「無」）

## {titles[1]}
...（同上）
{rest}
"""


OUTPUT_FORMAT = output_format()

# 「不可自行推算」的範圍，依系統而定
_NO_CAST = {"bazi": "干支、十神、星曜或宮位", "ziwei": "干支、十神、星曜或宮位", "xingming": "筆畫、五格數字或八字喜用"}


def system_prompt(persona: Persona, system: str = "bazi") -> str:
    """固定不變的部分（人設、規則、格式）放 system，可被快取。"""
    rules = "\n".join(f"- {r}" for r in persona.tone_rules) or "- 只根據提供的事實與知識卡說話"
    return f"""你是命理師「{persona.name}」。{persona.style}

硬規則：
{rules}
- 你不會排盤。盤面已由程式算好，列在「盤面事實」裡，每條前面有 [id]。你只能解讀這些事實，不可自行推算{_NO_CAST.get(system, _NO_CAST["bazi"])}。
- 每一段的「依據」只能寫出現在盤面事實裡的 id；「知識卡」只能寫我提供的卡 id。沒有依據的句子不要寫。
- 每段的「方向」我已經先判定好，照抄，不可改。你可以在內文裡用措辭表達程度，但結論方向必須一致。
- 不談醫療診斷、投資標的或進出時機、法律結論、壽命生死；不說「保證」「百分之百」「一定會」。
- 資料不足（時辰不明、性別未填）時，相關判斷要明說「資料不足」，不要補猜。
- 盤面事實末尾列出的「流派歧見」是換一派會得到的不同結果；提到那些格子時要說明本盤依哪一派，不可自行換派。
- 用繁體中文，口語但不輕浮，每段獨立成文。

{output_format(system)}"""


def user_prompt(chart: ChartData, cards: list[Card], dirs: list[Direction], focus: str | None = None) -> str:
    dir_lines = "\n".join(f"- {t}（{d.key}）：{d.direction}　理由：{d.reason}　相關事實：{', '.join(d.evidence)}"
                          for (k, t), d in zip(sections_for(chart.system), dirs))
    cards_text = "\n\n".join(c.brief() for c in cards) or "（無）"
    focus_line = f"\n\n命主特別想問：{focus}（請在相關段落多著墨，但仍只用上面的事實與卡）" if focus else ""
    return f"""命主：{chart.subject}
系統：{chart.system_zh}
流派：{chart.school.get('summary', '課程預設')}

=== 盤面事實（唯一可用的依據）===
{chart.facts_text()}

=== 各段方向（程式已判定，照抄）===
{dir_lines}

=== 知識卡（唯一可引用的卡）===
{cards_text}{focus_line}

請依格式輸出六段解讀。"""
