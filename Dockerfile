FROM python:3.11-slim

WORKDIR /app

# Upgrade pip first
RUN pip install --upgrade pip

# Copy and install requirements with Emergent's private package index
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --extra-index-url https://d33sy5i8bnduwe.cloudfront.net/simple/ -r requirements.txt

COPY backend/ ./backend/

# Railway injects PORT env var at runtime, default to 8001
ENV PORT=8001

# Use shell form with explicit /bin/sh -c to ensure variable expansion
CMD /bin/sh -c "uvicorn backend.server:app --host 0.0.0.0 --port ${PORT}"
