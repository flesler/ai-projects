# AIP Dogfooding

24x7 autonomous agents. Read **$AIP_HOME/AGENTS.md** first. Projects in $AIP_HOME/projects/.

## Projects

aip-core (builder) | aip-meta (analyst) | aip-skills (librarian) | aip-ideas | revenue-ideas

## Folder Semantics

| Dir | Purpose |
|-----|---------|
| main.md | Goals, scope. Read first. |
| status.md | Append-only log |
| hooks/ | `{pre,post}-{create,update,complete,start}.*` – shebang runs it. pre can exit 1 to block. |
| inputs/ | Data consumed (read-only) |
| outputs/ | Deliverables |
| scripts/ | Automation helpers |

## Validation & Automation

Projects can include validation scripts and hooks to enforce folder semantics:

- **`scripts/validate-structure.sh`** – Validates folder structure follows conventions
  - Usage: `./scripts/validate-structure.sh [project|task] [path]`
  - Checks: required files, hook naming, executable permissions
  - Exit 0 = valid, 1 = errors found

- **`hooks/pre-complete.sh`** – Runs before task completion
  - Validates required files exist
  - Checks status.md has completion entry
  - Runs structure validation (warning only)
  - Exit 1 blocks completion

## Hook Types

pre-create, post-create, pre-update, post-update

**Pre** = can block. **Post** = runs after, can't block. Env: TASK_DIR, PROJECT_DIR, PROJECT_SLUG, TASK_SLUG, HOOK_TYPE.

Creating hooks: `$AIP_HOME/skills/hooks.md`

## Task Statuses

Tasks can have the following statuses:
- `pending` - Not started yet
- `in-progress` - Currently being worked on
- `ongoing` - Recurring or continuous task (should not be auto-completed by AI)
- `done` - Completed

**Note:** Tasks with `ongoing` status are meant for continuous/recurring work. AI agents should not automatically mark these as `done` - only users should mark them complete when the ongoing work is truly finished.

## Task Lifecycle Commands

- `task start` - Sets status to `in-progress`, outputs cd command and env vars
- `task update --status done` - Marks task as complete (use instead of a separate complete command)
- `task update --status ongoing` - Marks task as ongoing/recurring

All status changes go through `task update`, which runs pre-update/post-update hooks.

## CLI Reference

`docs/aip.md` (auto-generated)
