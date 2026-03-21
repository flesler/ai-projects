import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import ctx from '../../util/context.js'

export default defineCommand({
  options: z.object({}),
  handler: async () => {
    const project = ctx.getProjectFromPwd()
    if (!project) {
      console.error('Not in a project directory')
      process.exit(1)
    }
    console.log(project)
  },
})
