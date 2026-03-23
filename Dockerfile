# SPDX-License-Identifier: AGPL-3.0-only

FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node?tab=readme-ov-file#nodealpine to understand why gcompat might be needed.
RUN apk add --no-cache gcompat
WORKDIR /frontend

# Install dependencies
COPY ./viewer/package.json ./viewer/package-lock.json* ./
RUN npm i

# Rebuild the frontend only when needed
FROM base AS frontend
WORKDIR /frontend
COPY --from=deps /frontend/node_modules ./node_modules
COPY ./viewer .
COPY ./viewer/next.config.js ./next.config.js

# Disable telemetry during the build
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

FROM python:3.13-slim

RUN mkdir /app
COPY ./server/requirements.txt /app

WORKDIR /app

RUN pip install -r requirements.txt && pip install gunicorn

COPY ./server /app

# Copy only the static file export of the frontend
COPY --from=frontend /frontend/out ./frontend

ENV DIAG_SERVER_LOG_LEVEL "INFO"

ENV GUNICORN_PROCESSES 1
ENV GUNICORN_THREADS 1
ENV GUNICORN_TIMEOUT 120
ENV GUNICORN_BIND "0.0.0.0:8080"
ENV DIAG_SERVER_SOCKET_ADDRESS "0.0.0.0"
ENV DIAG_SERVER_HOST "localhost"
ENV DIAG_SERVER_PORT 8080
ENV DIAG_UI_STATIC_EXPORT_PATH "/app/frontend"
ENV DIAG_SERVER_SERVE_UI_ENABLED true

EXPOSE 8080

# Use gunicorn to start Flask server in production mode
# The configuration parameters are defined in gunicorn_config.py
CMD ["gunicorn", "--config", "gunicorn_config.py", "diag_server.gunicorn_app:server_app"]
