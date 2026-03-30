import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import type { TaskStatus } from '../../util/projects.js'
import projects, { ACTIVE_TASK_STATUSES, ALL_TASK_STATUSES } from '../../util/projects.js'

export default defineCommand({
  description: 'List tasks, optionally filtered by project, status, or assignee',
  options: z.object({
    project: z.string().optional().describe('Project slug (searches all projects if not provided)'),
    statuses: z.array(z.string()).default([]).describe('Filter by statuses (multiple allowed)'),
    assignee: z.string().optional().describe('Filter by assignee'),
    all: z.boolean().default(false).describe('Include all tasks (including done/blocked)'),
  }),
  handler: async ({ project, statuses, assignee, all }) => {
    // Validate statuses if provided
    if (statuses && statuses.length > 0) {
      for (const status of statuses) {
        if (!ALL_TASK_STATUSES.includes(status as TaskStatus)) {
          throw new Error(`Invalid status: ${status}. Valid values: ${ALL_TASK_STATUSES.join(', ')}`)
        }
      }
    }

    // Determine which statuses to include
    let allowedStatuses: readonly string[]
    if (statuses && statuses.length > 0) {
      allowedStatuses = statuses
    } else if (all) {
      allowedStatuses = ALL_TASK_STATUSES
    } else {
      allowedStatuses = ACTIVE_TASK_STATUSES
    }

    // Get projects to search
    const projectSlugs = project ? [project] : await projects.listProjects()

    // Collect tasks grouped by project
    const tasksByProject: Record<string, Array<{ slug: string; name: string; status?: string; assignee?: string }>> = {}

    for (const projectSlug of projectSlugs) {
      const allTasks = await projects.listTasks(projectSlug)
      const rows: Array<{ slug: string; name: string; status?: string; assignee?: string }> = []

      for (const slug of allTasks) {
        const meta = await projects.getTask(projectSlug, slug)
        if (!meta) continue

        if (allowedStatuses.length > 0 && !allowedStatuses.includes(meta.status || '')) continue
        if (assignee && meta.assignee !== assignee) continue

        rows.push({
          slug,
          name: meta.name || slug,
          status: meta.status,
          assignee: meta.assignee,
        })
      }

      if (rows.length > 0) {
        tasksByProject[projectSlug] = rows.sort((a, b) => a.slug.localeCompare(b.slug))
      }
    }

    // Output grouped by project
    const projectNames = Object.keys(tasksByProject).sort()
    if (projectNames.length === 0) {
      console.log('No tasks found')
      return
    }

    for (const projectSlug of projectNames) {
      console.log(`\n${projectSlug}:`)
      console.log('---')
      for (const row of tasksByProject[projectSlug]) {
        console.log(`${row.slug.padEnd(20)} ${row.name?.padEnd(30) || ''} ${row.status || ''} ${row.assignee || ''}`)
      }
    }
  },
})
