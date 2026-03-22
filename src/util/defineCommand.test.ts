import { toModule } from './tests.js'
import { describe, it, expect, vi } from 'vitest'
import { z } from 'zod'
import defineCommand from './defineCommand.js'

describe(toModule(__filename), () => {
  describe('defineCommand', () => {
    it('should create command with schema and handler', () => {
      const schema = z.object({
        name: z.string(),
        age: z.number(),
      })
      const handler = async (_params: { name: string; age: number }) => {}

      const command = defineCommand({ options: schema, handler })

      expect(command.options).toBe(schema)
      expect(command.handler).toBe(handler)
      expect(command.parser).toBeDefined()
      expect(command.cli).toBeDefined()
    })

    it('should create parser from schema', async () => {
      const schema = z.object({
        name: z.string(),
        count: z.number().optional(),
      })
      const handler = async () => {}

      const command = defineCommand({ options: schema, handler })

      const parsed = command.parser.parse(['--name', 'test', '--count', '5']) as any
      expect(parsed.name).toBe('test')
      expect(parsed.count).toBe(5)
    })

    it('should execute handler with parsed args via cli', async () => {
      let captured: any
      const schema = z.object({
        value: z.string(),
      })
      const handler = async (params: { value: string }) => {
        captured = params
      }

      const command = defineCommand({ options: schema, handler })
      await command.cli(['--value', 'test123'])

      expect(captured).toEqual({ value: 'test123' })
    })

    it('should handle required fields', () => {
      const schema = z.object({
        required: z.string(),
      })
      const handler = async () => {}

      const command = defineCommand({ options: schema, handler })

      // Suppress stderr output from zod-opts parser
      vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        command.parser.parse([])
      }).toThrow()

      vi.restoreAllMocks()
    })
  })

  describe('CommandDef type', () => {
    it('should have all required properties', () => {
      const schema = z.object({ test: z.string() })
      const handler = async () => {}
      const command = defineCommand({ options: schema, handler })

      expect(command).toHaveProperty('options')
      expect(command).toHaveProperty('parser')
      expect(command).toHaveProperty('handler')
      expect(command).toHaveProperty('cli')
    })
  })
})
