# AIP CLI Reference

AI Project Management CLI - Command reference documentation.

## Usage

```
aip <noun> <verb> [options]
```

## Commands

## Agent

### `agent create`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--name` | string | Yes | Agent name |
| `--description` | string | Yes | Agent description |
| `--status` | string | No | Initial status (default: active) |

### `agent current`

No options.

### `agent list`

No options.

### `agent start`

Start an agent: read AGENTS.md and export CURRENT_AGENT env var

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` (positional) | string | Yes | Agent name (directory name) |

## Hook

### `hook create`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `type` (positional) | enum: pre-create | post-create | pre-complete | post-complete | pre-start | post-start | pre-update | post-update | Yes | Hook type (e.g., pre-create, post-complete) |
| `--lang` | enum: ts | js | sh | py | No | Language (default: ts) |
| `--target` | enum: project | task | No | Target level (default: task if in task dir, else project) |

### `hook run`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `type` (positional) | enum: pre-create | post-create | pre-complete | post-complete | pre-start | post-start | pre-update | post-update | Yes | Hook type to run |
| `--target` | enum: project | task | No | Target level (default: auto-detect from $PWD) |

## Project

### `project create`

Create a new project with name, description, optional status and assignee

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--name` | string | Yes | Project name |
| `--description` | string | Yes | Project description |
| `--status` | string | No | Initial status (default: active) |
| `--assignee` | string | No | Assignee agent slug |

### `project current`

No options.

### `project list`

List all projects, optionally filtered by status

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--status` | string | No | Filter by status |

### `project update`

Update project properties: name, description, status, assignee, or append summary

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | No | Project slug (defaults to current project from $PWD) |
| `--name` | string | No | New name |
| `--description` | string | No | New description |
| `--status` | string | No | New status |
| `--assignee` | string | No | New assignee |
| `--summary` | string | No | Optional summary to append to status.md |

## Skill

### `skill read`

Read a skill's SKILL.md file into the console for agent context

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `name` (positional) | string | Yes | Skill name (directory name) |

## Task

### `task create`

Create a new task with optional priority, assignee, and initial status

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `project` (positional) | string | Yes | Project slug |
| `name` (positional) | string | Yes | Task name |
| `--description` | string | No | Task description |
| `--priority` | enum: low | medium | high | No | Task priority |
| `--assignee` | string | No | Assignee agent slug |
| `--status` | enum: pending | in-progress | ongoing | done | No | Initial status |

### `task current`

Get the current task slug from PWD

No options.

### `task ingest`

Output full task context (main.md, status.md) for ingestion by agents

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | No | Project slug (default: from $PWD) |
| `--task` | string | No | Task slug (default: from $PWD) |

### `task list`

List tasks in a project, optionally filtered by status or assignee

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | No | Project slug (defaults to current project from $PWD) |
| `--status` | string | No | Filter by status |
| `--assignee` | string | No | Filter by assignee |

### `task start`

Start a task: set status to in-progress, output cd and env vars, optionally print context

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `project` (positional) | string | Yes | Project slug |
| `task` (positional) | string | Yes | Task slug |
| `--ingest` | boolean | No | Also output context ingestion for this task |

### `task update`

Update task properties: name, description, status, priority, assignee, or append summary

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | No | Project slug (defaults to current project from $PWD) |
| `--task` | string | No | Task slug (defaults to current task from $PWD) |
| `--name` | string | No | New name |
| `--description` | string | No | New description |
| `--status` | enum: pending | in-progress | ongoing | done | blocked | No | New status |
| `--priority` | enum: low | medium | high | No | New priority |
| `--assignee` | string | No | New assignee |
| `--summary` | string | No | Optional summary to append to status.md |

## Util

### `util compact`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--text` | string | No | Text to compact (reads from stdin if not provided) |

### `util glob`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--pattern` | string | Yes | Glob pattern to search for |
| `--cwd` | string | No | Working directory (defaults to TEAM_HOME/projects) |
| `--absolute` | boolean | No | Return absolute paths |

### `util inspect`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--json` | string | Yes | JSON string to inspect/format |
| `--compact` | boolean | No | Output as single line (default: false) |

### `util iso`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--date` | string | No | Date to format (defaults to now, accepts any moment-parseable date) |

### `util join`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--paths` | unknown | Yes | Path segments to join |

### `util log`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--text` | string | Yes | Log message |
| `--agent` | string | No | Agent name (defaults to $CURRENT_AGENT) |

### `util ls`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--dir` | string | No | Directory to list (defaults to current directory) |

### `util oneline`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--text` | string | No | Text to convert to one line (reads from stdin if not provided) |

### `util postmortem`

Post-mortem analysis for a completed task

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `project` (positional) | string | Yes | Project slug |
| `task` (positional) | string | Yes | Task slug |

### `util read`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--files` | unknown | Yes | Files to read (aggregated) |

### `util relative`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--from` | string | Yes | Base path |
| `--to` | string | Yes | Target path |

### `util slugify`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--text` | string | Yes | Text to convert to slug |

### `util write`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--file` | string | Yes | File to write to |
| `--content` | string | No | Content to write (reads from stdin if not provided) |

