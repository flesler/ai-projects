import { z } from 'zod'
import fastGlob from 'fast-glob'
import defineCommand from '../../util/defineCommand.js'
import config from '../../util/config.js'
import env from '../../util/env.js'
import util from '../../util/index.js'

export default defineCommand({
  options: z.object({
    pattern: z.string().describe('Glob pattern to search for'),
    cwd: z.string().optional().describe('Working directory (defaults to TEAM_HOME/projects)'),
    absolute: z.boolean().optional().describe('Return absolute paths'),
  }),
  handler: async ({ pattern, cwd, absolute }) => {
    const searchCwd = cwd || util.join(env.TEAM_HOME, config.dirs.PROJECTS)
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
})
