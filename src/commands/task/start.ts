import { z } from 'zod'
import config from '../../util/config.js'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'
import update from './update.js'

export default defineCommand({
  description: 'Start a task: set status to in-progress, output cd and env vars, optionally print context',
  options: z.object({
    ingest: z.boolean().default(false).describe('Also output context ingestion for this task'),
  }),
  args: z.object({
    project: z.string().describe('Project slug'),
    task: z.string().describe('Task slug'),
  }),
  handler: async ({ project, task, ingest }) => {
    const taskDir = projects.getTaskDir(project, task)
    const projectDir = projects.getProjectDir(project)

    // Update status to in-progress if not already
    const currentMeta = await projects.getTask(project, task)
    if (currentMeta?.status !== 'in-progress') {
      await update.handler({ project, task, status: 'in-progress' })
    }

    // Output cd command and env export
    console.log(`cd "${taskDir}"`)
    console.log(`export CURRENT_PROJECT="${project}"`)
    console.log(`export CURRENT_TASK="${task}"`)

    // Optionally output cat commands for context ingestion
    if (ingest) {
      const projectMain = `${projectDir}/${config.files.MAIN}`
      const taskMain = `${taskDir}/${config.files.MAIN}`
      const taskStatus = `${taskDir}/${config.files.STATUS}`

      console.log(`# TASK_CONTEXT_START`)
      console.log(`echo "## Project: ${project}"`)
      console.log(`cat "${projectMain}"`)
      console.log(`echo ""`)
      console.log(`echo "## Task: ${task}"`)
      console.log(`cat "${taskMain}"`)
      console.log(`echo ""`)
      console.log(`echo "## Task Status Log"`)
      console.log(`cat "${taskStatus}"`)
      console.log(`# TASK_CONTEXT_END`)
    }
  },
})
