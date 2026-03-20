import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import path from 'path'

export default defineCommand(
  z.object({
    from: z.string().describe('Base path'),
    to: z.string().describe('Target path'),
  }),
  async ({ from, to }) => {
    const relative = path.relative(from, to)
    console.log(relative)
  },
)
