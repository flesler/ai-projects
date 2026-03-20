import 'zod'
import { parser } from 'zod-opts'
import commandMap from './commands/index.js'
import commands from './util/commands.js'

async function main() {
  const args = process.argv.slice(2)
  const [noun, verb, ...rest] = args

  try {
    if (!noun) {
      console.error('Error: noun is required')
      console.log('Usage: aip <noun> <verb> [options]')
      console.log('Run with --help for more information')
      process.exit(1)
    }

    if (!verb) {
      console.error('Error: verb is required')
      console.log('Usage: aip <noun> <verb> [options]')
      console.log('Run with --help for more information')
      process.exit(1)
    }

    const command = commandMap[noun as keyof typeof commandMap]?.[verb as keyof typeof commandMap[keyof typeof commandMap]]

    if (!command) {
      console.error(`Error: unknown command '${noun} ${verb}'`)
      console.log('Run with --help for more information')
      process.exit(1)
    }

    const parsed = parser().name(`${noun} ${verb}`).options(commands.schemaToOptions(command.schema)).parse(rest)
    await command.handler(parsed as any)
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
