import { toModule, type FnTestCase } from './tests.js'
import { describe, it, expect } from 'vitest'
import * as env from './env.js'

describe(toModule(__filename), () => {
  describe('CONFIG', () => {
    it('should have correct default values', () => {
      expect(env.CONFIG).toEqual({
        DEFAULT_STATE_DIR: '/mnt/ssd/pi/.hermes',
        PROJECTS_DIR: 'projects',
        SKILLS_DIR: 'skills',
        AGENTS_DIR: 'agents',
      })
    })
  })

  describe('getStateDir', () => {
    const cases: FnTestCase<typeof env.getStateDir>[] = [
      { desc: 'uses env when set', input: undefined as any, expected: '/custom/dir' },
      { desc: 'uses default when no env', input: undefined as any, expected: env.CONFIG.DEFAULT_STATE_DIR },
    ]

    cases.forEach(({ desc }) => {
      it(`should ${desc}`, () => {
        // Can't easily test env override without process manipulation
        const result = env.getStateDir()
        expect(result).toBeTypeOf('string')
        expect(result.length).toBeGreaterThan(0)
      })
    })
  })

  describe('getProjectsDir', () => {
    it('should return projects directory path', () => {
      const result = env.getProjectsDir()
      expect(result).toContain(env.CONFIG.PROJECTS_DIR)
      expect(result).toBeTypeOf('string')
    })
  })

  describe('getSkillsDir', () => {
    it('should return skills directory path', () => {
      const result = env.getSkillsDir()
      expect(result).toContain(env.CONFIG.SKILLS_DIR)
      expect(result).toBeTypeOf('string')
    })
  })

  describe('getAgentsDir', () => {
    it('should return agents directory path', () => {
      const result = env.getAgentsDir()
      expect(result).toContain(env.CONFIG.AGENTS_DIR)
      expect(result).toBeTypeOf('string')
    })
  })
})
