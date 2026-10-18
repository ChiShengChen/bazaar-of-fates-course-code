"""黃曆區塊（可選）— 由 lunar-python（MIT）提供：二十八宿、建除十二神、彭祖百忌、吉神凶煞、宜忌、方位、胎息。
沒裝套件就回 None，不影響排盤。lunar-python 回簡體，這裡以靜態對照表（almanac_zh_tw）轉成繁體台灣用語。"""

from __future__ import annotations

from datetime import date


def build(d: date, hour: int | None = None) -> dict | None:
    try:
        from lunar_python import Solar
    except Exception:  # noqa: BLE001
        return None
    try:
        from fortune.bazi.almanac_zh_tw import tw
        s = Solar.fromYmdHms(d.year, d.month, d.day, hour if hour is not None else 12, 0, 0)
        l = s.getLunar()
        ec = l.getEightChar()
        return tw({
            "xiu": f"{l.getXiu()}{l.getZheng()}{l.getAnimal()}", "xiu_luck": l.getXiuLuck(),
            "zhixing": l.getZhiXing(), "pengzu": [l.getPengZuGan(), l.getPengZuZhi()],
            "day_yi": l.getDayYi()[:8], "day_ji": l.getDayJi()[:8],
            "jishen": l.getDayJiShen()[:8], "xiongsha": l.getDayXiongSha()[:8],
            "positions": {"喜神": l.getDayPositionXiDesc(), "福神": l.getDayPositionFuDesc(), "財神": l.getDayPositionCaiDesc()},
            "taixi": ec.getTaiXi(), "shengong": ec.getShenGong(), "mingong": ec.getMingGong(),
            "source": "lunar-python（MIT）；文字已轉繁體",
        })
    except Exception:  # noqa: BLE001
        return None
