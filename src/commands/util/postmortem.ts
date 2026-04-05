import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'
import log from '../../util/log.js'

export default defineCommand({
  description: 'Post-mortem analysis for a completed task',
  options: z.object({}),
  args: z.object({
    project: z.string().describe('Project slug'),
    task: z.string().describe('Task slug'),
  }),
  handler: async ({ project, task }) => {
    const taskDir = projects.getTaskDir(project, task)

    // Read task metadata
    const meta = await projects.getTask(project, task)
    const taskLog = await log.read(taskDir)

    // Count log entries (rough proxy for complexity)
    const logEntries = taskLog.split('\n').filter(l => l.trim()).length

    // Analyze patterns
    const suggestions: string[] = []
    const taskName = meta?.name || task

    if (logEntries > 5) {
      suggestions.push('High log entry count - consider breaking into smaller tasks')
    }

    if (taskName.toLowerCase().includes('implement')) {
      suggestions.push('Implementation task - check if similar patterns exist to reuse')
    }

    if (taskName.toLowerCase().includes('create') && taskName.toLowerCase().includes('command')) {
      suggestions.push('Command creation - check existing command patterns in src/commands/')
    }

    // Output analysis
    console.log(`\n=== Post-Mortem Analysis ===`)
    console.log(`Project: ${project}`)
    console.log(`Task: ${task}`)
    console.log(`Name: ${taskName}`)
    console.log(`Status: ${meta?.status || 'unknown'}`)
    console.log(`Log entries: ${logEntries}`)

    if (suggestions.length > 0) {
      console.log(`\nSuggestions:`)
      suggestions.forEach(s => console.log(`  - ${s}`))
    } else {
      console.log(`\nNo specific suggestions - task looks well-scoped`)
    }

    console.log(`\n=== End Post-Mortem ===\n`)
  },
})
