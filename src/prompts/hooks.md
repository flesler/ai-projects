# AIP Hooks

Automated scripts that run before/after project/task actions.

## Hook Types

**Pre-hooks** (block action if they fail):
- `pre-create` - Before project/task creation
- `pre-start` - Before task start
- `pre-update` - Before task/project update
- `pre-complete` - Before task completion (quality gates)

**Post-hooks** (failures logged but don't block):
- `post-create` - After creation
- `post-start` - After task start
- `post-update` - After update
- `post-complete` - After completion (cleanup, notifications)

## File Location

```
tmp/hermes/projects/{project}/hooks/
├── pre-complete.ts    # Project-level hook
└── post-create.sh

tmp/hermes/projects/{project}/tasks/{task}/hooks/
└── pre-update.py      # Task-level hook
```

**Execution order:** Project hooks first, then task hooks.

## Environment Variables

Hooks receive these automatically:

| Variable | Always | Description |
|----------|--------|-------------|
| `HOOK_TYPE` | ✅ | e.g. `pre-complete` |
| `ENTITY_TYPE` | ✅ | `project` or `task` |
| `TARGET_DIR` | ✅ | Directory being acted on |
| `PROJECT_DIR` | ✅ | Project root path |
| `PROJECT_SLUG` | ✅ | Project name |
| `TASK_DIR` | Task only | Task directory path |
| `TASK_SLUG` | Task only | Task name |

## Creating Hooks

```bash
# TypeScript/JavaScript
aip hook create pre-complete --lang ts

# Shell
aip hook create post-create --lang sh

# Python
aip hook create pre-update --lang py
```

## Examples

### Pre-complete validation (TypeScript)

```typescript
#!/usr/bin/env tsx
import { readFileSync } from 'fs'
import { join } from 'path'

const taskDir = process.env.TASK_DIR!
const mainPath = join(taskDir, 'main.md')
const content = readFileSync(mainPath, 'utf-8')

// Require description
if (!content.includes('description:')) {
  console.error('❌ Task must have description')
  process.exit(1)
}

// Require status update
const statusPath = join(taskDir, 'status.md')
if (!existsSync(statusPath) || readFileSync(statusPath, 'utf-8').length === 0) {
  console.error('❌ status.md is empty')
  process.exit(1)
}
```

### Post-complete archive (Shell)

```bash
#!/bin/bash
# Archive outputs after task completion

archive_dir="$PROJECT_DIR/archive/$TASK_SLUG"
mkdir -p "$archive_dir"
cp -r "$TASK_DIR/outputs/"* "$archive_dir/" 2>/dev/null || true
echo "✅ Archived to $archive_dir"
```

### Pre-update lock check (Python)

```python
#!/usr/bin/env python3
import os
from pathlib import Path

task_dir = Path(os.environ['TASK_DIR'])
lock_file = task_dir / '.locked'

if lock_file.exists():
    print("❌ Task is locked")
    print("   Remove .locked file to allow updates")
    sys.exit(1)
```

## Rules

**DO:**
- Exit `0` for success, `1` for failure
- Use environment variables (don't hardcode paths)
- Log clear error messages
- Keep hooks fast (<5s ideal)
- Make pre-hooks idempotent (safe to run multiple times)

**DON'T:**
- Modify files in pre-hooks (only validate)
- Block in post-hooks (they're for cleanup/logging)
- Assume TASK_* vars exist (check for project-level hooks)
- Run long operations (use delegation instead)

## Debugging

```bash
# Test hook manually
cd tmp/hermes/projects/my-project
./hooks/pre-complete.ts

# Check environment
echo $HOOK_TYPE $PROJECT_SLUG $TASK_SLUG

# Run with verbose logging
DEBUG=1 aip task update --status done
```

## Common Patterns

### Validation gates
- Require tests before completion
- Check outputs exist
- Validate frontmatter fields
- Ensure status.md updated

### Automation
- Backup before changes
- Archive outputs on completion
- Sync to external systems
- Send notifications (Slack, email)

### Quality control
- Lint check before commit
- Run tests automatically
- Check for TODOs/comments
- Validate output format

---

*Hooks automate workflow enforcement. Pre-hooks guard quality, post-hooks handle cleanup.*
