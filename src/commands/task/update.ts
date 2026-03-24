import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import hooks from '../../util/hooks.js'
import projects from '../../util/projects.js'
import status from '../../util/status.js'

export default defineCommand({
  description: 'Update task properties: name, description, status, priority, assignee, or append summary',
  options: z.object({
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    status: z.enum(['pending', 'in-progress', 'ongoing', 'done', 'blocked']).optional().describe('New status'),
    priority: z.enum(['low', 'medium', 'high']).optional().describe('New priority'),
    assignee: z.string().optional().describe('New assignee'),
    summary: z.string().optional().describe('Optional summary to append to status.md'),
  }),
  args: z.object({
    project: z.string().optional().describe('Project slug (defaults to current project from $PWD)'),
    task: z.string().optional().describe('Task slug (defaults to current task from $PWD)'),
  }),
  handler: async ({ project, task, name, description, status: newStatus, priority, assignee, summary }) => {
    // Use current context from PWD if not specified
    const ctx = { project, task }
    if (!ctx.project || !ctx.task) {
      throw new Error('No task specified and not in a task directory. Use --project and --task flags.')
    }

    const taskDir = projects.getTaskDir(ctx.project, ctx.task)

    // Run pre-update hooks
    const preHookSuccess = await hooks.runHooksForContext(
      projects.getProjectDir(ctx.project),
      taskDir,
      'pre-update',
      {
        action: 'pre-update',
        entityType: 'task',
        project: ctx.project,
        task: ctx.task,
      },
    )

    if (!preHookSuccess) {
      throw new Error('Pre-update hook failed, aborting update')
    }

    // Build updates object
    const updates: Record<string, string> = {}
    if (name) updates.name = name
    if (description) updates.description = description
    if (newStatus) updates.status = newStatus
    if (priority) updates.priority = priority
    if (assignee) updates.assignee = assignee

    if (Object.keys(updates).length === 0 && !summary) {
      console.log('No updates provided')
      return
    }

    // Update frontmatter
    if (Object.keys(updates).length > 0) {
      await projects.updateTask(ctx.project, ctx.task, updates)

      // Log to status.md
      const changes = Object.entries(updates)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ')
      await status.appendStatus(taskDir, `Updated: ${changes}`)
    }

    // Append summary if provided
    if (summary) {
      await status.appendStatus(taskDir, summary)
    }

    // Run post-update hooks
    await hooks.runHooksForContext(
      projects.getProjectDir(ctx.project),
      taskDir,
      'post-update',
      {
        action: 'post-update',
        entityType: 'task',
        project: ctx.project,
        task: ctx.task,
      },
    )

    console.log(`Task ${ctx.task} updated`)
  },
})
