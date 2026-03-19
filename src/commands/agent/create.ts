/**
 * aip agent create
 *
 * Create a new agent profile
 */

import { z } from 'zod'
import { defineCommand } from 'src/util/defineCommand.js'

export default defineCommand(
  z.object({
    name: z.string().describe('Agent name'),
    description: z.string().describe('Agent description'),
  }),
  async ({ name, description }) => {
    console.log('Creating agent:')
    console.log(`  Name: ${name}`)
    console.log(`  Description: ${description}`)
    console.log('\n[TODO: Implement agent creation]')
  },
)
