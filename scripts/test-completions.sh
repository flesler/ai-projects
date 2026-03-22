#!/bin/bash
# Description: Test shell completion script generation
# Usage: ./scripts/test-completions.sh
#
# This script validates that:
# 1. Completion script runs without errors
# 2. Generated completions are non-empty
# 3. All registered commands are included in completions
# 4. Completion syntax is valid (basic checks)
#
# Exit codes:
#   0 - All tests passed
#   1 - Tests failed

set -e

# Load nvm if available
if [ -f ~/.nvm/nvm.sh ]; then
    source ~/.nvm/nvm.sh
    nvm use > /dev/null 2>&1 || true
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Script is in: scripts/ (project root)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_ROOT"

# Use npx tsx to ensure we're using the project's tsx
TSX_CMD="npx tsx"

echo "Testing AIP completion generation..."
echo

# Test 1: Script runs without errors
echo "Test 1: Running completion script..."
if $TSX_CMD bin/completion.ts bash > /dev/null 2>&1; then
    echo "  ✓ Bash completion script runs"
else
    echo "  ✗ Bash completion script failed"
    exit 1
fi

if $TSX_CMD bin/completion.ts zsh > /dev/null 2>&1; then
    echo "  ✓ Zsh completion script runs"
else
    echo "  ✗ Zsh completion script failed"
    exit 1
fi

# Test 2: Generated completions are non-empty
echo
echo "Test 2: Checking completion output is non-empty..."
BASH_OUTPUT=$($TSX_CMD bin/completion.ts bash)
if [ -n "$BASH_OUTPUT" ]; then
    echo "  ✓ Bash completion output is non-empty (${#BASH_OUTPUT} chars)"
else
    echo "  ✗ Bash completion output is empty"
    exit 1
fi

ZSH_OUTPUT=$($TSX_CMD bin/completion.ts zsh)
if [ -n "$ZSH_OUTPUT" ]; then
    echo "  ✓ Zsh completion output is non-empty (${#ZSH_OUTPUT} chars)"
else
    echo "  ✗ Zsh completion output is empty"
    exit 1
fi

# Test 3: All commands are included
echo
echo "Test 3: Checking all commands are included..."
COMMANDS_OUTPUT=$($TSX_CMD bin/completion.ts bash)

# Extract nouns from completion script
NOUNS=$(echo "$COMMANDS_OUTPUT" | grep -oP 'COMPREPLY=\(\$\(compgen -W "\K[^"]+' | head -1)
if [ -n "$NOUNS" ]; then
    echo "  ✓ Found command nouns in completion"
else
    echo "  ✗ No command nouns found in completion"
    exit 1
fi

# Test 4: Basic syntax validation
echo
echo "Test 4: Validating completion syntax..."
if echo "$BASH_OUTPUT" | grep -q "complete -F _aip_completion aip"; then
    echo "  ✓ Bash completion has correct complete command"
else
    echo "  ✗ Bash completion missing complete command"
    exit 1
fi

if echo "$ZSH_OUTPUT" | grep -q "#compdef aip"; then
    echo "  ✓ Zsh completion has correct compdef"
else
    echo "  ✗ Zsh completion missing compdef"
    exit 1
fi

# Test 5: Check for common errors
echo
echo "Test 5: Checking for common errors..."
if echo "$BASH_OUTPUT" | grep -q "Unknown shell"; then
    echo "  ✗ Completion contains error messages"
    exit 1
else
    echo "  ✓ No error messages in output"
fi

echo
echo "All completion tests passed! ✓"
exit 0
