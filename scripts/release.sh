#!/usr/bin/env bash
# Signed release of this repo (SEOmatic plan item 44j): the Gemini CLI
# extension, Kiro Power, Raycast extension source and every other package here.
#
# Usage: scripts/release.sh v1.3.0 [--dry-run]
#
#  1. stops on uncommitted changes, an existing tag, or a tag that is not the
#     version in gemini-extension.json, kiro-power/plugin.json and plugin.json;
#  2. makes a signed git tag (git tag -s: your git signing key; GitHub shows
#     it as Verified), so installs pinned to the tag can be checked with
#     `git verify-tag`;
#  3. builds seomatic-mcp-<version>.tar.gz from the tag (git archive) and
#     SHA256SUMS for it;
#  4. signs SHA256SUMS with Sigstore keyless signing (cosign opens a browser
#     sign-in; the signature is logged in the public Rekor log, and there is
#     no long-lived key to leak) and verifies it against the expected signer;
#  5. pushes the tag and creates the GitHub release with the three files.
#
# --dry-run does 1 and 3 from HEAD (problems are printed, not fatal) and
# prints the rest. The seomatic CLI is released from the app repo
# (cli/scripts/release.sh) and attaches its files here as cli-v<version>.
set -euo pipefail

HERE="$(cd "$(dirname "$0")/.." && pwd)"
# The signer users verify against (README "Verify a release").
SIGNER="${SEOMATIC_SIGNER:-contact@seomatic.ai}"
ISSUER="${SEOMATIC_SIGNER_ISSUER:-https://accounts.google.com}"

TAG="${1:-}"
[[ "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "usage: scripts/release.sh vX.Y.Z [--dry-run]" >&2; exit 2; }
VERSION="${TAG#v}"
dry=0
[ "${2:-}" = "--dry-run" ] && dry=1
die() {
  if [ "$dry" = 1 ]; then echo "would stop: $*" >&2; else echo "release: $*" >&2; exit 1; fi
}
run() {
  if [ "$dry" = 1 ]; then echo "would run: $*"; else "$@"; fi
}

cd "$HERE"
[ -z "$(git status --porcelain)" ] || die "uncommitted changes"
git rev-parse -q --verify "refs/tags/$TAG" >/dev/null && die "tag $TAG already exists"
if git ls-remote --exit-code --tags origin "refs/tags/$TAG" >/dev/null 2>&1; then
  die "tag $TAG is already on origin"
fi
for f in gemini-extension.json kiro-power/plugin.json plugin.json; do
  v="$(python3 -c 'import json,sys; print(json.load(open(sys.argv[1]))["version"])' "$f")"
  [ "$v" = "$VERSION" ] || die "$f is version $v, not $VERSION"
done
if [ "$dry" = 0 ]; then
  command -v cosign >/dev/null || die "cosign is not installed (brew install cosign)"
  command -v gh >/dev/null || die "gh is not installed (brew install gh)"
fi

OUT="$(mktemp -d)"
NAME="seomatic-mcp-$VERSION"
REF="$TAG"
run git tag -s "$TAG" -m "SEOmatic MCP kit $VERSION"
if [ "$dry" = 1 ]; then REF=HEAD; else trap 'git tag -d "$TAG" >/dev/null' EXIT; fi # a failed run leaves no local tag
git archive --format=tar.gz --prefix="$NAME/" -o "$OUT/$NAME.tar.gz" "$REF"
(cd "$OUT" && shasum -a 256 "$NAME.tar.gz" > SHA256SUMS && cat SHA256SUMS)

run cosign sign-blob --yes --bundle "$OUT/SHA256SUMS.sigstore.json" "$OUT/SHA256SUMS"
run cosign verify-blob --bundle "$OUT/SHA256SUMS.sigstore.json" \
  --certificate-identity "$SIGNER" --certificate-oidc-issuer "$ISSUER" "$OUT/SHA256SUMS"

run git push origin "$TAG"
trap - EXIT
run gh release create "$TAG" --verify-tag --title "SEOmatic MCP kit $VERSION" \
  --notes "Signed release. Verify: see \"Verify a release\" in the README." \
  "$OUT/$NAME.tar.gz" "$OUT/SHA256SUMS" "$OUT/SHA256SUMS.sigstore.json" ||
  die "tag $TAG is pushed but the GitHub release failed; create it by hand: gh release create $TAG --verify-tag $OUT/$NAME.tar.gz $OUT/SHA256SUMS $OUT/SHA256SUMS.sigstore.json"
echo "done: $TAG signed by $SIGNER ($OUT)"
