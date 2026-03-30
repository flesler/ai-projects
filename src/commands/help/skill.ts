import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import pkg from '../../../package.json'

const TEXT = `# AIP - Project Management Skill

Automated project and task creation with proper structure, front-matter, and file organization.

## Purpose

Streamline creation of new projects and tasks with the correct directory structure, file templates, and front-matter. Ensures consistency across all autonomous work.

## File Structure

Every project follows this structure:

\`\`\`
$AIP_HOME/projects/{project-slug}/
├── main.md               # Primary context: goals, objectives, scope, data
├── status.md             # Chronological log of status updates
├── hooks/                # pre|post-{create,start,update,complete}.*
├── outputs/              # Deliverables (reports, code, final files)
├── inputs/               # External data (API responses, downloads)
├── scripts/              # Automation (bash/python/js)
└── tasks/
    └── {task-slug}/
        ├── main.md       # Task definition with front-matter
        ├── status.md     # Single-line updates per work session
        ├── hooks/        # Task-level hooks
        ├── outputs/      # Task-specific deliverables
        ├── inputs/       # Task-specific data files
        └── scripts/      # Task-specific automation
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
status: pending|in-progress|ongoing|done|blocked
created: YYYY-MM-DD
---
\`\`\`

**When to read:** Always first, before starting work

**When to update:** Only when scope/goals change (rare)

### \`status.md\` - Activity Log (Append Only)
**What goes here:**
- **Tasks:** Single-line updates per work session
  \`\`\`markdown
  ### 2026-03-17 14:30 - Started implementation
  ✅ Completed API integration. Next: testing.
  \`\`\`
- **Projects:** Packed summary when task completes
  \`\`\`markdown
  ### 2026-03-17 18:30 - Task: apply-optimizations ✅
  Implemented 7 optimizations (P0+P1). Config improved, fallbacks enabled. Details: tasks/apply-optimizations/
  \`\`\`

**Status emojis:** 🔄 in-progress | ✅ done | ⚠️ blocked | ❌ failed

**When to read:** To understand current state and recent activity

**When to update:** 
- **Tasks:** Every work session (append 1 line)
- **Projects:** When task completes (append 1 packed line)

### \`outputs/\` - Deliverables
**What goes here:**
- Final reports and documents
- Generated code files
- Processed data
- Artifacts meant for use outside the project

**Examples:**
- \`outputs/final-report.md\`
- \`outputs/optimized-config.yaml\`
- \`outputs/website-code.zip\`
- \`outputs/database-migration.sql\`

**When to write:** When task produces tangible results

### \`inputs/\` - External Data
**What goes here:**
- API responses (JSON, XML)
- Downloaded files (web pages, datasets)
- Reference documents used in process
- Raw data before processing

**Examples:**
- \`inputs/api-response-2026-03-17.json\`
- \`inputs/downloaded-docs.zip\`
- \`inputs/webpage-scrape.md\`

**When to write:** When fetching external data for processing

### \`scripts/\` - Automation
**What goes here:**
- Bash scripts for simple automation
- Python scripts for complex logic
- JavaScript/TypeScript for tooling
- Any code that helps complete the task

**Language Choice:**
- **Bash**: Simple file ops, command chaining, system commands
- **Python**: Data processing, API calls, complex logic
- **JavaScript/TypeScript**: Web scraping, Node.js tooling

**Examples:**
- \`scripts/deploy.sh\`
- \`scripts/process-data.py\`
- \`scripts/scrape-docs.js\`

**When to write:** When automation saves time or improves reliability

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
  --description "Implement safe optimizations with backups" \\
  --assignee basic \\
  --priority high
\`\`\`

### Navigate to Project/Task

\`\`\`bash
cd $(aip project path optimize-hermes-config)
cd $(aip task path optimize-hermes-config apply-config-changes)
\`\`\`

### Update Task Status

\`\`\`bash
aip task update optimize-hermes-config apply-config-changes --status done
aip task update optimize-hermes-config apply-config-changes --summary "Completed implementation"
\`\`\`

## Work Session Pattern

**When working on a task:**

1. **Read Context**
   \`\`\`bash
   cat /state/projects/{project}/main.md
   cat /state/projects/{project}/tasks/{task}/main.md
   cat /state/projects/{project}/tasks/{task}/status.md
   \`\`\`

2. **Do Work**
   - Create scripts in \`scripts/\` if automation helps
   - Save external data to \`inputs/\`
   - Place deliverables in \`outputs/\`

3. **Update Status** (REQUIRED)
   \`\`\`markdown
   ### YYYY-MM-DD HH:MM - Brief description
   ✅ What was accomplished. Next: what's next.
   \`\`\`

4. **On Task Completion**
   - Update task \`main.md\` status to \`completed\`
   - Append packed summary to project \`status.md\`
   - Ensure all outputs are in \`outputs/\`

## Best Practices

### Status Updates

**DO:**
\`\`\`markdown
### 2026-03-17 14:30 - API integration
✅ Completed REST API integration with error handling. Next: write tests.
\`\`\`

**DON'T:**
\`\`\`markdown
### 2026-03-17 14:30
So today I worked on the API integration and it took quite a while because there were some issues with the authentication but I managed to figure it out and now it's working properly. I think the next step should be to write some tests to make sure everything keeps working.
\`\`\`

**Use status emojis:** 🔄 in-progress | ✅ done | ⚠️ blocked | ❌ failed

### File Organization

**DO:**
- Keep \`main.md\` focused on goals and context (update rarely)
- Append to \`status.md\` chronologically (single lines)
- Place final deliverables in \`outputs/\`
- Store external data in \`inputs/\`
- Create scripts only when they save time

**DON'T:**
- Put status updates in \`main.md\`
- Write long paragraphs in \`status.md\`
- Mix inputs and outputs
- Create scripts for one-time simple tasks

### Front-matter

**Always include:**
- \`name\`: Clear, searchable title
- \`description\`: One-line summary (for search and listings)
- \`assignee\`: Agent name who should execute
- \`priority\`: \`low\`, \`medium\`, or \`high\`
- \`status\`: \`pending\`, \`in-progress\`, \`ongoing\`, \`done\`, or \`blocked\`
- \`created\`: Date in YYYY-MM-DD format

## Task Lifecycle Commands

- \`task start\` - Sets status to \`in-progress\`, outputs cd command and env vars
- \`task update --status done\` - Marks task as complete
- \`task update --status ongoing\` - Marks task as ongoing/recurring (won't be auto-completed)

All status changes go through \`task update\`, which runs pre-update/post-update hooks.

## Examples

### Example Project: Website Redesign

\`\`\`
$AIP_HOME/projects/website-redesign/
├── main.md
│   ---
│   name: Website Redesign
│   description: Modernize company website with new branding
│   assignee: boss
│   priority: high
│   status: in-progress
│   created: 2026-03-17
│   ---
│   ## Objective
│   Redesign company website with new branding guidelines...
│
├── status.md
│   # Status: Website Redesign
│   ### 2026-03-17 16:00 - Task: gather-requirements ✅
│   Collected stakeholder requirements, analyzed competitors. Details: tasks/gather-requirements/
│
├── hooks/
│   └── pre-complete.sh    # Project-level validation
│
├── tasks/
│   └── gather-requirements/
│       ├── main.md (assignee: basic, priority: high, status: done)
│       ├── status.md
│       │   ### 2026-03-17 14:00 - Started research
│       │   🔄 Analyzing competitor websites.
│       │   ### 2026-03-17 16:00 - Completed analysis
│       │   ✅ Documented 15 requirements. Output: outputs/requirements.md
│       ├── hooks/
│       │   └── pre-complete.sh   # Task-level validation
│       ├── outputs/
│       │   └── requirements.md
│       └── inputs/
│           └── competitor-analysis.json
\`\`\`

### Example Task Status Flow

\`\`\`markdown
### 2026-03-17 09:00 - Started implementation
🔄 Setting up project structure.

### 2026-03-17 10:30 - API integration
✅ REST API connected. Next: error handling.

### 2026-03-17 11:15 - Error handling
✅ Added retry logic and fallbacks. Next: testing.

### 2026-03-17 12:00 - Testing complete
✅ All tests passing (23/23). Ready for review.
\`\`\`

## Related Files

- \`docs/dogfooding.md\` - AIP project management documentation
- \`$AIP_HOME/AGENTS.md\` - Agent profiles and workflows
- \`src/commands/help/structure.ts\` - CLI help for project structure
- \`src/commands/help/hooks.ts\` - CLI help for hooks system

---

*This skill ensures consistent project structure across all autonomous work. Use it for all new projects and tasks.*
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
