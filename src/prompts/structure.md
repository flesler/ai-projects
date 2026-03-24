# AIP Project Structure

File organization for autonomous AI work.

## Directory Layout

```
$ROOT/
├── projects/
│   ├── {project-slug}/
│   │   ├── main.md           # Goals, scope, context
│   │   ├── status.md         # Chronological activity log
│   │   ├── hooks/            # pre|post-{create,start,update,complete}.*
│   │   ├── inputs/           # External data (API responses, downloads)
│   │   ├── outputs/          # Deliverables (reports, code, final files)
│   │   ├── scripts/          # Automation (bash, python, js)
│   │   └── tasks/
│   │       └── {task-slug}/
│   │           ├── main.md   # Task definition
│   │           ├── status.md # Single-line updates
│   │           ├── hooks/    # Task-level hooks
│   │           ├── inputs/
│   │           ├── outputs/
│   │           └── scripts/
└── agents/
    └── {agent-slug}/
        └── main.md           # Agent profile
```

## File Purposes

### main.md (Context - Read First)

**Project main.md:**
- Objectives and success criteria
- Scope and constraints
- Background information
- Requirements

**Task main.md:**
- Specific deliverable
- Requirements
- Acceptance criteria

**Frontmatter:**
```yaml
---
name: Clear Title
description: One-line summary
assignee: agent-name
status: pending|in-progress|ongoing|done|blocked
created: YYYY-MM-DD
---
```

### status.md (Activity Log - Append Only)

**Task updates** (each work session):
```markdown
### 2026-03-24 14:30 - Implemented API integration
✅ Completed REST API with error handling. Next: write tests.
```

**Project updates** (when task completes):
```markdown
### 2026-03-24 18:00 - Task: api-integration ✅
Implemented 5 endpoints with validation. Details: tasks/api-integration/
```

**Rules:**
- One line per session
- Include timestamp
- State what's done + what's next
- Use emojis: 🔄 in-progress | ✅ done | ⚠️ blocked | ❌ failed

### inputs/ (External Data)

Store here:
- API responses (JSON, XML)
- Downloaded files
- Web scrapes
- Reference documents

**Naming:** `api-response-2026-03-24.json`, `scraped-docs.md`

### outputs/ (Deliverables)

Store here:
- Final reports
- Generated code
- Processed data
- Artifacts for external use

**Naming:** `final-report.md`, `optimized-config.yaml`

### scripts/ (Automation)

Create when:
- Work is repetitive (3+ times)
- Complex command sequences
- Validation/checking needed
- Data transformations

**Languages:**
- **Bash:** Simple ops, command chaining
- **Python:** Data processing, API calls
- **JavaScript:** Web scraping, Node.js tooling

## Workflow

### Starting Work

1. **Read context**
   ```bash
   cat projects/{project}/main.md
   cat projects/{project}/tasks/{task}/main.md
   cat projects/{project}/tasks/{task}/status.md
   ```

2. **Check recent activity** (status.md)

3. **Review inputs/** (existing data)

### During Work

1. **Create scripts/** if automation helps
2. **Save external data to inputs/**
3. **Place deliverables in outputs/**

### Completing Work

1. **Update task status.md** (final entry)
2. **Update task main.md** status → `done`
3. **Append to project status.md** (packed summary)
4. **Ensure outputs/** has all deliverables

## Commands

```bash
# Create
aip project create {name} --description "{desc}"
aip task create {project} {name} --description "{desc}"

# Navigate
cd $(aip project path {name})
cd $(aip task path {project} {task})

# Update
aip task update {project} {task} --status done
aip task update {project} {task} --summary "Completed X"

# Context
aip task ingest {project} {task}   # Full context for AI
```

## Best Practices

**DO:**
- Keep main.md focused (update rarely)
- Append to status.md religiously
- Use inputs/outputs/ separation
- Create scripts for repetitive work
- Run hooks automatically

**DON'T:**
- Put status updates in main.md
- Write paragraphs in status.md
- Mix inputs and outputs
- Create scripts for one-time tasks
- Ignore hook failures

---

*Structure enables autonomy. Clean files = clear context = better execution.*
