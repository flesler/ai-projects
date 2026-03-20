import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'
import env from '../../util/env.js'
import path from 'path'
import config from '../../util/config.js'

export default defineCommand(
  z.object({
    type: z.enum(config.hookTypes).describe('Hook type (e.g., pre-create, post-complete)'),
    lang: z.enum(config.languages).optional().describe('Language (default: ts)'),
    target: z.enum(config.targets).optional().describe('Target level (default: task if in task dir, else project)'),
  }),
  async ({ type, lang, target }) => {
    const language = lang || 'ts'
    const ext = `.${language}`

    // Determine target directory
    let targetDir: string
    let actualTarget: 'project' | 'task'

    if (target === 'project') {
      const project = env.getProjectFromPwd()
      if (!project) {
        throw new Error('Not in a project directory. Use --project flag or cd into a project.')
      }
      targetDir = path.join(env.PROJECTS_HOME, project)
      actualTarget = 'project'
    } else if (target === 'task') {
      const context = env.getCurrentContext()
      if (!context.project || !context.task) {
        throw new Error('Not in a task directory. Use --project and --task flags or cd into a task.')
      }
      targetDir = path.join(env.PROJECTS_HOME, context.project, config.dirs.TASKS, context.task)
      actualTarget = 'task'
    } else {
      // Auto-detect
      const context = env.getCurrentContext()
      if (context.task && context.project) {
        targetDir = path.join(env.PROJECTS_HOME, context.project, config.dirs.TASKS, context.task)
        actualTarget = 'task'
      } else if (context.project) {
        targetDir = path.join(env.PROJECTS_HOME, context.project)
        actualTarget = 'project'
      } else {
        throw new Error('Not in a project or task directory. Specify --target flag.')
      }
    }

    // Create hooks directory
    const hooksDir = util.join(targetDir, 'hooks')
    await util.ensureDir(hooksDir)

    // Create hook file
    const hookFile = util.join(hooksDir, `${type}${ext}`)
    const exists = await util.fileExists(hookFile)
    if (exists) {
      throw new Error(`Hook already exists: ${hookFile}`)
    }

    // Generate template based on language
    let template: string
    if (language === 'ts') {
      template = `#!/usr/bin/env tsx
/** ${type} hook for ${actualTarget} */

import { env } from 'node:process'

console.log('Running ${type} hook for ${actualTarget}')
console.log('PROJECT_SLUG:', env.PROJECT_SLUG)
if (env.TASK_SLUG) {
  console.log('TASK_SLUG:', env.TASK_SLUG)
}

// Exit with non-zero to prevent action (for pre-hooks)
// process.exit(1)
`
    } else if (language === 'js') {
      template = `#!/usr/bin/env node
/** ${type} hook for ${actualTarget} */

console.log('Running ${type} hook for ${actualTarget}')
console.log('PROJECT_SLUG:', process.env.PROJECT_SLUG)
if (process.env.TASK_SLUG) {
  console.log('TASK_SLUG:', process.env.TASK_SLUG)
}

// Exit with non-zero to prevent action (for pre-hooks)
// process.exit(1)
`
    } else if (language === 'sh') {
      template = `#!/bin/bash
# ${type} hook for ${actualTarget}

echo "Running ${type} hook for ${actualTarget}"
echo "PROJECT_SLUG: $PROJECT_SLUG"
if [ -n "$TASK_SLUG" ]; then
  echo "TASK_SLUG: $TASK_SLUG"
fi

# Exit with non-zero to prevent action (for pre-hooks)
# exit 1
`
    } else if (language === 'py') {
      template = `#!/usr/bin/env python3
"""${type} hook for ${actualTarget}"""

import os

print(f"Running ${type} hook for ${actualTarget}")
print(f"PROJECT_SLUG: {os.environ.get('PROJECT_SLUG')}")
if os.environ.get('TASK_SLUG'):
    print(f"TASK_SLUG: {os.environ.get('TASK_SLUG')}")

# Exit with non-zero to prevent action (for pre-hooks)
# sys.exit(1)
`
    } else {
      throw new Error(`Unsupported language: ${language}`)
    }

    await util.write(hookFile, template)

    console.log(`Hook created: ${hookFile}`)
  },
)
