import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import config from '../../util/config.js'
import env from '../../util/env.js'
import util from '../../util/index.js'

export default defineCommand({
  description: 'Read a skill\'s SKILL.md file into the console for agent context',
  options: z.object({}),
  args: z.object({ name: z.string().describe('Skill name (directory name)') }),
  handler: async ({ name }) => {
    const skillDir = util.join(env.TEAM_HOME, config.dirs.SKILLS, name)
    const skillFile = util.join(skillDir, config.files.SKILL)

    const exists = await util.fileExists(skillFile)
    if (!exists) {
      throw new Error(`Skill not found: ${name}\nExpected at: ${skillFile}`)
    }

    const content = await util.read(skillFile)
    console.log(content)
  },
})
