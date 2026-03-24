import _ from 'lodash'
import pkg from '../package.json'
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

async function main(args: string[]) {
  const [noun, verb, ...rest] = args
  const prefix = `${pkg.name} ${pkg.version} -`

  try {
    if (!noun || !util.isKeyOf(noun, commandMap)) {
      console.log(prefix, 'Usage: aip <noun> <verb> [options]')
      console.log(dump().map(line => `-> ${line}`).join('\n'))
      process.exit(1)
    }
    const verbs = commandMap[noun]
    if (!verb || !util.isKeyOf(verb, verbs)) {
      console.log(prefix, `Usage: aip ${dump(noun)[0]} [options]`)
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

export default main

function dump(noun?: string) {
  const data = noun ? _.pick(commandMap, noun) : commandMap
  const rows: string[] = []
  for (const [noun, verbs] of util.entriesOf(data)) {
    const vals = Object.keys(verbs!).join('|')
    rows.push(`${noun} {${vals}}`)
  }
  return rows
}

// Run CLI if executed directly (not imported)
if (util.isMain()) {
  main(process.argv.slice(2))
}
