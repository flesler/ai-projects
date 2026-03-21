import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import hooks from '../../util/hooks.js'
import env from '../../util/env.js'
import config from '../../util/config.js'

export default defineCommand({
  options: z.object({
    target: z.enum(config.targets).optional().describe('Target level (default: auto-detect from $PWD)'),
  }),
  args: z.object({ type: z.enum(config.hookTypes).describe('Hook type to run') }),
  handler: async ({ type, target }) => {
    // Determine target directory
    const { targetDir, entityType } = env.getTargetDir(target)

    const context = {
      action: type,
      entityType,
      project: env.getProjectFromPwd() || undefined,
      task: env.getTaskFromPwd() || undefined,
    }

    const success = await hooks.runHooks(targetDir, type, context)

    if (!success) {
      console.error(`Hook ${type} failed`)
      process.exit(1)
    }

    console.log(`Hook ${type} completed successfully`)
  },
})
