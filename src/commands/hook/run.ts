import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import hooks from '../../util/hooks.js'
import ctx from '../../util/context.js'
import config from '../../util/config.js'

export default defineCommand({
  options: z.object({
    target: z.enum(config.targets).optional().describe('Target level'),
  }),
  args: z.object({ type: z.enum(config.hookTypes).describe('Hook type to run') }),
  handler: async ({ type, target }) => {
    // Determine target directory
    const { targetDir, entityType } = ctx.getTargetDir(target)

    const context = {
      action: type,
      entityType,
      project: ctx.getProjectFromPwd() || undefined,
      task: ctx.getTaskFromPwd() || undefined,
    }

    const success = await hooks.runHooks(targetDir, type, context)

    if (!success) {
      console.error(`Hook ${type} failed`)
      process.exit(1)
    }

    console.log(`Hook ${type} completed successfully`)
  },
})
