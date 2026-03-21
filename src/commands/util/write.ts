import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'

export default defineCommand({
  options: z.object({
    file: z.string().describe('File to write to'),
    content: z.string().optional().describe('Content to write (reads from stdin if not provided)'),
  }),
  handler: async ({ file, content }) => {
    let writeContent = content

    // Read from stdin if content not provided
    if (!writeContent) {
      writeContent = await new Promise<string>((resolve) => {
        let data = ''
        process.stdin.setEncoding('utf8')
        process.stdin.on('data', (chunk) => {
          data += chunk
        })
        process.stdin.on('end', () => resolve(data))
      })
    }

    await util.write(file, writeContent)
    console.log(`Written to ${file}`)
  },
})
