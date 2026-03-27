#!/bin/bash
# Run post-mortem analysis on completed tasks.
# Usage: ./scripts/analyze-task.sh [project-slug] [task-slug]
#
# If no args, analyzes the current task (uses TASK_DIR env).
# If project/task provided, analyzes that specific task.
#
# Examples:
#   ./scripts/analyze-task.sh                           # Current task
#   ./scripts/analyze-task.sh aip-core my-task          # Specific task
#   ./scripts/analyze-task.sh aip-core                  # All completed tasks in project

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Script is in: scripts/ (project root)
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HERMES_ROOT="${AIP_HOME:-$PROJECT_ROOT/tmp/hermes}"
HOOK_PATH="$HERMES_ROOT/projects/aip-core/hooks/post-complete.ts"

# Use npx to run tsx (no global install needed)
TSX_CMD="npx --yes tsx"

analyze_task() {
  local project="$1"
  local task="$2"
  
  local task_dir="$PROJECT_DIR/tasks/$task"
  
  if [[ ! -d "$task_dir" ]]; then
    echo "⚠️  Task not found: $project/$task"
    return 1
  fi
  
  echo "🔍 Analyzing: $project/$task"
  
  TASK_DIR="$task_dir" \
  PROJECT_DIR="$PROJECT_DIR" \
  PROJECT_SLUG="$project" \
  TASK_SLUG="$task" \
  HERMES_ROOT="$HERMES_ROOT" \
  $TSX_CMD "$HOOK_PATH"
}

# Case 1: No arguments - analyze current task
if [[ -z "$1" ]]; then
  if [[ -n "$TASK_DIR" ]] && [[ -n "$PROJECT_SLUG" ]] && [[ -n "$TASK_SLUG" ]]; then
    echo "🔍 Analyzing current task: $PROJECT_SLUG/$TASK_SLUG"
    $TSX_CMD "$HOOK_PATH"
  else
    echo "❌ No task context available."
    echo "Usage: ./scripts/analyze-task.sh [project-slug] [task-slug]"
    exit 1
  fi
  exit 0
fi

# Case 2: Project and task provided - analyze specific task
if [[ -n "$1" ]] && [[ -n "$2" ]]; then
  analyze_task "$1" "$2"
  exit 0
fi

# Case 3: Only project provided - analyze all completed tasks in project
if [[ -n "$1" ]]; then
  project="$1"
  project_dir="$PROJECT_DIR/tasks"
  
  if [[ ! -d "$project_dir" ]]; then
    echo "❌ Project not found: $project"
    exit 1
  fi
  
  echo "📊 Analyzing all completed tasks in $project..."
  echo ""
  
  count=0
  for task_dir in "$project_dir"/*/; do
    if [[ -d "$task_dir" ]]; then
      task=$(basename "$task_dir")
      status_file="$task_dir/status.md"
      
      # Only analyze tasks with status.md that contains "completed" or "done"
      if [[ -f "$status_file" ]]; then
        if grep -qi "completed\|done\|status: done" "$status_file" 2>/dev/null; then
          analyze_task "$project" "$task"
          echo ""
          ((count++))
        fi
      fi
    fi
  done
  
  if [[ $count -eq 0 ]]; then
    echo "No completed tasks found in $project"
  else
    echo "✅ Analyzed $count completed task(s)"
  fi
  exit 0
fi
