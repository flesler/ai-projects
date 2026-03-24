import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'

export default defineCommand({
  description: 'Output task directory path (for cd)',
  options: z.object({}),
  args: z.object({
    project: z.string().describe('Project slug'),
    task: z.string().describe('Task slug'),
  }),
  handler: async ({ project, task }) => {
    const taskDir = projects.getTaskDir(project, task)
    console.log(taskDir)
  },
})
