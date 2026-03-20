import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'
import env from '../../util/env.js'

export default defineCommand(
  z.object({
    project: z.string().optional().describe('Project slug (default: from $PWD)'),
    task: z.string().optional().describe('Task slug (default: from $PWD)'),
  }),
  async ({ project, task }) => {
    const ctx = env.getCurrentContext()
    const projectSlug = project ?? ctx.project
    const taskSlug = task ?? ctx.task
    if (!projectSlug || !taskSlug) {
      throw new Error('Need project and task (or cd into task dir)')
    }
    const content = await projects.ingestTask(projectSlug, taskSlug)
    console.log(content)
  },
)
