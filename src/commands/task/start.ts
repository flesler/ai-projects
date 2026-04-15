import { z } from 'zod'
import ctx from '../../util/context.js'
import defineCommand from '../../util/defineCommand.js'
import hooks from '../../util/hooks.js'
import projects, { TaskStatus } from '../../util/projects.js'
import update from './update.js'

export default defineCommand({
  description: 'Start a task: set status to in-progress, optionally print context',
  options: z.object({
    project: z.string().optional().describe('Project slug (searches all projects if not provided)'),
    ingest: z.boolean().default(true).describe('Also output context for this task'),
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
    const projectDir = projects.getProjectDir(projectSlug)
    const taskDir = projects.getTaskDir(projectSlug, taskSlug)

    // Run pre-start hooks
    const preHookSuccess = await hooks.runHooksForContext(projectDir, taskDir, 'pre-start', {
      action: 'pre-start',
      entityType: 'task',
      project: projectSlug,
      task: taskSlug,
    })

    if (!preHookSuccess) {
      throw new Error('Pre-start hook failed, aborting task start')
    }

    // Update status to in-progress if not already
    const meta = await projects.getTask(projectSlug, taskSlug)
    if (meta?.status !== TaskStatus.IN_PROGRESS) {
      await update.handler({ project: projectSlug, task: taskSlug, status: TaskStatus.IN_PROGRESS })
    }

    // Optionally output context for ingestion
    if (ingest) {
      await projects.ingestTask(projectSlug, taskSlug)
    }

    // Run post-start hooks
    await hooks.runHooksForContext(projectDir, taskDir, 'post-start', {
      action: 'post-start',
      entityType: 'task',
      project: projectSlug,
      task: taskSlug,
    })
  },
})
