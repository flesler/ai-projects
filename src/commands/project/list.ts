import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'

export default defineCommand({
  description: 'List all projects, optionally filtered by status',
  options: z.object({
    status: z.string().optional().describe('Filter by status'),
  }),
  handler: async ({ status }) => {
    const allProjects = await projects.listProjects()
    const rows: Array<{ slug: string; status?: string; assignee?: string }> = []

    for (const slug of allProjects) {
      const meta = await projects.getProject(slug)
      if (!meta) continue

      if (status && meta.status !== status) continue

      rows.push({ slug, status: meta.status, assignee: meta.assignee })
    }

    if (rows.length === 0) {
      return console.log('No projects found')
    }

    // Simple table output
    console.log('Projects:')
    for (const row of rows) {
      console.log(`- ${row.slug}: ${row.status || ''} ${row.assignee || ''}`)
    }
  },
})
