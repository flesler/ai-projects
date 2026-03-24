import { z } from 'zod'
import config from '../../util/config'
import defineCommand from '../../util/defineCommand.js'
import env from '../../util/env.js'
import util from '../../util/index.js'

export default defineCommand({
  description: 'Start an agent: read SOUL.md and AGENTS.md, export CURRENT_AGENT env var',
  options: z.object({}),
  args: z.object({ name: z.string().describe('Agent name (directory name)') }),
  handler: async ({ name }) => {
    // Look for agent in tmp/hermes/agents/
    const agentDir = util.join(env.TEAM_HOME, config.dirs.AGENTS, name)
    const mainFile = util.join(agentDir, config.files.MAIN)
    const soulFile = util.join(agentDir, 'SOUL.md')

    const exists = await util.fileExists(mainFile)
    if (!exists) {
      throw new Error(`Agent not found: ${name}\nExpected at: ${mainFile}`)
    }

    // Output environment export
    console.log(`export CURRENT_AGENT="${name}"`)

    // Output cat command for soul context (if exists)
    const soulExists = await util.fileExists(soulFile)
    if (soulExists) {
      console.log(`# SOUL_CONTEXT_START`)
      console.log(`cat "${soulFile}"`)
      console.log(`# SOUL_CONTEXT_END`)
    }

    // Output cat command for agent context
    console.log(`# AGENT_CONTEXT_START`)
    console.log(`cat "${mainFile}"`)
    console.log(`# AGENT_CONTEXT_END`)
  },
})
