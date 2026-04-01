FROM python:3.11-slim

WORKDIR /app

RUN pip install --upgrade pip

COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/

ENV PORT=8001

CMD /bin/sh -c "uvicorn backend.test_server:app --host 0.0.0.0 --port ${PORT}"
