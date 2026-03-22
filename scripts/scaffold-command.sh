#!/bin/bash
# Scaffold new aip command. Usage: ./scaffold-command.sh <noun> <verb> [description]
# Example: scaffold-command.sh util greet "Greet a user"
# Run from repo root or anywhere within ai-projects.

# Find the ai-projects root by looking for package.json
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT=""

# Try to find root by going up directories
current="$SCRIPT_DIR"
for i in {1..10}; do
  if [[ -f "$current/package.json" ]]; then
    ROOT="$current"
    break
  fi
  parent="$(dirname "$current")"
  if [[ "$parent" == "$current" ]]; then
    break
  fi
  current="$parent"
done

[[ -n "$ROOT" && -f "$ROOT/package.json" ]] || { echo "Not in ai-projects"; exit 1; }

NOUN="${1:?Usage: scaffold-command.sh <noun> <verb> [description]}"
VERB="${2:?Usage: scaffold-command.sh <noun> <verb> [description]}"
DESCRIPTION="${3:-}"

# Validate noun and verb are slugified (lowercase, hyphens only)
validate_slug() {
  local name="$1"
  local type="$2"
  if [[ ! "$name" =~ ^[a-z][a-z0-9-]*$ ]]; then
    echo "Error: $type must be lowercase alphanumeric with hyphens (start with letter): $name"
    exit 1
  fi
}

validate_slug "$NOUN" "Noun"
validate_slug "$VERB" "Verb"

DIR="$ROOT/src/commands/$NOUN"
FILE="$DIR/$VERB.ts"
mkdir -p "$DIR"

if [[ -f "$FILE" ]]; then
  echo "Exists: $FILE"
  exit 1
fi

# Build template based on whether description is provided
if [[ -n "$DESCRIPTION" ]]; then
  cat > "$FILE" << EOF
import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'

export default defineCommand({
  description: '$DESCRIPTION',
  options: z.object({
    // Add options
  }),
  handler: async () => {
    console.log('$NOUN $VERB')
  },
})
EOF
else
  cat > "$FILE" << EOF
import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'

export default defineCommand({
  options: z.object({
    // Add options
  }),
  handler: async () => {
    console.log('$NOUN $VERB')
  },
})
EOF
fi

cd "$ROOT" && npm run build:map --silent 2>/dev/null || true
echo "Created: $FILE"
echo ""
echo "Next steps:"
echo "  1. Add options/args to the schema"
echo "  2. Implement the handler"
echo "  3. Add necessary imports"
echo "  4. Test: npm run aip $NOUN $VERB --help"
