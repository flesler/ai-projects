import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'

export default defineCommand(
  z.object({
    files: z.array(z.string()).describe('Files to read'),
  }),
  async ({ files }) => {
    const content = await projects.ingestFiles(files)
    console.log(content)
  },
)
