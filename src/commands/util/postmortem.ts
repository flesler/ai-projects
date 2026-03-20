import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'
import status from '../../util/status.js'

export default defineCommand(
  z.object({
    project: z.string().describe('Project slug'),
    task: z.string().describe('Task slug'),
  }),
  async ({ project, task }) => {
    const taskDir = projects.getTaskDir(project, task)

    // Read task metadata
    const meta = await projects.getTask(project, task)
    const statusLog = await status.readStatus(taskDir)

    // Count status updates (rough proxy for complexity)
    const statusUpdates = statusLog.split('\n').filter(l => l.startsWith('[')).length

    // Analyze patterns
    const suggestions: string[] = []
    const taskName = meta?.name || task

    if (statusUpdates > 5) {
      suggestions.push('High status update count - consider breaking into smaller tasks')
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
    console.log(`Priority: ${meta?.priority || 'none'}`)
    console.log(`Status updates: ${statusUpdates}`)

    if (suggestions.length > 0) {
      console.log(`\nSuggestions:`)
      suggestions.forEach(s => console.log(`  - ${s}`))
    } else {
      console.log(`\nNo specific suggestions - task looks well-scoped`)
    }

    console.log(`\n=== End Post-Mortem ===\n`)
  },
)
