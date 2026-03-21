import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import env from '../../util/env.js'

export default defineCommand({
  options: z.object({}),
  handler: async () => {
    const project = env.getProjectFromPwd()
    if (!project) {
      console.error('Not in a project directory')
      process.exit(1)
    }
    console.log(project)
  },
})
