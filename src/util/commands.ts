/** Command utilities */

import fastGlob from 'fast-glob'
import type { z, ZodObject } from 'zod'
import util from './index.js'

/** Command definition with schema and handler */
export interface CommandDef<T extends ZodObject<any>> {
  schema: T
  handler: (params: z.infer<T>) => Promise<void>
}

const commands = {
  /** Helper to define a command with schema and handler */
  define: <T extends ZodObject<any>>(schema: T, handler: (params: z.infer<T>) => Promise<void>): CommandDef<T> => {
    return { schema, handler }
  },

  /** Convert a zod object schema to zod-opts options format */
  schemaToOptions: <T extends ZodObject<any>>(schema: T): Record<string, { type: any }> => {
    const shape = schema.shape
    const options: Record<string, { type: any }> = {}

    for (const [key, value] of Object.entries(shape)) {
      options[key] = { type: value }
    }

    return options
  },

  /** Load all commands organized by noun and verb */
  load: async () => {
    // Find all command files (excluding test files)
    const commandFiles = await fastGlob('src/commands/*/*.ts', {
      cwd: process.cwd(),
      ignore: ['**/*.test.ts'],
    })

    // Group commands by noun and verb
    const result: Record<string, Record<string, CommandDef<any>>> = {}

    // Import all commands in parallel
    await util.promiseMap(commandFiles, async (file) => {
      // Split by forward slash since glob always returns forward slashes
      const parts = file.split('/')
      const noun = parts[2] // src/commands/[noun]/[verb].ts
      const verbFile = parts[3] // [verb].ts
      const verb = verbFile.replace('.ts', '')

      // Dynamically import the command
      const commandModule = await import(`file://${process.cwd()}/${file}`)
      const command = commandModule.default

      if (command && command.schema && command.handler) {
        if (!result[noun]) {
          result[noun] = {}
        }
        result[noun][verb] = command
      }
    })

    return result
  },
}

export default commands
