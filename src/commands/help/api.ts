/** Generate documentation for all CLI commands (printed to console) */

import { z, type ZodType } from 'zod'
import defineCommand from '../../util/defineCommand.js'

/** Extract option information from a zod schema */
const extractOptions = (schema: z.ZodObject<any>): Array<{ name: string; type: string; required: boolean; description?: string; defaultValue?: any }> => {
  const shape = schema.shape
  const options: Array<{ name: string; type: string; required: boolean; description?: string; defaultValue?: any }> = []

  for (const [name, zodType] of Object.entries(shape) as Array<[string, ZodType]>) {
    const def: any = zodType._def
    let type = 'unknown'
    let description: string | undefined
    let defaultValue: any

    if (def.typeName === 'ZodString') {
      type = 'string'
    } else if (def.typeName === 'ZodNumber') {
      type = 'number'
    } else if (def.typeName === 'ZodBoolean') {
      type = 'boolean'
    } else if (def.typeName === 'ZodEnum') {
      type = `enum: ${def.values.join(' | ')}`
    } else if (def.typeName === 'ZodOptional') {
      type = extractType(def.innerType)
    } else if (def.typeName === 'ZodDefault') {
      type = extractType(def.innerType)
      defaultValue = def.defaultValue()
    }

    if (def.description) {
      description = def.description
    }

    const required = def.typeName !== 'ZodOptional' && def.typeName !== 'ZodDefault'

    options.push({ name, type, required, description, defaultValue })
  }

  return options
}

const extractType = (zodType: any): string => {
  const def = zodType._def
  if (def.typeName === 'ZodString') return 'string'
  if (def.typeName === 'ZodNumber') return 'number'
  if (def.typeName === 'ZodBoolean') return 'boolean'
  if (def.typeName === 'ZodEnum') return `enum: ${def.values.join(' | ')}`
  return 'unknown'
}

const generateCommandDoc = (noun: string, verb: string, command: any): string => {
  const opts = extractOptions(command.options)
  const args = command.args ? extractOptions(command.args) : []
  const schemaDescription = command.description

  let md = `\`${noun} ${verb}\``

  if (schemaDescription) {
    md += `: ${schemaDescription}`
  }
  md += '\n'

  const allOptions = opts.length > 0 || args.length > 0
  if (allOptions) {
    const parts: string[] = []
    for (const opt of args) {
      const name = opt.required ? `<${opt.name}>` : `[${opt.name}]`
      let desc = opt.description || ''
      if (opt.defaultValue !== undefined) {
        desc += desc ? ` (default: ${opt.defaultValue})` : `(default: ${opt.defaultValue})`
      }
      parts.push(`· ${name}${desc ? ': ' + desc : ''}`)
    }
    for (const opt of opts) {
      let desc = opt.description || ''
      if (opt.defaultValue !== undefined) {
        desc += desc ? ` (default: ${opt.defaultValue})` : `(default: ${opt.defaultValue})`
      }
      parts.push(`· --${opt.name}${desc ? ': ' + desc : ''}`)
    }
    md += parts.join('  \n') + '\n'
  }

  md += '\n'

  return md
}

export default defineCommand({
  description: 'Print generated CLI reference from command schemas',
  options: z.object({}),
  handler: async () => {
    const { default: commandMap } = await import('../index.js')
    let md = 'Prepend `aip` to each command\n\n'

    const sortedNouns = Object.keys(commandMap).sort()

    for (const noun of sortedNouns) {
      const nounCommands = (commandMap as any)[noun]
      const sortedVerbs = Object.keys(nounCommands).sort()

      for (const verb of sortedVerbs) {
        const command = nounCommands[verb]
        md += generateCommandDoc(noun, verb, command)
      }
    }

    console.log(md)
  },
})
