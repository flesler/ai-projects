import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import hooks from '../../util/hooks.js'
import env from '../../util/env.js'
import path from 'path'

const HOOK_TYPES = [
  'pre-create',
  'post-create',
  'pre-complete',
  'post-complete',
  'pre-start',
  'post-start',
  'pre-update',
  'post-update',
] as const

export default defineCommand(
  z.object({
    type: z.enum(HOOK_TYPES).describe('Hook type to run'),
    target: z.enum(['project', 'task']).optional().describe('Target level (default: auto-detect from $PWD)'),
  }),
  async ({ type, target }) => {
    // Determine target directory
    let targetDir: string
    let projectDir: string | undefined
    let entityType: 'project' | 'task'

    if (target === 'project') {
      const project = env.getProjectFromPwd()
      if (!project) {
        throw new Error('Not in a project directory')
      }
      projectDir = path.join(env.PROJECTS_HOME, project)
      targetDir = projectDir
      entityType = 'project'
    } else if (target === 'task') {
      const context = env.getCurrentContext()
      if (!context.project || !context.task) {
        throw new Error('Not in a task directory')
      }
      projectDir = path.join(env.PROJECTS_HOME, context.project)
      targetDir = path.join(projectDir, 'tasks', context.task)
      entityType = 'task'
    } else {
      // Auto-detect
      const context = env.getCurrentContext()
      if (context.task && context.project) {
        projectDir = path.join(env.PROJECTS_HOME, context.project)
        targetDir = path.join(projectDir, 'tasks', context.task)
        entityType = 'task'
      } else if (context.project) {
        projectDir = path.join(env.PROJECTS_HOME, context.project)
        targetDir = projectDir
        entityType = 'project'
      } else {
        throw new Error('Not in a project or task directory. Specify --target flag.')
      }
    }

    const context = {
      action: type,
      entityType,
      project: env.getProjectFromPwd() || undefined,
      task: env.getTaskFromPwd() || undefined,
    }

    const success = await hooks.runHooks(targetDir, type, context)

    if (!success) {
      console.error(`Hook ${type} failed`)
      process.exit(1)
    }

    console.log(`Hook ${type} completed successfully`)
  },
)
