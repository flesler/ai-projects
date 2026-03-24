Prepend `aip` to each command

`agent create`
· <name>: Agent name  
· --description: Agent description  
· --status: Initial status (default: active)

`agent current`

`agent list`

`agent start`: Start an agent: read SOUL.md and AGENTS.md content
· <name>: Agent name (directory name)

`hook create`
· <type>: Hook type (e.g., pre-create, post-complete)  
· --lang: Language (default: ts)  
· --target: Target level (default: project)

`hook run`
· <type>: Hook type to run  
· --target: Target level

`project create`: Create a new project with name, description, optional status and assignee
· <name>: Project name  
· --description: Project description  
· --status: Initial status (default: active)  
· --assignee: Assignee agent slug

`project current`

`project list`: List all projects, optionally filtered by status
· --status: Filter by status

`project update`: Update project properties: name, description, status, assignee, or append summary
· [project]: Project slug (defaults to current project from $PWD)  
· --name: New name  
· --description: New description  
· --status: New status  
· --assignee: New assignee  
· --summary: Optional summary to append to status.md

`prompt read`: Read one or more prompts into the console
· <names>: Prompt names separated by comma

`skill read`: Read a skill's SKILL.md file into the console for agent context
· <name>: Skill name (directory name)

`task create`: Create a new task with optional priority, assignee, and initial status
· <project>: Project slug  
· <name>: Task name  
· --description: Task description  
· --priority: Task priority  
· --assignee: Assignee agent slug  
· --status: Initial status (default: pending)

`task current`: Get the current task slug from PWD

`task ingest`: Output full task context (main.md, status.md) for ingestion by agents
· [project]: Project slug (default: from $PWD)  
· [task]: Task slug (default: from $PWD)

`task list`: List tasks in a project, optionally filtered by status or assignee
· --project: Project slug (defaults to current project from $PWD)  
· --status: Filter by status  
· --assignee: Filter by assignee

`task start`: Start a task: set status to in-progress, optionally print context
· <project>: Project slug  
· <task>: Task slug  
· --ingest: Also output context for this task (default: false)

`task update`: Update task properties: name, description, status, priority, assignee, or append summary
· [project]: Project slug (defaults to current project from $PWD)  
· [task]: Task slug (defaults to current task from $PWD)  
· --name: New name  
· --description: New description  
· --status: New status  
· --priority: New priority  
· --assignee: New assignee  
· --summary: Optional summary to append to status.md

`util postmortem`: Post-mortem analysis for a completed task
· <project>: Project slug  
· <task>: Task slug

