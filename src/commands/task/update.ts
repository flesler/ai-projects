import { z } from 'zod'
import ctx from '../../util/context.js'
import defineCommand from '../../util/defineCommand.js'
import hooks from '../../util/hooks.js'
import projects from '../../util/projects.js'
import status from '../../util/status.js'

export default defineCommand({
  description: 'Update task properties: name, description, status, assignee, or append summary',
  options: z.object({
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    status: z.string().optional().describe('New status'),
    assignee: z.string().optional().describe('New assignee'),
    project: z.string().optional().describe('Project slug (searches all projects if not provided)'),
    summary: z.string().optional().describe('Optional summary to append to status.md'),
  }),
  args: z.object({
    task: z.string().optional().describe('Task slug (default: from $PWD)'),
  }),
  handler: async ({ project, task, name, description, status: newStatus, assignee, summary }) => {
    const context = ctx.getCurrentContext()
    const taskSlug = task ?? context.task
    if (!taskSlug) {
      throw new Error('No task specified (use --task or cd into task dir)')
    }

    const { project: projectSlug } = await projects.findTask(taskSlug, project)
    const taskDir = projects.getTaskDir(projectSlug, taskSlug)

    // Run pre-update hooks
    const preHookSuccess = await hooks.runHooksForContext(
      projects.getProjectDir(projectSlug),
      taskDir,
      'pre-update',
      {
        action: 'pre-update',
        entityType: 'task',
        project: projectSlug,
        task: taskSlug,
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
    if (assignee) updates.assignee = assignee

    if (Object.keys(updates).length === 0 && !summary) {
      console.log('No updates provided')
      return
    }

    // Update frontmatter
    if (Object.keys(updates).length > 0) {
      await projects.updateTask(projectSlug, taskSlug, updates)

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
      projects.getProjectDir(projectSlug),
      taskDir,
      'post-update',
      {
        action: 'post-update',
        entityType: 'task',
        project: projectSlug,
        task: taskSlug,
      },
    )

    console.log(`Task ${taskSlug} updated`)
  },
})
