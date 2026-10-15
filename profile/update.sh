#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Working tree must be clean before updating." >&2
  exit 1
fi
git pull --ff-only
GH_TOKEN="$(gh auth token)" python3 profile/generate.py
git add -- profile/light.svg profile/dark.svg profile/snake.svg profile/stats.json
if ! git diff --cached --quiet -- profile; then
  git commit -m "chore: refresh GitHub profile stats"
  git push
fi
