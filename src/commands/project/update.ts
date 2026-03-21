import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'
import hooks from '../../util/hooks.js'
import status from '../../util/status.js'
import env from '../../util/env.js'

export default defineCommand({
  description: 'Update project properties: name, description, status, assignee, or append summary',
  options: z.object({
    project: z.string().optional().describe('Project slug (defaults to current project from $PWD)'),
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    status: z.string().optional().describe('New status'),
    assignee: z.string().optional().describe('New assignee'),
    summary: z.string().optional().describe('Optional summary to append to status.md'),
  }),
  handler: async ({ project, name, description, status: newStatus, assignee, summary }) => {
    // Use current project from PWD if not specified
    const projectSlug = project || env.getProjectFromPwd()
    if (!projectSlug) {
      throw new Error('No project specified and not in a project directory')
    }

    const projectDir = projects.getProjectDir(projectSlug)

    // Run pre-update hooks
    const preHookSuccess = await hooks.runHooks(projectDir, 'pre-update', {
      action: 'pre-update',
      entityType: 'project',
    })

    if (!preHookSuccess) {
      throw new Error('Pre-update hook failed, aborting update')
    }

    // Build updates object
    const updates: Record<string, string> = {}
    if (name) updates.name = name
    if (description) updates.description = description
    if (newStatus) updates.status = newStatus
    if (assignee) updates.assignee = assignee

    if (Object.keys(updates).length === 0) {
      console.log('No updates provided')
      return
    }

    // Update frontmatter
    await projects.updateProject(projectSlug, updates)

    // Log to status.md
    const changes = Object.entries(updates)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ')
    await status.appendStatus(projectDir, `Updated: ${changes}`)

    // Append summary if provided
    if (summary) {
      await status.appendStatus(projectDir, summary)
    }

    // Run post-update hooks
    await hooks.runHooks(projectDir, 'post-update', {
      action: 'post-update',
      entityType: 'project',
    })

    console.log(`Project ${projectSlug} updated`)
  },
})
