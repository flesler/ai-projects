import { z } from 'zod'
import defineCommand from '../../util/defineCommand'

export default defineCommand(
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
