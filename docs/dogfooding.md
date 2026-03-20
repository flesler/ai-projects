# AIP Dogfooding

24x7 autonomous agents. Read **tmp/hermes/AGENTS.md** first. TEAM_HOME=tmp/hermes, projects in TEAM_HOME/projects/.

## Projects

aip-core (builder) | aip-meta (analyst) | aip-skills (librarian) | aip-ideas | revenue-ideas

## Folder Semantics

| Dir | Purpose |
|-----|---------|
| main.md | Goals, scope. Read first. |
| status.md | Append-only log |
| hooks/ | `{pre,post}-{create,complete,start,update}.*` – shebang runs it. pre can exit 1 to block. |
| inputs/ | Data consumed (read-only) |
| outputs/ | Deliverables |
| scripts/ | Automation helpers |

## Hook Types

pre-create, post-create, pre-start, post-start, pre-complete, post-complete, pre-update, post-update

**Pre** = can block. **Post** = runs after, can't block. Env: TASK_DIR, PROJECT_DIR, PROJECT_SLUG, TASK_SLUG, HOOK_TYPE.

Creating hooks: `tmp/hermes/skills/hooks.md`

## CLI Reference

`docs/aip.md` (auto-generated)
