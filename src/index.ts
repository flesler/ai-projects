#!/usr/bin/env node
/**
 * AIP - AI Project Management CLI
 *
 * Usage:
 *   aip <noun> <verb> [options]
 *
 * Examples:
 *   aip project create --name "My Project" --description "Description"
 *   aip task create --project "my-project" --name "Task Name"
 *   aip task complete --project "my-project" --task "task-name"
 *   aip agent create --name "researcher" --description "Research agent"
 */

import { fileURLToPath } from 'url'
import 'zod'
import { parser } from 'zod-opts'
import util, { schemaToOptions } from './util/index.js'

async function main() {
  const args = process.argv.slice(2)
  const [noun, verb, ...rest] = args
  const filename = fileURLToPath(import.meta.url)
  const dirname = filename.slice(0, filename.lastIndexOf('/'))

  try {
    if (verb) {
      const commandModule = await import(`${dirname}/commands/${noun}/${verb}.js`)
      const command = commandModule.default
      const parsed = parser().name(`${noun} ${verb}`).options(schemaToOptions(command.schema)).parse(rest)
      await command.handler(parsed)
    } else if (noun) {
      const commandModule = await import(`${dirname}/commands/${noun}/index.js`)
      const command = commandModule.default
      const parsed = parser().name(noun).options(schemaToOptions(command.schema)).parse(rest)
      await command.handler(parsed)
    } else {
      return util.help()
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
