import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'

export default defineCommand(
  z.object({
    project: z.string().describe('Project slug'),
    task: z.string().describe('Task slug'),
  }),
  async ({ project, task }) => {
    const content = await projects.ingestTask(project, task)
    console.log(content)
  },
)
