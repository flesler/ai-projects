# AIP Roadmap

AI Project Management CLI for Hermes Agent

## Current State

- ✅ Basic CLI scaffolding with `aip <noun> <verb>` pattern
- ✅ Command structure: `agent create`, `project create`, `task create`, `task complete`
- ✅ Zod-based schema validation for command options
- ✅ Auto-generated CLI documentation (`docs/aip.md`)
- ✅ Project template in `tmp/hermes/projects/inbox/`

## What We Need

### Core Features

1. **Project Management**
   - `aip project list` - List all projects (filter by status)
   - `aip project create` - Create project with frontmatter (name, description, status, assignee)
   - `aip project update` - Update project metadata
   - `aip project current` - Get current project slug from $PWD

2. **Task Management (Kanban-style)**
   - `aip task list [--status <status>]` - List tasks with status filter
   - `aip task create` - Create task with frontmatter (name, description, assignee, priority, status)
   - `aip task start <project> <task>` - Start task: update status + cd into task directory
   - `aip task complete` - Mark task complete + run post-complete hooks
   - `aip task update [--assignee <agent>] [--status <status>] [--summary <text>]` - Update task metadata
   - `aip task current` - Get current task slug from $PWD
   - `aip task ingest <project> <task>` - Read all task files (main.md, status.md, etc.) for agent context

3. **Hook System**
   - `aip hook create <type>` - Create hook template (pre/post-create/complete)
   - `aip hook run <type>` - Run hook manually
   - Hooks: `./hooks/{pre,post}-{create,complete,update,start}.{ts,js,sh,py}`
   - Pre-hooks can prevent action (exit 1)
   - Hooks auto-executed by task/project commands

4. **Environment Variables**
   - `$CURRENT_PROJECT` - Derived from $PWD
   - `$CURRENT_TASK` - Derived from $PWD
   - `$CURRENT_AGENT` - Current agent slug
   - Auto-exported when cd-ing into project/task directories

5. **Agent Management**
   - `aip agent list` - List all agents
   - `aip agent create` - Create agent with frontmatter
   - `aip agent current` - Get current agent slug

6. **Context Ingestion**
   - `aip context files <files...>` - Mass read files for agent context
   - `aip context task <project> <task>` - Ingest all task-related files
   - `aip context project <project>` - Ingest project + all tasks

### File Structure

```
projects/
  {project-slug}/
    main.md           # Frontmatter: name, description, status, assignee, created
    status.md         # Activity log, append-only
    hooks/
      pre-create.ts
      post-complete.sh
    tasks/
      {task-slug}/
        main.md       # Frontmatter: name, description, assignee, priority, status, created
        status.md     # Activity log
        hooks/
          pre-start.py
          post-complete.js
```

### Technical Requirements

- Environment variable inference from $PWD
- Hook execution with exit code handling
- Frontmatter parsing (YAML)
- Status logging with timestamps
- File ingestion utilities for agents
- Bash integration (cd + env export)
