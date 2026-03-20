import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'

export default defineCommand(
  z.object({
    text: z.string().describe('Text to convert to slug'),
  }),
  async ({ text }) => {
    const slug = util.slugify(text)
    console.log(slug)
  },
)
