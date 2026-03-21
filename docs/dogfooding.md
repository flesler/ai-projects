# AIP Dogfooding

24x7 autonomous agents. Read **tmp/hermes/AGENTS.md** first. TEAM_HOME=tmp/hermes, projects in TEAM_HOME/projects/.

## Projects

aip-core (builder) | aip-meta (analyst) | aip-skills (librarian) | aip-ideas | revenue-ideas

## Folder Semantics

| Dir | Purpose |
|-----|---------|
| main.md | Goals, scope. Read first. |
| status.md | Append-only log |
| hooks/ | `{pre,post}-{create,update}.*` – shebang runs it. pre can exit 1 to block. |
| inputs/ | Data consumed (read-only) |
| outputs/ | Deliverables |
| scripts/ | Automation helpers |

## Hook Types

pre-create, post-create, pre-update, post-update

**Pre** = can block. **Post** = runs after, can't block. Env: TASK_DIR, PROJECT_DIR, PROJECT_SLUG, TASK_SLUG, HOOK_TYPE.

Creating hooks: `tmp/hermes/skills/hooks.md`

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
