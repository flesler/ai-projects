# AIP Dogfooding Guide

## Vision: 24x7 Autonomous Agent Organization

This system is designed for autonomous agents to work continuously, similar to OpenClaw or Hermes Agent setups. Agents receive tasks via cron jobs, messages (WhatsApp/Telegram), or direct prompts, and work independently to complete them.

## Quick Start for New Agents

When starting a new conversation/session, follow this pattern:

### 1. Read the SOUL (First!)

Always start by reading the core philosophy:

```bash
cat tmp/hermes/SOUL.md
```

This establishes:
- Core principles (be concise, check docs first, follow conventions)
- Optimization rules (batch tool calls, read full files, minimize requests)
- Agent roles and responsibilities

### 2. Check Current State

```bash
# List all projects
aip project list

# List pending tasks across all projects
aip task list --project aip-core --status pending
aip task list --project aip-meta --status pending
aip task list --project aip-skills --status pending

# Or list by assignee (your role)
aip task list --project aip-core --status pending --assignee builder
```

### 3. Pick a Task and Start

```bash
# Start working on a task (cd's into task dir, sets env vars)
eval $(aip task start --project aip-core --task my-task-name)

# Now you're in the task directory with:
# - $CURRENT_PROJECT set
# - $CURRENT_TASK set
# - Task status changed to 'in-progress'
```

### 4. Work Session Pattern

1. **Read context**: `aip context task --project X --task Y`
2. **Do the work**: Implement, research, write, etc.
3. **Update status**: `aip task update --summary "Progress update..."`
4. **Complete**: `aip task complete --project X --task Y`
5. **Post-mortem runs automatically**

### 5. Create Follow-up Tasks

If you discover new work while completing a task:

```bash
aip task create --project aip-core --name "Follow-up work" --priority medium
```

## Agent Roles

### Secretary (Receptionist) - Front Man

**Responsibilities:**
- Triage all incoming requests
- Route to appropriate specialists
- Monitor task completion
- Report status to user

**Workflow:**
```
1. Receive request (message, cron, direct)
2. Create task in inbox if needed
3. Classify: bug/feature/research/docs
4. Assign to specialist:
   - builder → implementation
   - analyst → research/analysis
   - librarian → documentation
   - qa → testing/review
5. Monitor progress
6. Report completion
```

**Commands:**
```bash
# Check inbox for new requests
aip task list --project inbox --status pending

# Triage and reassign
aip task update --project inbox --task request-123 --assignee builder
aip task update --project inbox --task request-123 --status done
```

### Builder Agent

**Specialization:** Code implementation, CLI commands, utilities

**When to engage:**
- New features needed
- Bug fixes
- Refactoring
- Tool creation

**Example session:**
```bash
# Find pending builder tasks
aip task list --project aip-core --assignee builder --status pending

# Start task
eval $(aip task start --project aip-core --task add-new-command)

# Work on implementation...

# Complete
aip task complete --project aip-core --task add-new-command
```

### Analyst Agent

**Specialization:** Pattern recognition, metrics, optimization suggestions

**When to engage:**
- Analyzing tool call patterns
- Identifying inefficiencies
- Suggesting improvements
- Generating reports

### Librarian Agent

**Specialization:** Documentation, skills, organization

**When to engage:**
- New skills needed
- Documentation updates
- File organization
- Knowledge management

### QA Agent

**Specialization:** Testing, validation, quality assurance

**When to engage:**
- Before deployments
- After major changes
- Validating file structures
- Running lint checks

## Project Structure

```
tmp/hermes/
├── SOUL.md                    # Core philosophy (READ FIRST!)
├── agents/                    # Agent definitions
│   ├── boss/
│   ├── builder/
│   ├── analyst/
│   ├── librarian/
│   └── qa/
├── skills/                    # Skill files (living documents)
│   ├── aip-usage.md          # How to use AIP CLI
│   ├── agent-roles.md        # Role specifications
│   └── hooks.md              # Hook development guide
├── aip-core/                  # Core CLI development
│   ├── main.md               # Project goals
│   ├── status.md             # Activity log
│   ├── hooks/                # Project-level hooks
│   ├── inputs/               # External data used
│   ├── outputs/              # Deliverables
│   ├── scripts/              # Automation scripts
│   └── tasks/
│       └── {task-slug}/
│           ├── main.md       # Task definition
│           ├── status.md     # Work session log
│           ├── hooks/        # Task-level hooks
│           ├── inputs/       # Task-specific data
│           ├── outputs/      # Task deliverables
│           └── scripts/      # Task automation
├── aip-meta/                  # Process management
└── aip-skills/                # Skill development
```

### Folder Semantics

#### `main.md` - Primary Context
**What:** Goals, objectives, scope, success criteria  
**When to read:** Always first, before starting work  
**When to update:** Only when scope/goals change (rare)  

**Front-matter:**
```yaml
---
name: Clear Title
description: One-line summary
assignee: builder|analyst|librarian|qa
priority: low|medium|high
status: pending|in-progress|done
created: YYYY-MM-DD
---
```

#### `status.md` - Activity Log
**What:** Chronological, append-only log  
**Format:** `[timestamp] Brief update`  
**Example:**
```markdown
[2026-03-20T22:00:00Z] Status changed to: in-progress
[2026-03-20T22:30:00Z] Completed initial implementation
[2026-03-20T23:00:00Z] Task completed
```

#### `hooks/` - Automation Scripts
**What:** Scripts that run on lifecycle events  
**Naming:** `{pre,post}-{create,complete,start,update}.{ts,js,sh,py}`  
**Execution:** Auto-run by CLI commands  
**Can prevent:** Pre-hooks can exit 1 to block action  

**Examples:**
- `post-complete.ts` - Post-mortem analysis
- `pre-create.sh` - Validation before creation
- `post-start.py` - Notification on task start

**Environment variables:**
- `PROJECT_SLUG` - Current project
- `TASK_SLUG` - Current task
- `HOOK_TYPE` - e.g., 'post-complete'
- `ENTITY_TYPE` - 'project' or 'task'

#### `inputs/` - External Data
**What:** Data consumed by the project/task  
**Examples:**
- API responses
- Downloaded files
- Reference documentation
- User-provided data

**Pattern:** Read-only during work, documents what was used

#### `outputs/` - Deliverables
**What:** Final artifacts produced  
**Examples:**
- Generated code
- Reports
- Processed data
- Screenshots/assets

**Pattern:** The "product" of the work

#### `scripts/` - Automation
**What:** Code that helps complete work  
**Languages:**
- `.sh` - Simple bash scripts
- `.py` - Complex automation
- `.js` / `.ts` - Node-based tools

**Pattern:** Reusable helpers, not the main deliverable

#### `tasks/` - Sub-tasks
**What:** Child tasks within a project  
**Structure:** Same as project (main.md, status.md, hooks/, etc.)  
**Use when:** Task has multiple phases or sub-components

## Essential Commands

### Finding Work
```bash
# List all projects
aip project list

# List tasks by project
aip task list --project aip-core

# Filter by status
aip task list --project aip-core --status pending
aip task list --project aip-core --status in-progress
aip task list --project aip-core --status done

# Filter by assignee
aip task list --project aip-core --assignee builder

# Combined filters
aip task list --project aip-core --status pending --assignee builder
```

### Working on Tasks
```bash
# Start task (cd + env export)
eval $(aip task start --project X --task Y)

# Read all task context
aip context task --project X --task Y

# Update status during work
aip task update --summary "Completed X, now working on Y"

# Complete task (triggers post-mortem hook)
aip task complete --project X --task Y
```

### Creating Work
```bash
# Create new project
aip project create --name "My Project" --description "What it does"

# Create new task
aip task create --project X --name "Task name" --priority high

# Create task with assignee
aip task create --project aip-core --name "Fix bug" --assignee builder
```

### Utilities
```bash
# Get context ingestion
aip context task --project X --task Y

# Format date
aip util iso

# Convert to slug
aip util slugify --text "My Task Name"

# Generate shell completions
eval "$(npm run ts -- bin/completion.ts bash)"
```

## Hooks System

Hooks are scripts that run automatically on actions:

| Hook Type | When | Can Prevent? |
|-----------|------|--------------|
| `pre-create` | Before creating | Yes (exit 1) |
| `post-create` | After creating | No |
| `pre-start` | Before starting task | Yes |
| `post-start` | After starting task | No |
| `pre-complete` | Before completing | Yes |
| `post-complete` | After completing | No |

### Creating Hooks
```bash
# Create hook for current task
aip hook create --type post-complete --lang ts

# Create project-level hook
aip hook create --type pre-create --target project --lang sh
```

### Hook Environment
Hooks receive:
- `PROJECT_SLUG` - Current project
- `TASK_SLUG` - Current task
- `HOOK_TYPE` - The hook type
- `ENTITY_TYPE` - 'project' or 'task'

### Example: Post-Complete Hook
```typescript
#!/usr/bin/env tsx
// tmp/hermes/aip-core/hooks/post-complete.ts

const PROJECT = process.env.PROJECT_SLUG
const TASK = process.env.TASK_SLUG

console.log(`Task ${TASK} completed in ${PROJECT}`)
// Analyze and suggest improvements
```

## Cron Integration

For 24x7 operation, set up cron jobs:

```bash
# Check for pending tasks every hour
0 * * * * cd /path/to/ai-projects && \
  aip task list --status pending --assignee builder | \
  head -1 | awk '{print $1}' | \
  xargs -I {} aip task start --project aip-core --task {}
```

## Message Integration

### WhatsApp/Telegram Pattern
```
User message → Webhook → Create task in inbox → Secretary triages → Delegate
```

### Example Flow
1. User sends: "Add a new command to list all agents"
2. Webhook creates task in `inbox`
3. Secretary reads, assigns to `builder` in `aip-core`
4. Builder completes task
5. Secretary reports back to user

## Self-Improvement Loop

Every completed task should make the next one easier:

1. **Complete task**
2. **Post-mortem runs automatically** (via hook)
3. **Analyze patterns** (what was repetitive?)
4. **Create automation** (hook, utility, skill)
5. **Update documentation** (skills, examples)
6. **Next task is faster**

### Example Improvement Cycle
```
Task 1: "Add CLI command" → 47 tool calls
  ↓ Post-mortem: "Many repetitive steps"
  ↓ New utility: aip scaffold command
Task 2: "Add another command" → 12 tool calls
```

## Best Practices

### For Agents
1. **Read SOUL.md first** - Always
2. **Batch tool calls** - Maximize parallel operations
3. **Read full files** - Never small chunks
4. **Use eval with task start** - Sets up environment
5. **Update status frequently** - Helps tracking
6. **Create tasks for all work** - Enables post-mortems
7. **Complete with post-mortem** - Triggers improvement

### For Users
1. **Clear requests** - Specify what you want
2. **Let agents work** - Don't micromanage
3. **Review completions** - Check post-mortem output
4. **Create projects for goals** - Keep tasks atomic
5. **Trust the process** - Self-improvement takes time

## Current State

```
Projects:
- aip-core (builder): CLI development
- aip-meta (analyst): Process improvement
- aip-skills (librarian): Skill documentation

Skills:
- aip-usage.md - CLI usage guide
- agent-roles.md - Role specifications
- hooks.md - Hook development guide

Commands: 33 total
Hooks: 1 active (post-complete in aip-core)
```

## Starting Fresh Sessions

Template for new agent sessions:

```markdown
# Session Start

## Context
- Read: tmp/hermes/SOUL.md ✅
- Checked: aip project list ✅
- Reviewed: pending tasks ✅

## Assigned Task
- Project: [project]
- Task: [task-slug]
- Priority: [priority]

## Plan
1. [First step]
2. [Second step]
3. [Completion criteria]

## Status
[Working...]
```

---

**Remember:** This is a self-improving system. Every action should serve three levels:
1. **Tactical** - Complete the immediate task
2. **Process** - Make it repeatable for next time
3. **Meta** - Improve the system itself