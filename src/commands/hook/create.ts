import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'
import ctx from '../../util/context.js'
import config from '../../util/config.js'

export default defineCommand({
  options: z.object({
    lang: z.enum(config.languages).default('ts').describe('Language'),
    target: z.enum(config.targets).default('project').describe('Target level'),
  }),
  args: z.object({ type: z.enum(config.hookTypes).describe('Hook type (e.g., pre-create, post-complete)') }),
  handler: async ({ type, lang, target }) => {
    const language = lang
    const ext = `.${language}`

    // Determine target directory
    const { targetDir, entityType } = ctx.getTargetDir(target)

    // Create hooks directory
    const hooksDir = util.join(targetDir, config.dirs.HOOKS)
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
/** ${type} hook for ${entityType} */

import { env } from 'node:process'

console.log('Running ${type} hook for ${entityType}')
console.log('PROJECT_SLUG:', env.PROJECT_SLUG)
if (env.TASK_SLUG) {
  console.log('TASK_SLUG:', env.TASK_SLUG)
}

// Exit with non-zero to prevent action (for pre-hooks)
// process.exit(1)
`
    } else if (language === 'js') {
      template = `#!/usr/bin/env node
/** ${type} hook for ${entityType} */

console.log('Running ${type} hook for ${entityType}')
console.log('PROJECT_SLUG:', process.env.PROJECT_SLUG)
if (process.env.TASK_SLUG) {
  console.log('TASK_SLUG:', process.env.TASK_SLUG)
}

// Exit with non-zero to prevent action (for pre-hooks)
// process.exit(1)
`
    } else if (language === 'sh') {
      template = `#!/bin/bash
# ${type} hook for ${entityType}

echo "Running ${type} hook for ${entityType}"
echo "PROJECT_SLUG: $PROJECT_SLUG"
if [ -n "$TASK_SLUG" ]; then
  echo "TASK_SLUG: $TASK_SLUG"
fi

# Exit with non-zero to prevent action (for pre-hooks)
# exit 1
`
    } else if (language === 'py') {
      template = `#!/usr/bin/env python3
"""${type} hook for ${entityType}"""

import os

print(f"Running ${type} hook for ${entityType}")
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

    const { chmod } = await import('fs/promises')
    await chmod(hookFile, 0o755)

    console.log(`Hook created: ${hookFile}`)
  },
})
