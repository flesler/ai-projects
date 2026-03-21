import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'

export default defineCommand({
  options: z.object({}),
  handler: async () => {
    const allAgents = await projects.listAgents()
    const rows: Array<{ slug: string; name: string; status?: string; description?: string }> = []

    for (const slug of allAgents) {
      const meta = await projects.getAgent(slug)
      if (!meta) continue

      rows.push({
        slug,
        name: meta.name || slug,
        status: meta.status,
        description: meta.description,
      })
    }

    if (rows.length === 0) {
      console.log('No agents found')
      return
    }

    // Simple table output
    console.log('Agents:')
    console.log('---')
    for (const row of rows) {
      console.log(`${row.slug.padEnd(20)} ${row.name?.padEnd(30) || ''} ${row.status || ''} ${row.description || ''}`)
    }
  },
})
