import { toModule, type TestCase } from '../src/util/tests.js'
import { describe, it, expect } from 'vitest'
import _ from 'lodash'

describe(toModule(__filename), () => {
  describe('command extraction logic', () => {
    const cases: Array<TestCase<string, { noun: string; verb: string }>> = [
      { desc: 'task create', input: 'src/commands/task/create.ts', expected: { noun: 'task', verb: 'create' } },
      { desc: 'task complete', input: 'src/commands/task/complete.ts', expected: { noun: 'task', verb: 'complete' } },
      { desc: 'agent create', input: 'src/commands/agent/create.ts', expected: { noun: 'agent', verb: 'create' } },
      { desc: 'project create', input: 'src/commands/project/create.ts', expected: { noun: 'project', verb: 'create' } },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should extract ${desc}`, () => {
        const parts = input.split('/')
        const commandsIndex = parts.findIndex((p: string) => p === 'commands')
        const noun = parts[commandsIndex + 1]
        const verb = parts[commandsIndex + 2]?.replace('.ts', '')

        expect({ noun, verb }).toEqual(expected)
      })
    })
  })

  describe('import name generation', () => {
    const cases: Array<TestCase<string, string>> = [
      { desc: 'task create', input: 'task_create', expected: 'taskCreate' },
      { desc: 'agent create', input: 'agent_create', expected: 'agentCreate' },
      { desc: 'project create', input: 'project_create', expected: 'projectCreate' },
      { desc: 'task complete', input: 'task_complete', expected: 'taskComplete' },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(_.camelCase(input)).toBe(expected)
      })
    })
  })

  describe('path transformation', () => {
    const cases: Array<TestCase<string, string>> = [
      { desc: 'task create ts to js', input: 'src/commands/task/create.ts', expected: './task/create.js' },
      { desc: 'agent create ts to js', input: 'src/commands/agent/create.ts', expected: './agent/create.js' },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        const relativePath = input.replace('src/commands/', './')
        const jsPath = relativePath.replace('.ts', '.js')
        expect(jsPath).toBe(expected)
      })
    })
  })
})
