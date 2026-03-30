import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import pkg from '../../../package.json'
import { TaskStatus } from '../../util/projects.js'
import config from '../../util/config.js'

const statusList = Object.values(TaskStatus).join('|')
const { PROJECTS, TASKS, HOOKS, INPUTS, OUTPUTS, SCRIPTS } = config.dirs
const { MAIN, STATUS } = config.files

const TEXT = `# AIP - Project Management Skill

Automated project and task creation with proper structure, front-matter, and file organization.

## Purpose

Streamline creation of new projects and tasks with the correct directory structure, file templates, and front-matter. Ensures consistency across all autonomous work.

## File Structure

Every project follows this structure:

\`\`\`
$AIP_HOME/${PROJECTS}/{project-slug}/
├── ${MAIN}\t# Primary context: goals, objectives, scope, data
├── ${STATUS}\t# Chronological log of status updates
├── ${HOOKS}/\t\t# pre|post-{create,start,update,complete}.*
├── ${OUTPUTS}/\t# Deliverables (reports, code, final files)
├── ${INPUTS}/\t# External data (API responses, downloads)
├── ${SCRIPTS}/\t# Automation (bash/python/js)
└── ${TASKS}/
\t└── {task-slug}/
\t\t├── ${MAIN}\t# Task definition with front-matter
\t\t├── ${STATUS}\t# Single-line updates per work session
\t\t├── ${HOOKS}/\t# Task-level hooks
\t\t├── ${OUTPUTS}/\t# Task-specific deliverables
\t\t├── ${INPUTS}/\t# Task-specific data files
\t\t└── ${SCRIPTS}/\t# Task-specific automation
\`\`\`

## File Purposes

### \`main.md\` - Primary Context (Read First)
**What goes here:**
- Project/task objectives and goals
- Scope and success criteria
- Background information and context
- Requirements and constraints
- Reference information

**Front-matter:**
\`\`\`yaml
---
name: Clear Title
description: One-line summary for search
assignee: agent-name
status: ${statusList}
created: YYYY-MM-DD
---
\`\`\`

**When to read:** Always first, before starting work

**When to update:** Only when scope/goals change (rare)

### \`status.md\` - Activity Log (Append Only)
**What goes here:** Single-line timestamped entries

**Task examples:**
\`\`\`markdown
[2026-03-17 14:30] Task created: optimize-config
[2026-03-17 15:45] Updated: status=in-progress
[2026-03-17 16:20] API integration complete
\`\`\`

**Project example:**
\`\`\`markdown
[2026-03-17 16:00] Task completed: gather-requirements (details: tasks/gather-requirements/)
\`\`\`

**When to update:** Every work session (tasks) or task completion (projects)

### \`outputs/\` - Deliverables
**What:** Final deliverables (reports, code, data)
**Examples:** \`outputs/report.md\`, \`outputs/code.zip\`

### \`inputs/\` - External Data
**What:** External data (API responses, downloads)
**Examples:** \`inputs/api.json\`, \`inputs/data.csv\`

### \`scripts/\` - Automation
**What:** Automation scripts (bash, python, js)
**Examples:** \`scripts/deploy.sh\`, \`scripts/process.py\`

## Usage

### Create New Project

\`\`\`bash
# Via AIP CLI
aip project create "optimize-hermes-config" \\
  --description "Analyze and optimize Hermes Agent configuration" \\
  --assignee basic
\`\`\`

### Create New Task in Existing Project

\`\`\`bash
aip task create "optimize-hermes-config" "apply-config-changes" \\
  --description "Implement safe optimizations" \\
  --assignee basic
\`\`\`

### Navigate to Project/Task

\`\`\`bash
cd $(aip project path optimize-hermes-config)
cd $(aip task path apply-config-changes)
\`\`\`

### Update Task Status (implicit from PWD)

\`\`\`bash
aip task update --status done
aip task update --summary "Completed implementation"
\`\`\`

**Note:** All task commands accept optional task slug, but use PWD if not provided. Navigate with \`cd\` first for smoother workflow.

## Work Session

1. **Read:** \`main.md\` + \`status.md\`
2. **Work:** Save data to \`inputs/\`, deliverables to \`outputs/\`
3. **Log:** Append to \`status.md\`: \`[timestamp] message\`
4. **Complete:** Set status=\`done\`, summarize to project \`status.md\`

## Best Practices

**DO:** Concise status entries, update every session
**DON'T:** Long paragraphs, mix inputs/outputs

**Front-matter:** \`name\`, \`description\`, \`assignee\`, \`status\`, \`created\`

## Example

\`\`\`
$AIP_HOME/projects/my-project/
├── ${MAIN}\t# Goals, context
├── ${STATUS}\t# Activity log
└── ${TASKS}/
\t└── task-1/
\t\t├── ${MAIN}\t# Task definition
\t\t└── ${STATUS}\t# Updates
\`\`\`

**Status log:**
\`\`\`markdown
[2026-03-17 09:00] Task created: implement-api
[2026-03-17 10:30] Updated: status=in-progress
[2026-03-17 12:00] Tests passing
\`\`\`
`

export default defineCommand({
  description: 'Project management skill for creating and managing projects/tasks',
  options: z.object({
    mode: z.enum(['md', 'claude', 'hermes']).default('md').describe('Output format: md (no header), claude (name+description), hermes (full frontmatter)'),
  }),
  handler: async (opts) => {
    const name = Object.keys(pkg.bin)[0]

    if (opts.mode === 'md') {
      console.log(TEXT)
      return
    }

    if (opts.mode === 'claude') {
      console.log(`---
name: ${name}
description: ${pkg.description}
---`)
      console.log()
      console.log(TEXT)
      return
    }

    if (opts.mode === 'hermes') {
      console.log(`---
name: ${name}
description: ${pkg.description}
version: ${pkg.version}
author: ${pkg.author}
license: ${pkg.license}
---`)
      console.log()
      console.log(TEXT)
      return
    }
  },
})
