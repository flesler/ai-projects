import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'

export default defineCommand({
  options: z.object({
    text: z.string().optional().describe('Text to convert to one line (reads from stdin if not provided)'),
  }),
  handler: async ({ text }) => {
    let inputText = text

    // Read from stdin if text not provided
    if (!inputText) {
      inputText = await new Promise<string>((resolve) => {
        let data = ''
        process.stdin.setEncoding('utf8')
        process.stdin.on('data', (chunk) => {
          data += chunk
        })
        process.stdin.on('end', () => resolve(data))
      })
    }

    const oneLined = util.oneLine(inputText)
    console.log(oneLined)
  },
})
