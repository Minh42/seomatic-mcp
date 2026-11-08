#!/usr/bin/env python3
"""Make a SKILL.md frontmatter plain for the Claude plugin directory check.

Reads SKILL.md on stdin, writes it on stdout. Only the frontmatter changes:
- a one-line JSON `metadata: {...}` (OpenClaw's format) is dropped, since
  Claude does not read it and the check refuses `{ }` mappings;
- the `required_environment_variables:` block (Hermes and OpenClaw) is
  dropped for the same reason;
- every top-level key outside ALLOWED is dropped with its block: the
  directory refuses other keys (version, homepage, mcp, tools, nested
  metadata for Paperclip/OpenClaw/Hermes) unless the organization is
  Verified (refused 2026-11-08, v1.2.0 e3ee2ae). Those registries read
  skills/, which keeps them;
- an unquoted `description:` gets double quotes, so a colon, # or bracket in
  it cannot be read as YAML syntax.
The body after the closing `---` is copied unchanged.
"""
import sys

ALLOWED = ("name", "description", "license", "allowed-tools")

lines = sys.stdin.read().split("\n")
if not lines or lines[0].strip() != "---":
    sys.stdout.write("\n".join(lines))
    sys.exit(0)
end = next(i for i in range(1, len(lines)) if lines[i].strip() == "---")
out, skip = [lines[0]], False
for line in lines[1:end]:
    top = line[:1] not in (" ", "\t", "")
    if top:
        skip = line.split(":", 1)[0].strip() not in ALLOWED
    if top and line.startswith("metadata:") and line.split(":", 1)[1].strip().startswith("{"):
        continue
    if top and line.startswith("required_environment_variables:"):
        skip = True
        continue
    if skip:
        continue
    if top and line.startswith("description:"):
        val = line.split(":", 1)[1].strip()
        if val and val[0] not in "'\"|>":
            line = 'description: "' + val.replace("\\", "\\\\").replace('"', '\\"') + '"'
    out.append(line)
sys.stdout.write("\n".join(out + lines[end:]))
