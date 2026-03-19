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

## Project

### `project create`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--name` | string | Yes | Project name |
| `--description` | string | Yes | Project description |

## Task

### `task`

Shows available commands for this noun.

### `task complete`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | Yes | Project slug |
| `--task` | string | Yes | Task name |

### `task create`

| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--project` | string | Yes | Project slug |
| `--name` | string | Yes | Task name |

