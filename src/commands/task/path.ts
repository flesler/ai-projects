import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'

export default defineCommand({
  description: 'Output task directory path (for cd)',
  options: z.object({
    project: z.string().optional().describe('Project slug (searches all projects if not provided)'),
  }),
  args: z.object({
    task: z.string().describe('Task slug'),
  }),
  handler: async ({ project, task }) => {
    const { project: projectSlug, task: taskSlug } = await projects.findTask(task, project)
    const taskDir = projects.getTaskDir(projectSlug, taskSlug)
    console.log(taskDir)
  },
})
