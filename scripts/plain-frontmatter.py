#!/usr/bin/env python3
"""Make a SKILL.md frontmatter plain for the Claude plugin directory check.

Reads SKILL.md on stdin, writes it on stdout. Only the frontmatter changes:
- a one-line JSON `metadata: {...}` (OpenClaw's format) is dropped, since
  Claude does not read it and the check refuses `{ }` mappings;
- the `required_environment_variables:` block (Hermes and OpenClaw) is
  dropped for the same reason;
- an unquoted `description:` gets double quotes, so a colon, # or bracket in
  it cannot be read as YAML syntax.
The body after the closing `---` is copied unchanged.
"""
import sys

lines = sys.stdin.read().split("\n")
if not lines or lines[0].strip() != "---":
    sys.stdout.write("\n".join(lines))
    sys.exit(0)
end = next(i for i in range(1, len(lines)) if lines[i].strip() == "---")
out, skip = [lines[0]], False
for line in lines[1:end]:
    top = line[:1] not in (" ", "\t", "")
    if top:
        skip = False
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
