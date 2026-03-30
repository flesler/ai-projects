import { z } from 'zod'
import ctx from '../../util/context.js'
import defineCommand from '../../util/defineCommand.js'
import projects, { TaskStatus } from '../../util/projects.js'
import update from './update.js'

export default defineCommand({
  description: 'Start a task: set status to in-progress, optionally print context',
  options: z.object({
    project: z.string().optional().describe('Project slug (searches all projects if not provided)'),
    ingest: z.boolean().default(false).describe('Also output context for this task'),
  }),
  args: z.object({
    task: z.string().optional().describe('Task slug (default: from $PWD)'),
  }),
  handler: async ({ project, task, ingest }) => {
    const context = ctx.getCurrentContext()
    const taskSlug = task ?? context.task
    if (!taskSlug) {
      throw new Error('No task specified (use --task or cd into task dir)')
    }

    const { project: projectSlug } = await projects.findTask(taskSlug, project)

    // Update status to in-progress if not already
    const meta = await projects.getTask(projectSlug, taskSlug)
    if (meta?.status !== TaskStatus.IN_PROGRESS) {
      await update.handler({ project: projectSlug, task: taskSlug, status: TaskStatus.IN_PROGRESS })
    }

    // Optionally output context for ingestion
    if (ingest) {
      await projects.ingestTask(projectSlug, taskSlug)
    }
  },
})
