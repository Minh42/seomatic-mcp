#!/usr/bin/env bash
# Rebuild claude/skills/ and the icon (the Claude plugin package) from skills/.
#
# Usage: scripts/build-claude-plugin.sh
#
# The Claude plugin lives in claude/ so the plugin directory scans only what
# Claude loads: its manifest, .mcp.json, the skills and a short README. With
# the repo root as the plugin, the scan also read the Make app, the Grok and
# nanoclaw files and the dsh plugin, and held the submission. Skills are
# copied byte for byte. sync-skills.sh runs this at the end; run it by hand
# after editing any skills/*/SKILL.md.
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$HERE/claude/skills"
rm -rf "$OUT"
mkdir -p "$OUT"
count=0
for src in "$HERE"/skills/*/; do
  name="$(basename "$src")"
  [ -f "$src/SKILL.md" ] || continue
  mkdir -p "$OUT/$name"
  cp "$src/SKILL.md" "$OUT/$name/SKILL.md"
  count=$((count + 1))
done
cp "$HERE/.claude-plugin/icon.png" "$HERE/claude/.claude-plugin/icon.png"
echo "built $count Claude plugin skills in claude/skills"
