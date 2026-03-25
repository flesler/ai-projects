import { z } from 'zod'
import ctx from '../../util/context.js'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'

export default defineCommand({
  description: 'Output full task context (main.md, status.md) for ingestion by agents',
  options: z.object({}),
  args: z.object({
    project: z.string().optional().describe('Project slug (default: from $PWD)'),
    task: z.string().optional().describe('Task slug (default: from $PWD)'),
  }),
  handler: async ({ project, task }) => {
    const context = ctx.getCurrentContext()
    const projectSlug = project ?? context.project
    const taskSlug = task ?? context.task
    if (!projectSlug || !taskSlug) {
      throw new Error('Need project and task (or cd into task dir)')
    }
    await projects.ingestTask(projectSlug, taskSlug)
  },
})
