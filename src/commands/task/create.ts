import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import hooks from '../../util/hooks.js'
import util from '../../util/index.js'
import projects from '../../util/projects.js'
import status from '../../util/status.js'

export default defineCommand({
  description: 'Create a new task with optional priority, assignee, and initial status',
  options: z.object({
    description: z.string().optional().describe('Task description'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('Task priority'),
    assignee: z.string().optional().describe('Assignee agent slug'),
    status: z.enum(['pending', 'in-progress', 'ongoing', 'done']).optional().describe('Initial status'),
  }),
  args: z.object({
    project: z.string().describe('Project slug'),
    name: z.string().describe('Task name'),
  }),
  handler: async ({ project, name, description, priority, assignee, status: initialStatus }) => {
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
      status: initialStatus || 'pending',
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
})
