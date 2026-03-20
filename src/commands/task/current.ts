import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import env from '../../util/env.js'

export default defineCommand(
  z.object({}),
  async () => {
    const task = env.getTaskFromPwd()
    if (!task) {
      console.error('Not in a task directory')
      process.exit(1)
    }
    console.log(task)
  },
)
