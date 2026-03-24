import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'
import projects from '../../util/projects.js'

export default defineCommand({
  options: z.object({
    description: z.string().describe('Agent description'),
    status: z.string().default('active').describe('Initial status'),
  }),
  args: z.object({
    name: z.string().describe('Agent name'),
  }),
  handler: async ({ name, description, status }) => {
    const slug = util.slugify(name)

    // Create agent
    await projects.createAgent(slug, {
      name,
      description,
      status,
      created: new Date().toISOString(),
    })

    console.log(`Agent created: ${slug}`)
    console.log(`  Path: ${projects.getAgentDir(slug)}`)
  },
})
