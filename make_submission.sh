#!/usr/bin/env bash
# Copies the private working folder needle/ into a fork's submissions/needle/ for the public PR (macOS/Linux twin
# of make_submission.ps1). Internal planning and review files stay in the private team repo only.
# Usage: ./make_submission.sh <fork-clone>/submissions/needle
set -euo pipefail
TARGET="${1:?usage: make_submission.sh <fork-clone>/submissions/needle}"
SRC="$(cd "$(dirname "$0")" && pwd)/needle"

[ -e "$TARGET" ] && { echo "Target exists: $TARGET (remove it first; this script never overwrites)"; exit 1; }
mkdir -p "$TARGET"
rsync -a \
  --exclude 'CONTRACT.md' --exclude 'docs/PLAN.md' \
  --exclude 'docs/evidence/review_claude.md' --exclude 'docs/evidence/review_codex.md' \
  --exclude '.env' --exclude '.env.*' --exclude '*.secret.env' \
  --exclude '.venv/' --exclude 'data/' --exclude '__pycache__/' --exclude '.pytest_cache/' \
  "$SRC/" "$TARGET/"
cp "$SRC/.env.example" "$TARGET/.env.example"

# Guard 1: no secrets. Every *PASSWORD value (8+ chars) from the private .env must be absent from the copy.
if [ -f "$SRC/.env" ]; then
  while IFS='=' read -r key val; do
    [[ "$key" =~ PASSWORD$ ]] || continue
    [ "${#val}" -ge 8 ] || continue
    if grep -rqF -- "$val" "$TARGET"; then echo "SECRET FOUND in copy - aborting"; exit 1; fi
  done < <(grep -E '^[A-Z0-9_]*PASSWORD=' "$SRC/.env")
fi
# Guard 2: no judge-profiling or internal notes. Organizer repo URLs (KunalGolaIBM/...) are allowed.
NAMES='Dhruv|Pawan|Keshav|Daya Nand|Shaik Sadiq|Gaurav Saxena|Chaturvedi|Maheshwari|Thakur|Kunal Gola|judge panel|what they reward'
if grep -rnE --include='*.md' --include='*.py' --include='*.sql' --include='*.json' --include='*.sh' \
     --include='*.ps1' --include='*.yml' --include='*.toml' --include='*.txt' "$NAMES" "$TARGET"; then
  echo "Internal/judge text found - fix before publishing"; exit 1
fi
# Guard 3: required files for the organizer validator.
for f in README.md architecture.md submission.json .env.example; do
  [ -f "$TARGET/$f" ] || { echo "Missing required file: $f"; exit 1; }
done
echo "OK: copied to $TARGET; secrets guard, internal-text guard and required-files guard passed."
