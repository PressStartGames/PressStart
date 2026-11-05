#!/usr/bin/env bash
# Usage: write-env-local.sh <client|admin> <staging|production>
# Writes <app>/.env.<mode>.local (git-ignored) from the GitHub Environment's VARIABLES, but only the ones
# that are actually set. An unset variable arrives here as an empty string, and an empty process
# variable would BLANK the value committed in .env.<mode> (Vite lets the process environment win), so
# empty ones are skipped. Only public values belong here; secrets never go into a Vite build.
set -euo pipefail
app="$1"
mode="$2"
file="$app/.env.$mode.local"
: > "$file"
add() {
  local name="$1"
  local value="${!name:-}"
  if [ -n "$value" ]; then
    printf '%s=%s\n' "$name" "$value" >> "$file"
  fi
}
case "$app" in
  client)
    add VITE_SIGNUP_ENDPOINT
    add VITE_SIGNUP_FALLBACK_URL
    add VITE_SITE_URL
    add VITE_TURNSTILE_SITE_KEY
    add VITE_GA_MEASUREMENT_ID
    add VITE_GROWTHBOOK_CLIENT_KEY
    ;;
  admin)
    add VITE_API_BASE
    ;;
  *)
    echo "unknown app: $app" >&2
    exit 2
    ;;
esac
echo "wrote $file with $(wc -l < "$file") override(s)"
