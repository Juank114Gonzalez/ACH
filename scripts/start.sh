#!/bin/bash
set -e

echo "Starting ACH Finance..."

if [ ! -f .env ]; then
  echo ".env file not found. Copying from .env.example..."
  cp .env.example .env
  echo "Created .env – please update the secrets before running in production!"
fi

echo "Starting services with Docker Compose..."
docker compose up --build -d

echo "Waiting for backend to be healthy..."
attempt=0
max_attempts=30
until docker compose exec backend wget -qO- http://localhost:4000/api/v1/health > /dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ $attempt -ge $max_attempts ]; then
    echo "Backend failed to start. Check logs: docker compose logs backend"
    exit 1
  fi
  echo "  Attempt $attempt/$max_attempts – waiting..."
  sleep 3
done

echo ""
echo "ACH Finance is running!"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:4000"
echo "   API Docs:  http://localhost:4000/api/v1/health"
