import { z } from 'zod'
import pkg from '../../../package.json'
import config from '../../util/config.js'
import defineCommand from '../../util/defineCommand.js'
import { TaskStatus } from '../../util/projects.js'

const statusList = Object.values(TaskStatus).join('|')
const { PROJECTS, TASKS, HOOKS, INPUTS, OUTPUTS, SCRIPTS } = config.dirs
const { MAIN, LOG } = config.files
const aip = Object.keys(pkg.bin)[0]

const TEXT = `# AIP - Project Management Skill

Automated project and task creation with proper structure, front-matter, and file organization.

## Purpose

Streamline creation of new projects and tasks with the correct directory structure, file templates, and front-matter. Ensures consistency across all autonomous work.

## Quick Start

- New user? Run: \`${aip} help quickstart\`
- All commands? Run: \`${aip} help usage\`
- Just for one noun? Run: \`${aip} help usage <noun>\` (e.g., \`${aip} help usage task\`)
- Need EVERYTHING (big)? Run: \`${aip} help api\` - Shows all commands with full option details

## File Structure Overview

\`\`\`
$AIP_HOME/${PROJECTS}/{project-slug}/
├── ${MAIN}\t# Goals + body (YAML frontmatter + markdown content)
├── ${LOG}\t# Chronological log (TSV: date, time, entityType, slug, action, text)
├── ${HOOKS}/\t\t# pre|post-{create,start,update,complete}.*
├── ${OUTPUTS}/\t# Deliverables
├── ${INPUTS}/\t# External data
├── ${SCRIPTS}/\t# Automation
└── ${TASKS}/
\t└── {task-slug}/
\t\t├── ${MAIN}\t# Task definition + body
\t\t├── ${LOG}\t# Activity log
\t\t└── ... (same structure)
\`\`\`

## Front-matter Format

\`\`\`yaml
---
name: Clear Title
description: One-line summary
assignee: agent-name
status: ${statusList}
created: YYYY-MM-DD
---
\`\`\`

## Body/Content

Markdown after frontmatter. Add via CLI:

\`\`\`bash
# Using heredoc (multi-line)
${aip} project create "my-project" --description "..." --body "$(cat <<'EOF'
# Goals
- Build X
- Solve Y
EOF
)"

# Update/replace body
${aip} project update --body "$(cat new-content.md)"
\`\`\`

## Best Practices

**DO:** Concise status entries, update every session, save deliverables to outputs/
**DON'T:** Long paragraphs in status, mix inputs/outputs

## For Agents

When working on a task:
1. Read \`main.md\` first (goals/context)
2. Review \`${LOG}\` (activity history)
3. Work and save outputs to \`outputs/\`
4. Log progress: \`${aip} log append "message"\`
5. On completion: set status=\`done\`, log summary
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
metadata:
  hermes:
    tags: [${pkg.keywords.join(', ')}]
---`)
      console.log()
      console.log(TEXT)
      return
    }
  },
})
