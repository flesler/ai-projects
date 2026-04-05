import { z } from 'zod'
import pkg from '../../../package.json'
import defineCommand from '../../util/defineCommand.js'

const aip = Object.keys(pkg.bin)[0]

const TEXT = `# Quick Start

## New Task/Project

\`\`\`bash
# 1. Create project (if needed)
${aip} project create "my-project" --description "What I'm building"

# 2. Create task
${aip} task create my-project "first-task" --description "Start here"

# 3. Navigate to task
cd $(${aip} task path first-task)

# 4. Start working (implicit from PWD)
${aip} task start
# → sets status to in-progress, reads all context to stdout

# 5. Work session
# Log progress: ${aip} log append "API integration complete"
# Save: outputs/ to deliver, inputs/ for data
\`\`\`

## Resuming

\`\`\`bash
# Find your tasks (searches all projects)
${aip} task list

# Navigate to task
cd $(${aip} task path task-slug)

# All commands work implicitly from PWD:
${aip} task start\t# Start working (sets status to in-progress, reads all context to stdout)
\`\`\`

## Completing

\`\`\`bash
# Mark done (implicit from PWD)
${aip} task update --status done
${aip} log append "if you want to log something extra"
\`\`\`

## Check current task

\`\`\`bash
${aip} task current
\`\`\`

**Note:** All task commands accept an optional task slug, but use PWD if not provided. Navigate with \`cd\` first for smoother workflow.

## Structure

\`\`\`
$AIP_HOME/projects/slug/
├── main.md\t# Goals (read first)
├── status.tsv\t# Log (append every session)
└── tasks/task/
\t├── main.md\t# Task definition
\t└── status.tsv\t# Updates
\`\`\`

**Status format:** TSV with columns: date, time, entityType, slug, action, text
**Example:** \`2026-03-30<TAB>14:30:00<TAB>task<TAB>api-integration<TAB>log<TAB>API integration complete\`

## Commands

Run \`${aip} help usage\` for all commands.
`

export default defineCommand({
  description: 'Quick start guide for new users',
  options: z.object({}),
  handler: async () => {
    console.log(TEXT)
  },
})
