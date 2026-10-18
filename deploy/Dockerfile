# 課程版 AI 命理師 — 一個容器跑前後端
FROM python:3.12-slim
WORKDIR /app
COPY pyproject.toml README.md ./
COPY fortune ./fortune
COPY web ./web
COPY persona ./persona
RUN pip install --no-cache-dir -e ".[llm]"
ENV API_HOST=0.0.0.0 API_PORT=8000
EXPOSE 8000
CMD ["python", "-m", "fortune"]
