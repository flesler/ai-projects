import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'
import projects from '../../util/projects.js'

export default defineCommand({
  options: z.object({
    name: z.string().describe('Agent name'),
    description: z.string().describe('Agent description'),
    status: z.string().optional().describe('Initial status (default: active)'),
  }),
  handler: async ({ name, description, status: initialStatus }) => {
    const slug = util.slugify(name)

    // Create agent
    await projects.createAgent(slug, {
      name,
      description,
      status: initialStatus || 'active',
      created: new Date().toISOString(),
    })

    console.log(`Agent created: ${slug}`)
    console.log(`  Path: ${projects.getAgentDir(slug)}`)
  },
})
