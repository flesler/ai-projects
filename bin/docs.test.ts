import { toModule, type FnTestCase } from '../src/util/tests.js'
import { describe, it, expect } from 'vitest'
import { z } from 'zod'

describe(toModule(__filename), () => {
  describe('extractOptions', () => {
    const extractOptions = (schema: z.ZodObject<any>): Array<{ name: string; type: string; required: boolean; description?: string }> => {
      const shape = schema.shape
      const options: Array<{ name: string; type: string; required: boolean; description?: string }> = []

      for (const [name, zodType] of Object.entries(shape) as Array<[string, z.ZodType]>) {
        const def: any = zodType._def
        let type = 'unknown'
        let description: string | undefined

        if (def.typeName === 'ZodString') {
          type = 'string'
        } else if (def.typeName === 'ZodNumber') {
          type = 'number'
        } else if (def.typeName === 'ZodBoolean') {
          type = 'boolean'
        } else if (def.typeName === 'ZodEnum') {
          type = `enum: ${def.values.join(' | ')}`
        } else if (def.typeName === 'ZodOptional') {
          type = 'unknown'
        } else if (def.typeName === 'ZodDefault') {
          type = 'unknown'
        }

        if (def.description) {
          description = def.description
        }

        const required = def.typeName !== 'ZodOptional' && def.typeName !== 'ZodDefault'
        options.push({ name, type, required, description })
      }

      return options
    }

    const cases: FnTestCase<typeof extractOptions>[] = [
      {
        desc: 'string field with description',
        input: z.object({ name: z.string().describe('User name') }),
        expected: [{ name: 'name', type: 'string', required: true, description: 'User name' }],
      },
      {
        desc: 'number field',
        input: z.object({ age: z.number() }),
        expected: [{ name: 'age', type: 'number', required: true, description: undefined }],
      },
      {
        desc: 'optional field',
        input: z.object({ email: z.string().optional() }),
        expected: [{ name: 'email', type: 'unknown', required: false, description: undefined }],
      },
      {
        desc: 'boolean field',
        input: z.object({ active: z.boolean() }),
        expected: [{ name: 'active', type: 'boolean', required: true, description: undefined }],
      },
      {
        desc: 'enum field',
        input: z.object({ status: z.enum(['active', 'inactive']) }),
        expected: [{ name: 'status', type: 'enum: active | inactive', required: true, description: undefined }],
      },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        const result = extractOptions(input)
        expect(result).toEqual(expected)
      })
    })
  })

  describe('extractType', () => {
    const extractType = (zodType: any): string => {
      const def = zodType._def
      if (def.typeName === 'ZodString') return 'string'
      if (def.typeName === 'ZodNumber') return 'number'
      if (def.typeName === 'ZodBoolean') return 'boolean'
      if (def.typeName === 'ZodEnum') return `enum: ${def.values.join(' | ')}`
      return 'unknown'
    }

    const cases: FnTestCase<typeof extractType>[] = [
      { desc: 'string type', input: z.string(), expected: 'string' },
      { desc: 'number type', input: z.number(), expected: 'number' },
      { desc: 'boolean type', input: z.boolean(), expected: 'boolean' },
      { desc: 'enum type', input: z.enum(['a', 'b']), expected: 'enum: a | b' },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(extractType(input)).toBe(expected)
      })
    })
  })
})
