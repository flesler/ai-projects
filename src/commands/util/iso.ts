import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'

export default defineCommand({
  options: z.object({
    date: z.string().optional().describe('Date to format (defaults to now, accepts any moment-parseable date)'),
  }),
  handler: async ({ date }) => {
    const isoString = util.iso(date || Date.now())
    console.log(isoString)
  },
})
