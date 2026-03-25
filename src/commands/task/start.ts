import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'
import update from './update.js'

export default defineCommand({
  description: 'Start a task: set status to in-progress, optionally print context',
  options: z.object({
    ingest: z.boolean().default(false).describe('Also output context for this task'),
  }),
  args: z.object({
    project: z.string().describe('Project slug'),
    task: z.string().describe('Task slug'),
  }),
  handler: async ({ project, task, ingest }) => {
    // Update status to in-progress if not already
    const meta = await projects.getTask(project, task)
    if (meta?.status !== 'in-progress') {
      await update.handler({ project, task, status: 'in-progress' })
    }

    // Optionally output context for ingestion
    if (ingest) {
      await projects.ingestTask(project, task)
    }
  },
})
