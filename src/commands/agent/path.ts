import { z } from 'zod'
import config from '../../util/config'
import defineCommand from '../../util/defineCommand.js'
import env from '../../util/env.js'
import util from '../../util/index.js'

export default defineCommand({
  description: 'Output agent directory path (for cd)',
  options: z.object({}),
  args: z.object({ name: z.string().describe('Agent name (directory name)') }),
  handler: async ({ name }) => {
    const agentDir = util.join(env.AIP_HOME, config.dirs.AGENTS, name)
    const mainFile = util.join(agentDir, config.files.MAIN)

    const exists = await util.fileExists(mainFile)
    if (!exists) {
      throw new Error(`Agent not found: ${name}\nExpected at: ${mainFile}`)
    }

    console.log(agentDir)
  },
})
