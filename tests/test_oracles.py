"""開源引擎互證（4-2 進階）：lunar-python 驗八字，x-iztro 驗紫微。沒裝 oracles 套件就整個 skip。
pip install -e ".[oracles]"
"""

import pytest

lunar_python = pytest.importorskip("lunar_python")
x_iztro = pytest.importorskip("x_iztro")

from fortune.birth import BirthInput  # noqa: E402
from fortune.tools.oracle_check import compare_bazi, compare_ziwei, random_births  # noqa: E402

CASES = [
    dict(birth_date="1990-06-15", birth_time="14:30", gender="female"),
    dict(birth_date="2026-10-08", birth_time="15:57", gender="male"),     # 寒露交界（排盤網站算錯的那張）
    dict(birth_date="2024-02-04", birth_time="15:00", gender="male"),     # 立春前
    dict(birth_date="2024-02-04", birth_time="17:00", gender="male"),     # 立春後
    dict(birth_date="2023-04-10", birth_time="10:00", gender="female"),   # 閏月
    dict(birth_date="1984-02-05", birth_time="00:30", gender="male"),
    dict(birth_date="2000-01-07", birth_time="23:30", gender="male"),     # 晚子時（sect=1 換日）
]


@pytest.mark.parametrize("case", CASES, ids=[c["birth_date"] + " " + c["birth_time"] for c in CASES])
def test_bazi_matches_lunar_python(case):
    assert compare_bazi(BirthInput(**case, longitude=121.5)) == []


@pytest.mark.parametrize("case", CASES, ids=[c["birth_date"] + " " + c["birth_time"] for c in CASES])
def test_ziwei_matches_x_iztro(case):
    assert compare_ziwei(BirthInput(**case, longitude=121.5)) == []


def test_random_sample_agrees():
    bad = [(b.label(), compare_bazi(b), compare_ziwei(b)) for b in random_births(40, seed=5)]
    bad = [x for x in bad if x[1] or x[2]]
    assert bad == [], bad


def test_lunar_python_default_late_zi_is_our_third_school():
    # lunar-python sect=2（預設）：2000-01-07 23:30 → 日柱甲子不換、時柱丙子（時干依隔日乙）
    from fortune.chart import cast
    c = cast("bazi", BirthInput(birth_date="2000-01-07", birth_time="23:30", gender="male", longitude=121.5),
             overrides={"bazi": {"late_zi": "same_day_next_hour_stem"}}, with_alternatives=False)
    assert c.fact("bazi.pillar.day").value == "甲子" and c.fact("bazi.pillar.hour").value == "丙子"
