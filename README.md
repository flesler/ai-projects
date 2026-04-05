# AIP - AI Project Management CLI 🤖

**Built for AI agents. Polished by AI agents.**

A command-line tool for managing AI agent projects, tasks, and agents with structured workflows, activity logging, and automation hooks.

## 📚 Help System

AIP has a comprehensive built-in help system for every level:

```bash
# 🚀 New here? Start with the quick guide
aip help quickstart

# 📋 Browse all commands by noun
aip help usage

# 🎯 Need commands for a specific noun?
aip help usage task      # All task commands
aip help usage project   # All project commands
aip help usage log       # All logging commands

# 📖 Complete API reference (comprehensive!)
aip help api

# 🛠️ Project management skill documentation
aip help skill

# 🔗 Hook system documentation
aip help hooks
```

## ✨ Features

- **Structured Projects**: YAML frontmatter + markdown body
- **Activity Logging**: TSV-based status tracking (date, time, type, action, text)
- **Automation Hooks**: Pre/post hooks for create, start, update, complete
- **Multi-line Support**: Heredoc syntax for complex content
- **Agent-Ready**: Designed for autonomous AI workflows

## 🚀 Quick Start

```bash
# Create a project with multi-line body
aip project create "my-project" --description "..." --body "$(cat <<'EOF'
# Goals
- Build something amazing
- Solve real problems

## Success Criteria
- Tests passing
- Documentation complete
EOF
)"

# Create a task in the project
aip task create my-project "first-task" --description "Get started"

# Navigate and work
cd $(aip task path first-task)

# Log your progress
aip log append "API integration complete"

# View activity history
aip log read
```

## 📁 Project Structure

```
$AIP_HOME/projects/{project}/
├── main.md          # Goals + body (YAML frontmatter + markdown)
├── log.tsv          # Activity log (tab-separated: date, time, type, slug, action, text)
├── hooks/           # Automation: pre|post-{create,start,update,complete}
├── outputs/         # Deliverables go here
├── inputs/          # External data (API responses, downloads)
├── scripts/         # Automation scripts
└── tasks/{task}/
    ├── main.md      # Task definition + body
    ├── log.tsv      # Task activity log
    └── ...          # Same substructure
```

## 🔧 Key Commands

### Projects
```bash
aip project create "name" --description "..." --body "..."
aip project update --status done --body "$(cat final-report.md)"
aip project list
aip project path my-project    # Get absolute path
```

### Tasks
```bash
aip task create my-project "task-name" --description "..."
aip task update --status in-progress
aip task list
aip task path task-name        # Get absolute path
```

### Logging
```bash
aip log append "Completed the implementation"
aip log append --task my-task "Fixed the bug"
aip log read                   # View status history
```

### Utilities
```bash
aip task ingest                # Output full context for AI agents
aip task start                 # Mark as in-progress
aip help quickstart            # Get started guide
```

## 🤖 For AI Agents

If you're an AI agent working with AIP:

1. **Read** `$AIP_HOME/AGENTS.md` first
2. **Review** `main.md` for goals and context
3. **Check** `log.tsv` for activity history
4. **Work** and save outputs to `outputs/`
5. **Log** progress: `aip log append "message"`
6. **Complete**: Set status=done, summarize in project status

## 💡 Pro Tips

```bash
# Chain commands
cd $(aip task path my-task) && aip task start

# Use heredocs for complex body content
aip project update --body "$(cat <<'EOF'
# Updated Goals
...
EOF
)"

# Quick status check
aip log read | tail -5
```

## 🛠️ Development

This tool is **meant for AI agents** and will be **automatically polished by AI agents** based on their usage. 

**Suggestions and PRs welcome!** 🎉

## 📄 License

MIT
