#!/usr/bin/env node
/**
 * Generate documentation for all CLI commands
 * Outputs to docs/aip.md
 */

import type { z } from 'zod'
import commandMap from '../src/commands/index.js'
import util from '../src/util/index.js'

const DEST = 'src/prompts/aip.md'

/** Extract option information from a zod schema */
const extractOptions = (schema: z.ZodObject<any>): Array<{ name: string; type: string; required: boolean; description?: string; defaultValue?: any }> => {
  const shape = schema.shape
  const options: Array<{ name: string; type: string; required: boolean; description?: string; defaultValue?: any }> = []

  for (const [name, zodType] of Object.entries(shape) as Array<[string, z.ZodType]>) {
    const def: any = zodType._def
    let type = 'unknown'
    let description: string | undefined
    let defaultValue: any

    // Extract type and default value
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

    // Extract description
    if (def.description) {
      description = def.description
    }

    // Check if required (not optional and no default)
    const required = def.typeName !== 'ZodOptional' && def.typeName !== 'ZodDefault'

    options.push({ name, type, required, description, defaultValue })
  }

  return options
}

/** Helper to extract type from nested zod types */
const extractType = (zodType: any): string => {
  const def = zodType._def
  if (def.typeName === 'ZodString') return 'string'
  if (def.typeName === 'ZodNumber') return 'number'
  if (def.typeName === 'ZodBoolean') return 'boolean'
  if (def.typeName === 'ZodEnum') return `enum: ${def.values.join(' | ')}`
  return 'unknown'
}

/** Generate markdown documentation for a command */
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

/** Main documentation generator */
const generateDocs = async () => {
  let md = 'Prepend `aip` to each command\n\n'

  // Sort nouns alphabetically
  const sortedNouns = Object.keys(commandMap).sort()

  for (const noun of sortedNouns) {
    const nounCommands = (commandMap as any)[noun]
    // Sort verbs alphabetically
    const sortedVerbs = Object.keys(nounCommands).sort()

    for (const verb of sortedVerbs) {
      const command = nounCommands[verb]
      md += generateCommandDoc(noun, verb, command)
    }
  }

  // Ensure docs directory exists
  await util.write(util.onRepo(DEST), md)

  console.log(`Documentation generated: ${DEST}`)
}

generateDocs().catch((err) => {
  console.error('Error generating documentation:', err)
  process.exit(1)
})
