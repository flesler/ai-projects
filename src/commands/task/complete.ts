import { z } from 'zod'
import commands from '../../util/commands.js'

export default commands.define(
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
