# AIP CLI Commands

Command reference for AI agents.

## Pattern

```bash
aip <noun> <verb> [args] [--options]
```

## Projects

```bash
aip project create {name} --description "{desc}" [--status active] [--assignee agent]
aip project list [--status active|pending|done]
aip project update {project} --name "{new}" --description "{new}" --status "{new}"
aip project path {name}                    # For cd: cd $(aip project path x)
```

## Tasks

```bash
aip task create {project} {name} --description "{desc}" [--priority low|medium|high] [--status pending|in-progress|done]
aip task list {project} [--status pending|in-progress|done] [--assignee agent]
aip task update {project} {task} --name "{new}" --description "{new}" --status "{new}" --priority "{new}" --summary "{append to status.md}"
aip task ingest {project} {task}           # Full context (main.md + status.md)
aip task path {project} {task}             # For cd: cd $(aip task path p t)
aip task start {project} {task} [--ingest] # Set in-progress, output context
```

## Agents

```bash
aip agent create {name} --description "{desc}" [--status active]
aip agent list [--status active|inactive]
aip agent path {name}                      # For cd: cd $(aip agent path x)
aip agent start {name}                     # Output agent context (SOUL.md + main.md)
```

## Skills

```bash
aip skill read {name}                      # Output SKILL.md for agent context
```

## Hooks

```bash
aip hook create {type} --lang ts|js|sh|py [--target project|task]
# Types: pre-create, pre-start, pre-update, pre-complete, post-create, post-start, post-update, post-complete
```

## Prompts

```bash
aip prompts read {names}                   # Read prompt files for context (comma-separated)
```

## Common Patterns

### Create project with first task
```bash
aip project create "API Integration" --description "Build REST API"
aip task create api-integration "Setup Express" --description "Initialize Express server" --priority high
```

### Start working on task
```bash
cd $(aip task path my-project my-task)
aip task start my-project my-task --ingest
```

### Complete task
```bash
aip task update my-project my-task --status done --summary "Implemented 5 endpoints with validation"
```

### Create validation hook
```bash
cd tmp/hermes/projects/my-project
aip hook create pre-complete --lang ts
```

### Read skill for context
```bash
aip skill read project-manage
```

## Output Formats

**list commands:** Pipe-separated table
```
slug                 name                           status     assignee
---
api-integration      API Integration                in-progress builder
```

**path commands:** Plain path (for cd)
```
/projects/api-integration
```

**ingest/start commands:** Formatted context
```
## Project: api-integration

{main.md content}

## Task: setup-express

{task main.md content}

## Task Status Log

{status.md content}
```

## Exit Codes

- `0` - Success
- `1` - Error (with message to stderr)

## Environment

Set `TEAM_HOME` to override default `tmp/hermes` location.

---

*CLI is the interface. Commands are stable, use them in scripts and hooks.*
