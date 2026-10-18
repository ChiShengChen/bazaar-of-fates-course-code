"""設定 — 全部從環境變數／.env 讀（3-2：金鑰與程式分開放）。"""

from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parent.parent
# Vercel 上只有 /tmp 可以寫（而且每個執行個體各一份、重新部署就清空）；其他地方照舊寫在 repo 的 data/
DEFAULT_DATA_DIR = Path("/tmp/fortune") if os.environ.get("VERCEL") else ROOT / "data"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=ROOT / ".env", env_file_encoding="utf-8", extra="ignore")

    llm_backend: str = "mock"                     # mock | anthropic | openai | deepseek | gemini | openai_compatible
    llm_api_key: str = ""                         # 通用金鑰
    llm_model: str = ""                           # 留空用該家預設
    llm_base_url: str = ""                        # openai_compatible 用（Ollama 預設 http://localhost:11434/v1）
    anthropic_api_key: str = ""                   # 舊名，等同 LLM_API_KEY（只對 anthropic）
    anthropic_model: str = "claude-opus-5-5"      # 舊名，等同 LLM_MODEL（只對 anthropic）
    llm_thinking: str = "default"                 # default | off | low | high — 思考型模型的推理深度（各家對應不同參數）
    reading_max_tokens: int = 8000               # 含思考型模型的 reasoning token；被截斷會自動加倍重試一次

    rate_limit_per_ip_per_day: int = 20
    daily_reading_cap: int = 500
    daily_budget_usd: float = 5.0
    maintenance: bool = False
    session_ttl_hours: int = 24

    telegram_bot_token: str = ""
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    port: int | None = None                       # 雲端平台（Render 等）會給 PORT，優先於 API_PORT

    @property
    def listen_port(self) -> int:
        return self.port or self.api_port

    school: str = "default"                       # schools/<name>.yaml；流派設定（4-3）
    persona: str = "master"                       # persona/<name>.yaml；換風格只要換這個名字（7-2）

    @property
    def persona_path(self) -> Path:
        return ROOT / "persona" / f"{self.persona}.yaml"
    cards_dir: Path = ROOT / "fortune" / "knowledge" / "cards"
    data_dir: Path = DEFAULT_DATA_DIR

    @property
    def llm_ready(self) -> bool:
        from fortune.reading.providers import resolve
        return resolve().ready


@lru_cache
def get_settings() -> Settings:
    return Settings()
