import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'
import type { TaskStatus } from '../../util/projects.js'
import projects, { ACTIVE_TASK_STATUSES, ALL_TASK_STATUSES } from '../../util/projects.js'

export default defineCommand({
  description: 'List tasks, optionally filtered by project, status, assignee, or search query',
  options: z.object({
    project: z.string().optional().describe('Project slug (searches all projects if not provided)'),
    statuses: z.array(z.string()).default([]).describe('Filter by statuses (multiple allowed)'),
    assignee: z.string().optional().describe('Filter by assignee'),
    all: z.boolean().default(false).describe('Include all tasks (including done/blocked)'),
    search: z.string().optional().describe('Search query (matches task slug, case-insensitive, multi-part AND, any order)'),
  }),
  handler: async ({ project, statuses, assignee, all, search }) => {
    // Validate statuses if provided
    if (statuses && statuses.length > 0) {
      for (const status of statuses) {
        if (!ALL_TASK_STATUSES.includes(status as TaskStatus)) {
          throw new Error(`Invalid status: ${status}. Valid values: ${ALL_TASK_STATUSES.join(', ')}`)
        }
      }
    }

    let allowedStatuses: readonly string[]
    if (statuses && statuses.length > 0) {
      allowedStatuses = statuses
    } else if (all) {
      allowedStatuses = ALL_TASK_STATUSES
    } else {
      allowedStatuses = ACTIVE_TASK_STATUSES
    }

    const projectSlugs = project ? [project] : await projects.listProjects()
    const tasksByProject: Record<string, TaskRow[]> = {}

    await util.promiseEach(projectSlugs, async (projectSlug) => {
      const allTasks = await projects.listTasks(projectSlug)
      const rows: TaskRow[] = []

      await util.promiseEach(allTasks, async (slug) => {
        const meta = await projects.getTask(projectSlug, slug)
        if (!meta) return
        if (allowedStatuses.length > 0 && !allowedStatuses.includes(meta.status || '')) return
        if (assignee && meta.assignee !== assignee) return
        if (!util.matchesSearch(slug, search)) return

        rows.push({ slug, description: meta.description })
      })

      if (rows.length > 0) {
        tasksByProject[projectSlug] = rows.sort((a, b) => a.slug.localeCompare(b.slug))
      }
    })

    const projectNames = Object.keys(tasksByProject).sort()
    if (projectNames.length === 0) {
      return console.log('No tasks found')
    }

    for (const projectSlug of projectNames) {
      console.log(`${projectSlug}:`)
      for (const row of tasksByProject[projectSlug]) {
        console.log(`- ${row.slug}: ${row.description || ''}`)
      }
    }
  },
})

interface TaskRow {
  slug: string
  description?: string
}
