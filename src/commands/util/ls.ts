import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'

export default defineCommand(
  z.object({
    dir: z.string().optional().describe('Directory to list (defaults to current directory)'),
  }),
  async ({ dir }) => {
    const dirPath = dir || process.cwd()
    const exists = await util.fileExists(dirPath)
    if (!exists) {
      throw new Error(`Directory not found: ${dirPath}`)
    }

    const files = await util.listDir(dirPath)
    if (files.length === 0) {
      console.log('(empty directory)')
      return
    }

    for (const file of files) {
      console.log(file)
    }
  },
)
