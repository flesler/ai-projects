import 'zod'
import { parser } from 'zod-opts'
import { schemaToOptions } from './util/index.js'

async function main() {
  const args = process.argv.slice(2)
  const [noun, verb, ...rest] = args

  try {
    if (verb) {
      const commandModule = await import(`./commands/${noun}/${verb}.js`)
      const command = commandModule.default
      const parsed = parser().name(`${noun} ${verb}`).options(schemaToOptions(command.schema)).parse(rest)
      await command.handler(parsed)
    } else if (noun) {
      const commandModule = await import(`./commands/${noun}/index.js`)
      const command = commandModule.default
      const parsed = parser().name(noun).options(schemaToOptions(command.schema)).parse(rest)
      await command.handler(parsed)
    } else {
      console.log('Usage: aip <noun> [verb] [options]')
      console.log('Run with --help for more information')
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
