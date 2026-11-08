#!/usr/bin/env bash
# Rebuild hermes/skills/ (the Hermes Agent catalog package) from skills/.
#
# Usage: scripts/build-hermes-skills.sh
#
# The Hermes package ships the twenty MCP skills (skills/seomatic-*). It leaves
# out the CLI skill (skills/seomatic), which needs SEOMATIC_API_KEY and runs
# shell commands. Agent Plugins v1 requires a skill's `metadata` to map string
# keys to string values, and ours nests per-host blocks (paperclip, openclaw,
# hermes), so the copy drops the top-level `metadata:` block of the
# frontmatter. Everything else is copied byte for byte. sync-skills.sh runs
# this at the end; run it by hand after editing any skills/seomatic-*/SKILL.md.
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HERE/hermes/skills"
rm -rf "$OUT"
mkdir -p "$OUT"
count=0
for src in "$HERE"/skills/seomatic-*/; do
  name="$(basename "$src")"
  [ -f "$src/SKILL.md" ] || continue
  mkdir -p "$OUT/$name"
  awk '
    NR == 1 && /^---[[:space:]]*$/ { fm = 1; print; next }
    fm && /^---[[:space:]]*$/ { fm = 0; skip = 0; print; next }
    fm && /^metadata:/ { skip = 1; next }
    fm && skip && /^[^[:space:]]/ { skip = 0 }
    fm && skip { next }
    { print }
  ' "$src/SKILL.md" > "$OUT/$name/SKILL.md"
  count=$((count + 1))
done
echo "built $count Hermes skills in hermes/skills"
