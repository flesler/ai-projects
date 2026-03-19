/**
 * aip task complete
 *
 * Mark a task as complete
 */

import { z } from 'zod'
import { defineCommand } from 'src/util/defineCommand.js'

export default defineCommand(
  z.object({
    project: z.string().describe('Project slug'),
    task: z.string().describe('Task name'),
  }),
  async ({ project, task }) => {
    console.log('Completing task:')
    console.log(`  Project: ${project}`)
    console.log(`  Task: ${task}`)
    console.log('\n[TODO: Implement task completion]')
  },
)
