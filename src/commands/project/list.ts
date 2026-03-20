import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'

export default defineCommand(
  z.object({
    status: z.string().optional().describe('Filter by status'),
  }),
  async ({ status }) => {
    const allProjects = await projects.listProjects()
    const rows: Array<{ slug: string; name: string; status?: string; assignee?: string }> = []

    for (const slug of allProjects) {
      const meta = await projects.getProject(slug)
      if (!meta) continue

      if (status && meta.status !== status) continue

      rows.push({
        slug,
        name: meta.name || slug,
        status: meta.status,
        assignee: meta.assignee,
      })
    }

    if (rows.length === 0) {
      console.log('No projects found')
      return
    }

    // Simple table output
    console.log('Projects:')
    console.log('---')
    for (const row of rows) {
      console.log(`${row.slug.padEnd(20)} ${row.name?.padEnd(30) || ''} ${row.status || ''} ${row.assignee || ''}`)
    }
  },
)
