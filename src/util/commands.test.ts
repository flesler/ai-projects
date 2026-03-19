import { describe, it, expect } from 'vitest'
import commands from './commands.js'

describe('commands', () => {
  it('should define a command', () => {
    const schema = { shape: {} }
    const handler = async () => {}
    const command = commands.define(schema as any, handler)

    expect(command.schema).toBe(schema)
    expect(command.handler).toBe(handler)
  })

  it('should convert schema to options', () => {
    const schema = {
      shape: {
        name: { type: 'string' },
        age: { type: 'number' },
      },
    }
    const options = commands.schemaToOptions(schema as any)

    expect(options).toEqual({
      name: { type: { type: 'string' } },
      age: { type: { type: 'number' } },
    })
  })

  it('should load commands', async () => {
    const result = await commands.load()

    expect(result).toBeTypeOf('object')
    expect(Object.keys(result).length).toBeGreaterThan(0)
  })
})
