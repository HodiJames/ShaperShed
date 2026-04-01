FROM python:3.11-slim

# Force rebuild - timestamp 20260401-1820
WORKDIR /app

# Upgrade pip first
RUN pip install --upgrade pip

# Copy and install requirements
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Force copy of latest backend code
COPY backend/ ./backend/

# Railway injects PORT env var at runtime, default to 8001
ENV PORT=8001
ENV PYTHONUNBUFFERED=1

# Use shell form with unbuffered Python output and Railway-optimized timeouts
CMD /bin/sh -c "python -u -m uvicorn backend.server:app --host 0.0.0.0 --port ${PORT} --timeout-keep-alive 65 --log-level info"
