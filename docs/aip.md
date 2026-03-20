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

## Context

### `context files`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--files` | unknown | Yes | Files to read |

### `context project`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | Yes | Project slug |

### `context task`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | Yes | Project slug |
| `--task` | string | Yes | Task slug |

## Hook

### `hook create`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--type` | enum: pre-create | post-create | pre-complete | post-complete | pre-start | post-start | pre-update | post-update | Yes | Hook type (e.g., pre-create, post-complete) |
| `--lang` | enum: ts | js | sh | py | No | Language (default: ts) |
| `--target` | enum: project | task | No | Target level (default: task if in task dir, else project) |

### `hook run`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--type` | enum: pre-create | post-create | pre-complete | post-complete | pre-start | post-start | pre-update | post-update | Yes | Hook type to run |
| `--target` | enum: project | task | No | Target level (default: auto-detect from $PWD) |

## Project

### `project create`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--name` | string | Yes | Project name |
| `--description` | string | Yes | Project description |
| `--status` | string | No | Initial status (default: active) |
| `--assignee` | string | No | Assignee agent slug |

### `project current`

No options.

### `project ingest`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | No | Project slug (defaults to current project from $PWD) |

### `project list`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--status` | string | No | Filter by status |

### `project update`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | No | Project slug (defaults to current project from $PWD) |
| `--name` | string | No | New name |
| `--description` | string | No | New description |
| `--status` | string | No | New status |
| `--assignee` | string | No | New assignee |
| `--summary` | string | No | Optional summary to append to status.md |

## Task

### `task complete`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | Yes | Project slug |
| `--task` | string | Yes | Task slug |

### `task create`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | Yes | Project slug |
| `--name` | string | Yes | Task name |
| `--description` | string | No | Task description |
| `--priority` | enum: low | medium | high | No | Task priority |
| `--assignee` | string | No | Assignee agent slug |

### `task current`

No options.

### `task ingest`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | Yes | Project slug |
| `--task` | string | Yes | Task slug |

### `task list`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | No | Project slug (defaults to current project from $PWD) |
| `--status` | string | No | Filter by status |
| `--assignee` | string | No | Filter by assignee |

### `task start`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | Yes | Project slug |
| `--task` | string | Yes | Task slug |

### `task update`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | No | Project slug (defaults to current project from $PWD) |
| `--task` | string | No | Task slug (defaults to current task from $PWD) |
| `--name` | string | No | New name |
| `--description` | string | No | New description |
| `--status` | string | No | New status |
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
| `--cwd` | string | No | Working directory (defaults to PROJECTS_HOME) |
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

### `util ls`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--dir` | string | No | Directory to list (defaults to current directory) |

### `util oneline`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--text` | string | No | Text to convert to one line (reads from stdin if not provided) |

### `util read`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--file` | string | Yes | File to read |

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

