import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import path from 'path'

export default defineCommand({
  options: z.object({
    paths: z.array(z.string()).describe('Path segments to join'),
  }),
  handler: async ({ paths }) => {
    const joined = path.join(...paths)
    console.log(joined)
  },
})
