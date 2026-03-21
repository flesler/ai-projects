import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import ctx from '../../util/context.js'

export default defineCommand({
  description: 'Get the current task slug from PWD',
  options: z.object({}),
  handler: async () => {
    const task = ctx.getTaskFromPwd()
    if (!task) {
      console.error('Not in a task directory')
      process.exit(1)
    }
    console.log(task)
  },
})
