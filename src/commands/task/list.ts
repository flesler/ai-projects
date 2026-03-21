import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'
import env from '../../util/env.js'

export default defineCommand({
  description: 'List tasks in a project, optionally filtered by status or assignee',
  options: z.object({
    project: z.string().optional().describe('Project slug (defaults to current project from $PWD)'),
    status: z.string().optional().describe('Filter by status'),
    assignee: z.string().optional().describe('Filter by assignee'),
  }),
  handler: async ({ project, status, assignee }) => {
    // Use current project from PWD if not specified
    const projectSlug = project || env.getProjectFromPwd()
    if (!projectSlug) {
      throw new Error('No project specified and not in a project directory')
    }

    const allTasks = await projects.listTasks(projectSlug)
    const rows: Array<{ slug: string; name: string; status?: string; assignee?: string; priority?: string }> = []

    for (const slug of allTasks) {
      const meta = await projects.getTask(projectSlug, slug)
      if (!meta) continue

      if (status && meta.status !== status) continue
      if (assignee && meta.assignee !== assignee) continue

      rows.push({
        slug,
        name: meta.name || slug,
        status: meta.status,
        assignee: meta.assignee,
        priority: meta.priority,
      })
    }

    if (rows.length === 0) {
      console.log('No tasks found')
      return
    }

    // Simple table output
    console.log(`Tasks in ${projectSlug}:`)
    console.log('---')
    for (const row of rows) {
      console.log(`${row.slug.padEnd(20)} ${row.name?.padEnd(30) || ''} ${row.status || ''} ${row.assignee || ''} ${row.priority || ''}`)
    }
  },
})
