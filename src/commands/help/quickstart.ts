import { z } from 'zod'
import pkg from '../../../package.json'
import defineCommand from '../../util/defineCommand.js'

const name = Object.keys(pkg.bin)[0]

const TEXT = `# Quick Start

## New Task/Project

\`\`\`bash
# 1. Create project (if needed)
${name} project create "my-project" --description "What I'm building"

# 2. Create task
${name} task create my-project "first-task" --description "Start here"

# 3. Navigate to task
cd $(${name} task path first-task)

# 4. Start working (implicit from PWD)
${name} task start
# → sets status to in-progress

# 5. Work session
# Log: echo "[timestamp] did X" >> status.md
# Save: outputs/ to deliver, inputs/ for data
\`\`\`

## Resuming

\`\`\`bash
# Find your tasks (searches all projects)
${name} task list

# Navigate to task
cd $(${name} task path task-slug)

# All commands work implicitly from PWD:
${name} task start\t# Start working (sets status to in-progress)
\`\`\`

## Completing

\`\`\`bash
# Mark done (implicit from PWD)
${name} task update --status done --summary "What I built"
\`\`\`

**Note:** All task commands accept an optional task slug, but use PWD if not provided. Navigate with \`cd\` first for smoother workflow.

## Structure

\`\`\`
$AIP_HOME/projects/slug/
├── main.md\t# Goals (read first)
├── status.md\t# Log (append every session)
└── tasks/task/
\t├── main.md\t# Task definition
\t└── status.md\t# Updates
\`\`\`

**Status format:** \`[YYYY-MM-DD HH:MM] message\`
**Example:** \`[2026-03-30 14:30] API integration complete\`
`

export default defineCommand({
  description: 'Quick start guide for new users',
  options: z.object({}),
  handler: async () => {
    console.log(TEXT)
  },
})
