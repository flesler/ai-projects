import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'

export default defineCommand({
  options: z.object({
    json: z.string().describe('JSON string to inspect/format'),
    compact: z.boolean().optional().describe('Output as single line (default: false)'),
  }),
  handler: async ({ json, compact }) => {
    try {
      const obj = JSON.parse(json)
      if (compact) {
        console.log(util.dump(obj))
      } else {
        console.log(util.inspect(obj))
      }
    } catch (err) {
      throw new Error(`Invalid JSON: ${util.errorMessage(err)}`, { cause: err })
    }
  },
})
