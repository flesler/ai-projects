/**
 * aip task create
 *
 * Create a new task in a project
 */

import { z } from 'zod'
import { defineCommand } from 'src/util/defineCommand.js'

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
