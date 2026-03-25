import { z } from 'zod'
import config from '../../util/config'
import defineCommand from '../../util/defineCommand.js'
import env from '../../util/env.js'
import util from '../../util/index.js'

export default defineCommand({
  description: 'Start an agent: read SOUL.md and AGENTS.md content',
  options: z.object({}),
  args: z.object({ name: z.string().describe('Agent name (directory name)') }),
  handler: async ({ name }) => {
    // Look for agent in tmp/hermes/agents/
    const agentDir = util.join(env.AIP_HOME, config.dirs.AGENTS, name)
    const mainFile = util.join(agentDir, config.files.MAIN)
    const soulFile = util.join(agentDir, 'SOUL.md')

    const exists = await util.fileExists(mainFile)
    if (!exists) {
      throw new Error(`Agent not found: ${name}\nExpected at: ${mainFile}`)
    }

    // Output agent context
    const paths = [soulFile, mainFile]
    await util.logFiles(...paths)
  },
})
