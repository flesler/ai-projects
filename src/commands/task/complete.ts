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

    // Run pre-complete hooks (can prevent completion)
    const preHookSuccess = await hooks.runHooksForContext(
      projects.getProjectDir(project),
      taskDir,
      'pre-complete',
      {
        action: 'pre-complete',
        entityType: 'task',
        project,
        task,
      },
    )

    if (!preHookSuccess) {
      throw new Error('Pre-complete hook failed, aborting task completion')
    }

    // Update status to done
    await projects.updateTask(project, task, { status: 'done' })
    await status.appendStatus(taskDir, 'Task completed', process.env.CURRENT_AGENT)

    // Run post-complete hooks
    await hooks.runHooksForContext(
      projects.getProjectDir(project),
      taskDir,
      'post-complete',
      {
        action: 'post-complete',
        entityType: 'task',
        project,
        task,
      },
    )

    console.log(`Task completed: ${task}`)
  },
)
