/** Command utilities */

import { z, type ZodObject } from 'zod'
import type { Parser } from 'zod-opts'
import { parser as createParser } from 'zod-opts'

/** Command definition */
export interface CommandDef<T extends ZodObject<any> = ZodObject<any>> {
  description?: string
  options: T
  args?: ZodObject<any>
  parser: Parser
  handler: (params: any) => Promise<void>
  cli: (args: string[]) => Promise<void>
}

/** Config for defineCommand */
export interface DefineCommandConfig {
  description?: string
  options?: ZodObject<any>
  args?: ZodObject<any>
  handler: (params: any) => Promise<void>
}

/** Helper to define a command */
export default function defineCommand(config: DefineCommandConfig): CommandDef<any> {
  const { description, options: optionsSchema = z.object({}), args: argsSchema, handler } = config

  const optionsShape = optionsSchema.shape
  const opts: Record<string, { type: any }> = {}
  for (const [key, value] of Object.entries(optionsShape)) {
    opts[key] = { type: value }
  }

  let p = createParser().options(opts)
  if (argsSchema) {
    const argsShape = argsSchema.shape
    const positionalArgs = Object.entries(argsShape).map(([name, type]) => ({ name, type }))
    if (positionalArgs.length > 0) {
      p = p.args(positionalArgs as [{ name: string; type: any }, ...{ name: string; type: any }[]])
    }
  }

  if (description) {
    p = p.description(description)
  }

  return {
    description,
    options: optionsSchema,
    args: argsSchema,
    parser: p,
    handler,
    cli: a => handler(p.parse(a)),
  }
}
