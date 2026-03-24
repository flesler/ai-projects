import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'

export default defineCommand({
  description: 'Read one or more prompts into the console',
  options: z.object({}),
  args: z.object({ names: z.string().describe('Prompt names separated by comma') }),
  handler: async ({ names }) => {
    const contents = await Promise.all(names.split(',').map(name => util.readRepo('src', 'prompts', `${name}.md`)))
    console.log(contents.join('\n\n---\n\n'))
  },
})
