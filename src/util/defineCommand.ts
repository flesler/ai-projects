import type { z, ZodObject } from 'zod'

/** Command definition with schema and handler */
export interface CommandDef<T extends ZodObject<any>> {
  schema: T
  handler: (params: z.infer<T>) => Promise<void>
}

/** Helper to define a command with schema and handler */
export const defineCommand = <T extends ZodObject<any>>(schema: T, handler: (params: z.infer<T>) => Promise<void>): CommandDef<T> => {
  return { schema, handler }
}

/** Convert a zod object schema to zod-opts options format */
export const schemaToOptions = <T extends ZodObject<any>>(schema: T): Record<string, { type: any }> => {
  const shape = schema.shape
  const options: Record<string, { type: any }> = {}

  for (const [key, value] of Object.entries(shape)) {
    options[key] = { type: value }
  }

  return options
}
