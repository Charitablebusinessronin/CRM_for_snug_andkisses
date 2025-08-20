# Dev container for Zoho Catalyst Python SDK tasks
FROM python:3.9-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# System deps commonly needed by SDKs/HTTP clients
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates git build-essential \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /workspace

# Python deps pinned to Catalyst-compatible stack
RUN python -m pip install --upgrade pip setuptools wheel \
  && pip install \
       zcatalyst-sdk \
       flask \
       requests==2.31.0 \
       requests-oauthlib \
       PyJWT

# Default to interactive shell; mount your project into /workspace
CMD ["bash"]
