import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'

export default defineCommand({
  description: 'Read one or more files into the console',
  options: z.object({}),
  args: z.object({
    paths: z.array(z.string()).describe('File paths to read'),
  }),
  handler: async ({ paths }) => {
    await util.logFiles(...paths)
  },
})
