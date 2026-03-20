#!/bin/bash
# Append to status.md if it exists (doesn't create)
# Usage: ./status.sh "message" [agent]
# Reads $CURRENT_AGENT if agent not provided

MESSAGE="$1"
AGENT="${2:-$CURRENT_AGENT}"

if [ -z "$MESSAGE" ]; then
  echo "Usage: status.sh \"message\" [agent]" >&2
  exit 1
fi

# Find status.md in current directory or parent
STATUS_FILE=""
if [ -f "./status.md" ]; then
  STATUS_FILE="./status.md"
elif [ -f "../status.md" ]; then
  STATUS_FILE="../status.md"
elif [ -f "../../status.md" ]; then
  STATUS_FILE="../../status.md"
fi

if [ -z "$STATUS_FILE" ]; then
  echo "No status.md found" >&2
  exit 1
fi

TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M:%S")
if [ -n "$AGENT" ]; then
  echo "[$TIMESTAMP | $AGENT] $MESSAGE" >> "$STATUS_FILE"
else
  echo "[$TIMESTAMP] $MESSAGE" >> "$STATUS_FILE"
fi
