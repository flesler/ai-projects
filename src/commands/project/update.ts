import { z } from 'zod'
import config from '../../util/config.js'
import ctx from '../../util/context.js'
import defineCommand from '../../util/defineCommand.js'
import hooks from '../../util/hooks.js'
import util from '../../util/index.js'
import projects from '../../util/projects.js'
import log from '../../util/log.js'

export default defineCommand({
  description: 'Update project properties: name, description, status, assignee, or replace body',
  options: z.object({
    name: z.string().optional().describe('New name'),
    description: z.string().optional().describe('New description'),
    status: z.string().optional().describe('New status'),
    assignee: z.string().optional().describe('New assignee'),
    body: z.string().optional().describe('Replace entire body/content (markdown)'),
  }),
  args: z.object({
    project: z.string().optional().describe('Project slug (defaults to current project from $PWD)'),
  }),
  handler: async ({ project, name, description, status: newStatus, assignee, body }) => {
    // Use current project from PWD if not specified
    const projectSlug = project || ctx.getProjectFromPwd()
    if (!projectSlug) {
      throw new Error('No project specified and not in a project directory')
    }

    const projectDir = projects.getProjectDir(projectSlug)
    const mainPath = util.join(projectDir, config.files.MAIN)

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

    if (Object.keys(updates).length === 0 && !body) {
      console.log('No updates provided')
      return
    }

    // Update frontmatter
    if (Object.keys(updates).length > 0) {
      await projects.updateProject(projectSlug, updates)

      // Log to log.tsv
      const changes = Object.entries(updates)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ')
      await log.append(projectDir, 'project', projectSlug, 'updated', changes)
    }

    // Replace body if provided
    if (body !== undefined) {
      await projects.updateBody(mainPath, body)
      await log.append(projectDir, 'project', projectSlug, 'updated', `body replaced (${body.length} chars)`)
    }

    // Run post-update hooks
    await hooks.runHooks(projectDir, 'post-update', {
      action: 'post-update',
      entityType: 'project',
    })

    console.log(`Project ${projectSlug} updated`)
  },
})
