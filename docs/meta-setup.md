# Meta Setup

## Projects Structure

We're dogfooding AIP by using it to manage its own development.

### Active Projects

**aip-core** (assignee: builder)
- Building the CLI itself
- Tasks: post-mortem hooks, tool analysis utilities

**aip-meta** (assignee: analyst)  
- Managing the development process
- Analyzing patterns, defining agent roles

**aip-skills** (assignee: librarian)
- Agent capability development
- Creating usage documentation and skills

### Agent Roles

- **boss**: Triage and assignment
- **builder**: Code implementation
- **analyst**: Pattern analysis and optimization
- **librarian**: Documentation and skills
- **qa**: Testing and validation

## Workflow

1. Create task in appropriate project
2. Agent starts task: `eval $(aip task start --project X --task Y)`
3. Agent works on task
4. Complete task: `aip task complete --project X --task Y`
5. Post-mortem hook runs automatically (TODO: implement)
6. Learnings encoded in skills

See `docs/philosophy.md` for the full vision.
