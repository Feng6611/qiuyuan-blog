#!/usr/bin/env bash
set -euo pipefail

REMOTE_NAME="${1:-template}"
BRANCH_NAME="${2:-main}"

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Run this script inside a git repository." >&2
  exit 1
fi

if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "Working tree is not clean. Commit or stash changes before syncing." >&2
  exit 1
fi

if ! git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  echo "Remote '$REMOTE_NAME' is missing." >&2
  echo "Add it with:" >&2
  echo "  git remote add $REMOTE_NAME git@github.com:Feng6611/blog-template.git" >&2
  exit 1
fi

git fetch "$REMOTE_NAME" "$BRANCH_NAME"
# Root-prefix sync keeps this repo aligned with template history.
git subtree pull --prefix=. "$REMOTE_NAME" "$BRANCH_NAME"

echo "Synced template from $REMOTE_NAME/$BRANCH_NAME"
