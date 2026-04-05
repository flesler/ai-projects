import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import hooks from '../../util/hooks.js'
import util from '../../util/index.js'
import projects, { TaskStatus } from '../../util/projects.js'
import logUtil from '../../util/log.js'

export default defineCommand({
  description: 'Create a new task with assignee, initial status and optional body',
  options: z.object({
    description: z.string().optional().describe('Task description'),
    assignee: z.string().optional().describe('Assignee agent slug'),
    status: z.string().default(TaskStatus.BACKLOG).describe('Initial status'),
    body: z.string().optional().describe('Initial body/content (markdown)'),
  }),
  args: z.object({
    project: z.string().describe('Project slug'),
    name: z.string().describe('Task name'),
  }),
  handler: async ({ project, name, description, assignee, status, body }) => {
    const slug = util.slugify(name)

    // Run pre-create hooks
    const projectDir = projects.getProjectDir(project)
    const taskDir = projects.getTaskDir(project, slug)
    const preHookSuccess = await hooks.runHooksForContext(
      projectDir, taskDir, 'pre-create', {
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
      name, description, assignee, status, created: new Date().toISOString(),
    }, body)

    // Log creation
    await logUtil.append(taskDir, 'task', slug, 'created', name)
    await logUtil.append(projectDir, 'task', slug, 'created', `${slug} > status is ${status}`)

    // Run post-create hooks
    await hooks.runHooksForContext(
      projectDir, taskDir, 'post-create', {
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
