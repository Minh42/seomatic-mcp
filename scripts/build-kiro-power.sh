#!/usr/bin/env bash
# Rebuild kiro-power/skills/ (the Kiro Power package) from skills/.
#
# Usage: scripts/build-kiro-power.sh
#
# A Kiro Power is a folder with plugin.json, mcp.json and skills/ (Agent
# Plugins format, https://kiro.dev/docs/powers/create). Kiro imports only
# that folder, so it carries its own copy of each skill. Frontmatter goes
# through plain-frontmatter.py (name, description, license only), the body is
# copied byte for byte. skills/seomatic-kiro/ lives only in kiro-power/ and is
# left alone. sync-skills.sh runs this at the end.
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HERE/kiro-power/skills"
count=0
for src in "$HERE"/skills/*/; do
  name="$(basename "$src")"
  [ -f "$src/SKILL.md" ] || continue
  rm -rf "$OUT/$name"
  mkdir -p "$OUT/$name"
  python3 "$HERE/scripts/plain-frontmatter.py" < "$src/SKILL.md" > "$OUT/$name/SKILL.md"
  count=$((count + 1))
done
echo "built $count Kiro Power skills in kiro-power/skills"
