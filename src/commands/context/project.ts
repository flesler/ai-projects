import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'

export default defineCommand(
  z.object({
    project: z.string().describe('Project slug'),
  }),
  async ({ project }) => {
    const content = await projects.ingestProject(project)
    console.log(content)
  },
)
