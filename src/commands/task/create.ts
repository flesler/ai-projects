import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'
import projects from '../../util/projects.js'
import hooks from '../../util/hooks.js'
import status from '../../util/status.js'

export default defineCommand(
  z.object({
    project: z.string().describe('Project slug'),
    name: z.string().describe('Task name'),
    description: z.string().optional().describe('Task description'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('Task priority'),
    assignee: z.string().optional().describe('Assignee agent slug'),
  }),
  async ({ project, name, description, priority, assignee }) => {
    const slug = util.slugify(name)

    // Run pre-create hooks
    const taskDir = projects.getTaskDir(project, slug)
    const preHookSuccess = await hooks.runHooksForContext(
      projects.getProjectDir(project),
      taskDir,
      'pre-create',
      {
        action: 'pre-create',
        entityType: 'task',
        project,
      },
    )

    if (!preHookSuccess) {
      throw new Error('Pre-create hook failed, aborting task creation')
    }

    // Create task
    await projects.createTask(project, slug, {
      name,
      description,
      priority: priority || 'medium',
      assignee,
      status: 'pending',
      created: new Date().toISOString(),
    })

    // Log creation
    await status.appendStatus(taskDir, `Task created: ${name}`)

    // Run post-create hooks
    await hooks.runHooksForContext(
      projects.getProjectDir(project),
      taskDir,
      'post-create',
      {
        action: 'post-create',
        entityType: 'task',
        project,
      },
    )

    console.log(`Task created: ${slug}`)
    console.log(`  Project: ${project}`)
    console.log(`  Path: ${taskDir}`)
  },
)
