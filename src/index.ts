import pkg from '../package.json'
import commandMap from './commands/index.js'
import util from './util'
import type { CommandDef } from './util/defineCommand.js'
import { logError } from './util/logError.js'

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
  if (noun === '--version' || noun === '-v') {
    console.log(pkg.version)
    process.exit(0)
  }
  try {
    let isHelp = !noun || noun === '--help' || noun === '-h'
    if (isHelp || !util.isKeyOf(noun, commandMap)) {
      await commandMap.help.usage.handler({})
      if (!isHelp) {
        logError(args, `Unknown command: ${noun}`)
      }
      process.exit(1)
    }
    const verbs = commandMap[noun]
    isHelp = !verb || verb === '--help' || verb === '-h'
    if (isHelp || !util.isKeyOf(verb, verbs)) {
      if (!isHelp) {
        logError(args, `Unknown command: ${noun} ${verb}`)
      }
      await commandMap.help.usage.handler({ name: noun })
      process.exit(1)
    }

    const command = verbs[verb] as CommandDef<any>
    command.parser._internalHandler((result) => {
      if (result.type === 'error') {
        logError(args, result.error || 'parse error')
      }
    })
    await command.handler(command.parser.name(`${noun} ${verb}`).parse(rest))
  } catch (err) {
    console.error('Error:', util.errorMessage(err))
    logError(args, err)
    process.exit(1)
  }
}

export default cli

export const commands = commandMap

// Run CLI if executed directly (not imported)
if (util.isMain()) {
  cli(process.argv.slice(2))
}
