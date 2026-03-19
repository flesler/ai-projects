import { z } from 'zod'
import commands from 'src/util/commands.js'

export default commands.define(
  z.object({
    project: z.string().describe('Project slug'),
    name: z.string().describe('Task name'),
  }),
  async ({ project, name }) => {
    console.log('Creating task:')
    console.log(`  Project: ${project}`)
    console.log(`  Name: ${name}`)
    console.log('\n[TODO: Implement task creation]')
  },
)
