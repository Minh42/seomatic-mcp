#!/usr/bin/env bash
# Copy the MCP skills from a local checkout of the SEOmatic app into this repo.
#
# Usage: scripts/sync-skills.sh /path/to/seomatic-app
#
# The app repo is the source of truth for skills/seomatic-*/SKILL.md. This
# script copies each one over the matching folder here and leaves
# skills/seomatic/ (the CLI skill that lives only in this repo) alone. It then
# refreshes the root SKILL.md from skills/seomatic/SKILL.md so `npx skills add`
# and the Claude Code plugin see the same text.
set -euo pipefail

APP="${1:-}"
if [ -z "$APP" ] || [ ! -d "$APP/skills" ]; then
  echo "usage: $0 /path/to/seomatic-app   (must contain skills/)" >&2
  exit 1
fi

HERE="$(cd "$(dirname "$0")/.." && pwd)"
count=0
for src in "$APP"/skills/seomatic-*/; do
  name="$(basename "$src")"
  [ -f "$src/SKILL.md" ] || continue
  mkdir -p "$HERE/skills/$name"
  dst="$HERE/skills/$name/SKILL.md"
  cp "$src/SKILL.md" "$dst"
  # Paperclip shows declared runtime requirements on import. The app copy
  # does not carry them yet, so add the block under `metadata:` when absent.
  if ! grep -q '^  paperclip:' "$dst"; then
    awk 'BEGIN{done=0} {print} /^metadata:[[:space:]]*$/ && !done {print "  paperclip:\n    requirements:\n      env: []\n      binaries: []\n      mcp: [seomatic]"; done=1}' "$dst" > "$dst.tmp" && mv "$dst.tmp" "$dst"
  fi
  count=$((count + 1))
  echo "synced skills/$name"
done

cp "$HERE/skills/seomatic/SKILL.md" "$HERE/SKILL.md"
echo "synced $count MCP skills; root SKILL.md refreshed from skills/seomatic"
echo "review with: git -C \"$HERE\" diff --stat"
