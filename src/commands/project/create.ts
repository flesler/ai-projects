import { z } from 'zod'
import commands from 'src/util/commands.js'
import util from 'src/util/index.js'

export default commands.define(
  z.object({
    name: z.string().describe('Project name'),
    description: z.string().describe('Project description'),
  }),
  async ({ name, description }) => {
    const slug = util.slugify(name)

    console.log('Creating project:')
    console.log(`  Name: ${name}`)
    console.log(`  Slug: ${slug}`)
    console.log(`  Description: ${description}`)
    console.log('\n[TODO: Implement project creation]')
  },
)
