import { z } from 'zod'
import ctx from '../../util/context.js'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'

export default defineCommand({
  description: 'Output full task context (main.md, log.tsv) for ingestion by agents',
  options: z.object({
    project: z.string().optional().describe('Project slug (searches all projects if not provided)'),
  }),
  args: z.object({
    task: z.string().optional().describe('Task slug (default: from $PWD)'),
  }),
  handler: async ({ project, task }) => {
    const context = ctx.getCurrentContext()
    const taskSlug = task ?? context.task
    if (!taskSlug) {
      throw new Error('Need task slug (or cd into task dir)')
    }
    const { project: projectSlug } = await projects.findTask(taskSlug, project)
    await projects.ingestTask(projectSlug, taskSlug)
  },
})
