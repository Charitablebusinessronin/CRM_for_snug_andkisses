FROM python:3.9-slim
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1
WORKDIR /app
# Use clean runtime requirements to avoid Windows wheel conflicts in Linux builds
COPY requirements-docker.txt ./requirements.txt
RUN pip install --upgrade pip && pip install -r requirements.txt
COPY . .
EXPOSE 4728
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4728"]
