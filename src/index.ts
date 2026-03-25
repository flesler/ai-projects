import commandMap from './commands/index.js'
import util from './util'
import type { CommandDef } from './util/defineCommand.js'

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception:', err)
  process.exit(1)
})

async function cli(args: string[]) {
  const [noun, verb, ...rest] = args
  try {
    if (!noun || !util.isKeyOf(noun, commandMap)) {
      await commandMap.help.usage.handler({})
      process.exit(1)
    }
    const verbs = commandMap[noun]
    if (!verb || !util.isKeyOf(verb, verbs)) {
      await commandMap.help.usage.handler({ name: noun })
      process.exit(1)
    }

    const command = verbs[verb] as CommandDef<any>
    if (!command) {
      console.error(`Error: unknown command '${noun} ${verb}'`)
      console.log('Run with --help for more information')
      process.exit(1)
    }

    await command.handler(command.parser.name(`${noun} ${verb}`).parse(rest))
  } catch (err) {
    console.error('Error:', util.errorMessage(err))
    process.exit(1)
  }
}

export default cli

export const commands = commandMap

// Run CLI if executed directly (not imported)
if (util.isMain()) {
  cli(process.argv.slice(2))
}
