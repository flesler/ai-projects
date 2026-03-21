import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'

export default defineCommand({
  options: z.object({}),
  handler: async () => {
    const agent = process.env.CURRENT_AGENT
    if (!agent) {
      console.error('CURRENT_AGENT not set')
      process.exit(1)
    }
    console.log(agent)
  },
})
