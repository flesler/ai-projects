import { z } from 'zod'
import fastGlob from 'fast-glob'
import defineCommand from '../../util/defineCommand.js'
import env from '../../util/env.js'

export default defineCommand(
  z.object({
    pattern: z.string().describe('Glob pattern to search for'),
    cwd: z.string().optional().describe('Working directory (defaults to PROJECTS_HOME)'),
    absolute: z.boolean().optional().describe('Return absolute paths'),
  }),
  async ({ pattern, cwd, absolute }) => {
    const searchCwd = cwd || env.PROJECTS_HOME
    const results = await fastGlob(pattern, {
      cwd: searchCwd,
      absolute: absolute,
    })

    if (results.length === 0) {
      console.log('No files found')
      return
    }

    for (const file of results) {
      console.log(file)
    }
  },
)
