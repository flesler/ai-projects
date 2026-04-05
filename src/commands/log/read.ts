import { z } from 'zod'
import config from '../../util/config.js'
import ctx from '../../util/context.js'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'
import logUtil from '../../util/log.js'

export default defineCommand({
  description: 'Read log.tsv history',
  options: z.object({
    project: z.string().optional().describe('Project slug (uses current project from $PWD if not provided)'),
    task: z.string().optional().describe('Task slug (uses current task from $PWD if not provided)'),
  }),
  args: z.object({}),
  handler: async ({ project, task }) => {
    const context = ctx.getCurrentContext()

    // Determine project
    const projectSlug = project || context.project
    if (!projectSlug) {
      throw new Error('No project specified. Use --project or run from a project/task directory')
    }

    const projectDir = util.joinHome(config.dirs.PROJECTS, projectSlug)

    // Determine if reading task or project status
    if (task || context.task) {
      const taskSlug = task || context.task
      if (!taskSlug) {
        throw new Error('No task specified')
      }
      const taskDir = util.join(projectDir, config.dirs.TASKS, taskSlug)
      const log = await logUtil.read(taskDir)
      if (log) {
        console.log(log)
      } else {
        console.log(`No log.tsv found for task ${taskSlug}`)
      }
    } else {
      const log = await logUtil.read(projectDir)
      if (log) {
        console.log(log)
      } else {
        console.log(`No log.tsv found for project ${projectSlug}`)
      }
    }
  },
})
