#!/usr/bin/env node
/**
 * Generate documentation for all CLI commands
 * Outputs to docs/aip.md
 */

import type { z } from 'zod'
import util, { namespaces } from 'src/util/index.js'

/** Extract option information from a zod schema */
const extractOptions = (schema: z.ZodObject<any>): Array<{ name: string; type: string; required: boolean; description?: string }> => {
  const shape = schema.shape
  const options: Array<{ name: string; type: string; required: boolean; description?: string }> = []

  for (const [name, zodType] of Object.entries(shape) as Array<[string, z.ZodType]>) {
    const def: any = zodType._def
    let type = 'unknown'
    let description: string | undefined

    // Extract type
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
    }

    // Extract description
    if (def.description) {
      description = def.description
    }

    // Check if required (not optional and no default)
    const required = def.typeName !== 'ZodOptional' && def.typeName !== 'ZodDefault'

    options.push({ name, type, required, description })
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
  const options = extractOptions(command.schema)

  let md = `### \`${noun} ${verb}\`\n\n`

  if (options.length === 0) {
    md += 'No options.\n\n'
  } else {
    md += '| Option | Type | Required | Description |\n'
    md += '|--------|------|----------|-------------|\n'

    for (const opt of options) {
      const required = opt.required ? 'Yes' : 'No'
      const desc = opt.description || '-'
      md += `| \`--${opt.name}\` | ${opt.type} | ${required} | ${desc} |\n`
    }
    md += '\n'
  }

  return md
}

/** Generate noun-level command documentation */
const generateNounDoc = async (noun: string, command: any): Promise<string> => {
  let md = `### \`${noun}\`\n\n`
  md += 'Shows available commands for this noun.\n\n'

  if (command.schema) {
    const options = extractOptions(command.schema)
    if (options.length > 0) {
      md += '| Option | Type | Required | Description |\n'
      md += '|--------|------|----------|-------------|\n'

      for (const opt of options) {
        const required = opt.required ? 'Yes' : 'No'
        const desc = opt.description || '-'
        md += `| \`--${opt.name}\` | ${opt.type} | ${required} | ${desc} |\n`
      }
      md += '\n'
    }
  }

  return md
}

/** Main documentation generator */
const generateDocs = async () => {
  const ns = await namespaces()

  let md = '# AIP CLI Reference\n\n'
  md += 'AI Project Management CLI - Command reference documentation.\n\n'
  md += '## Usage\n\n'
  md += '```\n'
  md += 'aip <noun> <verb> [options]\n'
  md += '```\n\n'
  md += '## Commands\n\n'

  // Sort nouns alphabetically
  const sortedNouns = Object.keys(ns).sort()

  for (const noun of sortedNouns) {
    const commands = ns[noun]
    md += `## ${noun.charAt(0).toUpperCase() + noun.slice(1)}\n\n`

    // Try to load noun-level command (index.ts)
    try {
      const nounModule = await import(`file://${process.cwd()}/src/commands/${noun}/index.ts`)
      if (nounModule.default) {
        md += await generateNounDoc(noun, nounModule.default)
      }
    } catch {
      // No noun-level command, that's ok
    }

    // Sort verbs alphabetically
    const sortedCommands = commands.sort((a, b) => a.verb.localeCompare(b.verb))

    for (const { verb, command } of sortedCommands) {
      md += generateCommandDoc(noun, verb, command)
    }
  }

  // Ensure docs directory exists
  util.ensureDir('docs')

  // Write to docs/aip.md
  util.writeFile('docs/aip.md', md)

  console.log('Documentation generated: docs/aip.md')
}

generateDocs().catch((err) => {
  console.error('Error generating documentation:', err)
  process.exit(1)
})
