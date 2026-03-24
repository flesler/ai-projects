/** Command utilities */

import { z, type ZodObject } from 'zod'
import type { Parser } from 'zod-opts'
import { parser as createParser } from 'zod-opts'

/** Command definition */
export interface CommandDef<
  T extends ZodObject<any> = ZodObject<any>,
  U extends ZodObject<any> = ZodObject<any>,
> {
  description?: string
  options: T
  args?: U
  parser: Parser
  handler: (params: z.infer<T> & z.infer<U>) => Promise<void>
  cli: (args: string[]) => Promise<void>
}

/** Config for defineCommand */
export interface DefineCommandConfig<
  T extends ZodObject<any> = ZodObject<any>,
  U extends ZodObject<any> = ZodObject<any>,
> {
  description?: string
  options?: T
  args?: U
  handler: (params: z.infer<T> & z.infer<U>) => Promise<void>
}

/** Helper to define a command */
export default function defineCommand<T extends ZodObject<any>, U extends ZodObject<any> = ZodObject<any>>(
  config: DefineCommandConfig<T, U>,
): CommandDef<T, U> {
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
    options: optionsSchema as T,
    args: argsSchema as U | undefined,
    parser: p,
    handler,
    cli: a => handler(p.parse(a)),
  }
}
