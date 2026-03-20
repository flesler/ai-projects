/** Command utilities */

import type { z, ZodObject } from 'zod'
import type { Parser } from 'zod-opts'
import { parser as createParser } from 'zod-opts'

/** Command definition with schema and handler */
export interface CommandDef<T extends ZodObject<any>> {
  schema: T
  parser: Parser
  handler: (params: z.infer<T>) => Promise<void>
  cli: (args: string[]) => Promise<void>
}

/** Helper to define a command with schema and handler */
export default function defineCommand<T extends ZodObject<any>>(schema: T, handler: (params: z.infer<T>) => Promise<void>): CommandDef<T> {
  const shape = schema.shape
  const options: Record<string, { type: any }> = {}
  for (const [key, value] of Object.entries(shape)) {
    options[key] = { type: value }
  }
  const parser = createParser().options(options)
  return { schema, parser, handler, cli: args => handler(parser.parse(args)) }
}
