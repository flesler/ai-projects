import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'

export default defineCommand({
  options: z.object({}),
  handler: async () => {
    const allAgents = await projects.listAgents()
    const rows: Array<{ slug: string; description?: string }> = []

    for (const slug of allAgents) {
      const meta = await projects.getAgent(slug)
      if (!meta) continue

      rows.push({ slug, description: meta.description })
    }

    if (rows.length === 0) {
      return console.log('No agents found')
    }

    console.log('Agents:')
    for (const row of rows) {
      console.log(`- ${row.slug}: ${row.description || ''}`)
    }
  },
})
