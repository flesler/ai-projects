import { z } from 'zod'
import config from '../../util/config.js'
import ctx from '../../util/context.js'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'
import logUtil from '../../util/log.js'

export default defineCommand({
  description: 'Append a custom entry to log.tsv',
  options: z.object({
    project: z.string().optional().describe('Project slug (uses current project from $PWD if not provided)'),
    task: z.string().optional().describe('Task slug (uses current task from $PWD if not provided)'),
  }),
  args: z.object({
    text: z.string().describe('Text to append'),
  }),
  handler: async ({ project, task, text }) => {
    const context = ctx.getCurrentContext()

    // Determine project
    const projectSlug = project || context.project
    if (!projectSlug) {
      throw new Error('No project specified. Use --project or run from a project/task directory')
    }

    const projectDir = util.joinHome(config.dirs.PROJECTS, projectSlug)

    // Determine if logging to task or project
    if (task || context.task) {
      const taskSlug = task || context.task
      if (!taskSlug) {
        throw new Error('No task specified')
      }
      const taskDir = util.join(projectDir, config.dirs.TASKS, taskSlug)
      await logUtil.append(taskDir, 'task', taskSlug, 'log', text)
      console.log(`Appended to task ${taskSlug} log.tsv`)
    } else {
      await logUtil.append(projectDir, 'project', projectSlug, 'log', text)
      console.log(`Appended to project ${projectSlug} log.tsv`)
    }
  },
})
