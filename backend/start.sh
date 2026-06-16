#!/usr/bin/env bash

set -e

alembic upgrade head
python -m app.seed.run
uvicorn app.main:app --host 0.0.0.0 --port "$PORT"
