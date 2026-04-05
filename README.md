# AIP - AI Project Management CLI 🤖

**Built for AI agents. Polished by AI agents.**

A command-line tool for managing AI agent projects, tasks, and agents with structured workflows, activity logging, and automation hooks.

## 📚 Help System

AIP has a comprehensive built-in help system for every level:

```bash
# 🚀 New here? Start with the quick guide
aip help quickstart

# 📋 Read list of verbs by all nouns
aip --help          # Same as `aip help usage`

# 🎯 List of verbs by noun (same as `aip <noun> --help`)
aip task --help      # Same as `aip help usage task`

# 📋 Get all parameters and --options for a command
aip task create --help

# 📖 Complete API reference (comprehensive!)
aip help api

# 🛠️ Project management skill documentation (can be piped to a SKILL.md)
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
# Create project with body (inline - cleanest)
aip project create "my-project" --description "..." --body $'# Goals\n- Build X\n- Solve Y'

# Create project with body (here-string for multi-line)
aip project create "my-project" --description "..." --body "$(cat <<< '# Goals
- Build X
- Solve Y')"

# Create a task in the project
aip task create my-project "first-task" --description "Get started"

# Navigate and work
cd $(aip task path first-task)

# Start working (and read in all context to stdout)
aip task start

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
aip task start                 # Start working (and read in all context to stdout)
```

### Logging
```bash
aip log append "Completed the implementation"
aip log append --task my-task "Fixed the bug"
aip log read                   # View status history
```

### Utilities
```bash
aip help quickstart            # Get started guide
aip help skill --mode claude > ~/.claude/skills/aip/SKILL.md
aip help skill --mode hermes > ~/.hermes/skills/some_toolset/aip/SKILL.md
```

## 💡 Pro Tips

```bash
# Chain commands
cd $(aip task path my-task) && aip task start

# Use here-string for complex body content
aip project update --body "$(cat <<< '# Updated Goals
- New goal 1
- New goal 2')"

# Quick status check
aip log read | tail -5
```

## 🛠️ Development

This tool is **meant for AI agents** and will be **automatically polished by AI agents** based on their usage. 

**Suggestions and PRs welcome!** 🎉

## 📄 License

MIT
