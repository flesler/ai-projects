import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import status from '../../util/status.js'

export default defineCommand(
  z.object({
    text: z.string().describe('Log message'),
    agent: z.string().optional().describe('Agent name (defaults to $CURRENT_AGENT)'),
  }),
  async ({ text, agent }) => {
    // Log to current directory's status.md (works from task or project dir)
    await status.appendStatus(process.cwd(), text, agent)
    console.log('Logged to status.md')
  },
)
