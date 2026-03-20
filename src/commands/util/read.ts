import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'

export default defineCommand(
  z.object({
    file: z.string().describe('File to read'),
  }),
  async ({ file }) => {
    const exists = await util.fileExists(file)
    if (!exists) {
      throw new Error(`File not found: ${file}`)
    }

    const content = await util.read(file)
    console.log(content)
  },
)
