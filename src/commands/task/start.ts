import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'
import hooks from '../../util/hooks.js'
import status from '../../util/status.js'

export default defineCommand(
  z.object({
    project: z.string().describe('Project slug'),
    task: z.string().describe('Task slug'),
  }),
  async ({ project, task }) => {
    const taskDir = projects.getTaskDir(project, task)

    // Run pre-start hooks
    const preHookSuccess = await hooks.runHooksForContext(
      projects.getProjectDir(project),
      taskDir,
      'pre-start',
      {
        action: 'pre-start',
        entityType: 'task',
        project,
        task,
      },
    )

    if (!preHookSuccess) {
      throw new Error('Pre-start hook failed, aborting task start')
    }

    // Update status to in-progress if not already
    const currentMeta = await projects.getTask(project, task)
    if (currentMeta?.status !== 'in-progress') {
      await projects.updateTask(project, task, { status: 'in-progress' })
      await status.appendStatus(taskDir, 'Status changed to: in-progress')
    }

    // Run post-start hooks
    await hooks.runHooksForContext(
      projects.getProjectDir(project),
      taskDir,
      'post-start',
      {
        action: 'post-start',
        entityType: 'task',
        project,
        task,
      },
    )

    // Output cd command and env export
    console.log(`cd "${taskDir}"`)
    console.log(`export CURRENT_PROJECT="${project}"`)
    console.log(`export CURRENT_TASK="${task}"`)
  },
)
