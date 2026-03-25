import { z } from 'zod'
import pkg from '../../../package.json'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'

export default defineCommand({
  description: 'Print compact CLI usage (all nouns, or one noun if name is given)',
  options: z.object({}),
  args: z.object({
    name: z.string().optional().describe('Noun (e.g. task) to list verbs for'),
  }),
  handler: async ({ name }) => {
    const { default: commandMap } = await import('../index.js')
    const prefix = `${pkg.name} ${pkg.version} -`
    const lines = util.dumpCommandMapLines(commandMap as Record<string, Record<string, unknown>>, name)
    if (!name) {
      console.log(prefix, 'Usage: aip <noun> <verb> [options]')
      console.log(lines.map(line => `-> ${line}`).join('\n'))
    } else {
      const line = lines[0] ?? `${name} {?}`
      console.log(prefix, `Usage: aip ${line} [options]`)
    }
  },
})
