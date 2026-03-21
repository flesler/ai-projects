import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'

export default defineCommand({
  options: z.object({
    text: z.string().describe('Text to convert to slug'),
  }),
  handler: async ({ text }) => {
    const slug = util.slugify(text)
    console.log(slug)
  },
})
