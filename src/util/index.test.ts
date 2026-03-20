import { toModule, type FnTestCase, type TestCase } from './tests.js'
import { describe, it, expect } from 'vitest'
import util from './index.js'

describe(toModule(__filename), () => {
  describe('slugify', () => {
    const cases: FnTestCase<typeof util.slugify>[] = [
      { desc: 'simple text', input: 'Hello World', expected: 'hello-world' },
      { desc: 'multiple spaces', input: 'Hello   World', expected: 'hello-world' },
      { desc: 'special characters', input: 'Hello @ World!', expected: 'hello-world' },
      { desc: 'already slugged', input: 'hello-world', expected: 'hello-world' },
      { desc: 'uppercase', input: 'HELLO WORLD', expected: 'hello-world' },
      { desc: 'leading/trailing dashes', input: '--hello--', expected: 'hello' },
      { desc: 'numbers', input: 'Test 123', expected: 'test-123' },
      { desc: 'empty string', input: '', expected: '' },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.slugify(input)).toBe(expected)
      })
    })
  })

  describe('oneLine', () => {
    const cases: FnTestCase<typeof util.oneLine>[] = [
      { desc: 'single line', input: 'hello', expected: 'hello' },
      { desc: 'multiple lines', input: 'hello\nworld', expected: 'hello\\nworld' },
      { desc: 'with tabs', input: 'hello\tworld', expected: 'hello\\tworld' },
      { desc: 'multiple spaces', input: 'hello   world', expected: 'hello world' },
      { desc: 'leading/trailing whitespace', input: '  hello  ', expected: 'hello' },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.oneLine(input)).toBe(expected)
      })
    })
  })

  describe('compactWhitespace', () => {
    const cases: FnTestCase<typeof util.compactWhitespace>[] = [
      { desc: 'multiple spaces', input: 'hello  world', expected: 'hello\tworld' },
      { desc: 'multiple lines', input: 'hello\n\n\nworld', expected: 'hello\n\nworld' },
      { desc: 'windows line endings', input: 'hello\r\nworld', expected: 'hello\nworld' },
      { desc: 'escaped newlines', input: 'hello\\nworld', expected: 'hello\nworld' },
      { desc: 'leading/trailing whitespace', input: '  hello  ', expected: 'hello' },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.compactWhitespace(input)).toBe(expected)
      })
    })
  })

  describe('fuzzySearch', () => {
    const cases: Array<TestCase<[string | null | undefined, string | null | undefined], boolean>> = [
      { desc: 'exact match', input: ['hello', 'hello'], expected: true },
      { desc: 'case insensitive', input: ['Hello', 'hello'], expected: true },
      { desc: 'partial match', input: ['hello world', 'world'], expected: true },
      { desc: 'no match', input: ['hello', 'world'], expected: false },
      { desc: 'null string', input: [null, 'hello'], expected: false },
      { desc: 'null search', input: ['hello', null], expected: true },
      { desc: 'both null', input: [null, null], expected: true },
      { desc: 'empty strings', input: ['', ''], expected: true },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.fuzzySearch(...input)).toBe(expected)
      })
    })
  })

  describe('keysOf', () => {
    it('should return keys of an object', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(util.keysOf(obj)).toEqual(['a', 'b', 'c'])
    })

    it('should return empty array for empty object', () => {
      expect(util.keysOf({})).toEqual([])
    })
  })

  describe('entriesOf', () => {
    it('should return entries of an object', () => {
      const obj = { a: 1, b: 2 }
      expect(util.entriesOf(obj)).toEqual([['a', 1], ['b', 2]])
    })

    it('should return empty array for empty object', () => {
      expect(util.entriesOf({})).toEqual([])
    })
  })

  describe('isKeyOf', () => {
    const obj = { a: 1, b: 2 }

    const cases: Array<TestCase<[string | number | symbol | null | undefined, typeof obj], boolean>> = [
      { desc: 'valid key', input: ['a', obj], expected: true },
      { desc: 'invalid key', input: ['c', obj], expected: false },
      { desc: 'null key', input: [null, obj], expected: false },
      { desc: 'undefined key', input: [undefined, obj], expected: false },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.isKeyOf(...input)).toBe(expected)
      })
    })
  })

  describe('omitNilsDeep', () => {
    const cases: FnTestCase<typeof util.omitNilsDeep>[] = [
      { desc: 'object with nils', input: { a: 1, b: null, c: undefined }, expected: { a: 1 } },
      { desc: 'nested object', input: { a: { b: null, c: 2 } }, expected: { a: { c: 2 } } },
      { desc: 'preserves false and zero', input: { a: false, b: 0, c: null }, expected: { a: false, b: 0 } },
      { desc: 'empty object', input: {}, expected: {} },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.omitNilsDeep(input)).toEqual(expected)
      })
    })
  })

  describe('omitUndefinedsDeep', () => {
    const cases: FnTestCase<typeof util.omitUndefinedsDeep>[] = [
      { desc: 'object with undefineds', input: { a: 1, b: undefined }, expected: { a: 1 } },
      { desc: 'preserves null', input: { a: 1, b: null }, expected: { a: 1, b: null } },
      { desc: 'nested object', input: { a: { b: undefined, c: 2 } }, expected: { a: { c: 2 } } },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.omitUndefinedsDeep(input)).toEqual(expected)
      })
    })
  })

  describe('cloneDeep', () => {
    it('should deep clone an object', () => {
      const obj = { a: 1, b: { c: 2 } }
      const clone = util.cloneDeep(obj)
      expect(clone).toEqual(obj)
      expect(clone).not.toBe(obj)
      expect(clone.b).not.toBe(obj.b)
    })

    it('should deep clone an array', () => {
      const arr = [1, [2, 3]]
      const clone = util.cloneDeep(arr)
      expect(clone).toEqual(arr)
      expect(clone).not.toBe(arr)
      expect(clone[1]).not.toBe(arr[1])
    })
  })

  describe('int', () => {
    const cases: FnTestCase<typeof util.int>[] = [
      { desc: 'string number', input: '42', expected: 42 },
      { desc: 'float string', input: '42.5', expected: 42 },
      { desc: 'number', input: 42, expected: 42 },
      { desc: 'invalid string', input: 'abc', expected: Number.NaN },
      { desc: 'empty string', input: '', expected: Number.NaN },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        if (Number.isNaN(expected)) {
          expect(util.int(input)).toBeNaN()
        } else {
          expect(util.int(input)).toBe(expected)
        }
      })
    })
  })

  describe('undef', () => {
    const cases: Array<TestCase<any, any>> = [
      { desc: 'null to undefined', input: null, expected: undefined },
      { desc: 'value stays', input: 'test', expected: 'test' },
      { desc: 'zero stays', input: 0, expected: 0 },
      { desc: 'false stays', input: false, expected: false },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.undef(input)).toBe(expected)
      })
    })
  })

  describe('toNull', () => {
    const cases: Array<TestCase<any, any>> = [
      { desc: 'undefined to null', input: undefined, expected: null },
      { desc: 'value stays', input: 'test', expected: 'test' },
      { desc: 'null stays', input: null, expected: null },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.toNull(input)).toBe(expected)
      })
    })
  })

  describe('notNil', () => {
    it('should return value when not nil', () => {
      expect(util.notNil('test')).toBe('test')
      expect(util.notNil(0)).toBe(0)
      expect(util.notNil(false)).toBe(false)
    })

    it('should throw when null', () => {
      expect(() => util.notNil(null)).toThrow('Received unexpected null value')
    })

    it('should throw when undefined', () => {
      expect(() => util.notNil(undefined)).toThrow('Received unexpected undefined value')
    })
  })

  describe('randomInt', () => {
    it('should return number in range', () => {
      for (let i = 0; i < 100; i++) {
        const result = util.randomInt(1, 10)
        expect(result).toBeGreaterThanOrEqual(1)
        expect(result).toBeLessThanOrEqual(10)
      }
    })

    it('should handle same min/max', () => {
      expect(util.randomInt(5, 5)).toBe(5)
    })
  })

  describe('isPromise', () => {
    const cases: Array<TestCase<any, boolean>> = [
      { desc: 'promise', input: Promise.resolve(), expected: true },
      { desc: 'async function result', input: (async () => {})(), expected: true },
      { desc: 'object', input: {}, expected: false },
      { desc: 'array', input: [], expected: false },
      { desc: 'null', input: null, expected: false },
      { desc: 'number', input: 42, expected: false },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.isPromise(input)).toBe(expected)
      })
    })
  })

  describe('typeOf', () => {
    const cases: Array<TestCase<any, string>> = [
      { desc: 'string', input: 'hello', expected: 'string' },
      { desc: 'number', input: 42, expected: 'number' },
      { desc: 'boolean', input: true, expected: 'boolean' },
      { desc: 'object', input: {}, expected: 'object' },
      { desc: 'array', input: [], expected: 'object' },
      { desc: 'null', input: null, expected: 'object' },
      { desc: 'undefined', input: undefined, expected: 'undefined' },
      { desc: 'function', input: () => {}, expected: 'function' },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.typeOf(input)).toBe(expected)
      })
    })
  })

  describe('errorMessage', () => {
    const cases: Array<TestCase<unknown, string>> = [
      { desc: 'Error object', input: new Error('test'), expected: 'test' },
      { desc: 'string', input: 'error', expected: 'error' },
      { desc: 'number', input: 42, expected: '42' },
      { desc: 'null', input: null, expected: 'null' },
      { desc: 'undefined', input: undefined, expected: 'undefined' },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.errorMessage(input)).toBe(expected)
      })
    })
  })

  describe('toMS', () => {
    const cases: FnTestCase<typeof util.toMS>[] = [
      { desc: 'seconds', input: { seconds: 1 }, expected: 1000 },
      { desc: 'minutes', input: { minutes: 1 }, expected: 60000 },
      { desc: 'hours', input: { hours: 1 }, expected: 3600000 },
      { desc: 'mixed', input: { minutes: 1, seconds: 30 }, expected: 90000 },
      { desc: 'undefined', input: undefined, expected: 0 },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.toMS(input)).toBe(expected)
      })
    })
  })

  describe('toSecs', () => {
    const cases: FnTestCase<typeof util.toSecs>[] = [
      { desc: 'minutes', input: { minutes: 1 }, expected: 60 },
      { desc: 'hours', input: { hours: 1 }, expected: 3600 },
      { desc: 'mixed', input: { minutes: 1, seconds: 30 }, expected: 90 },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(util.toSecs(input)).toBe(expected)
      })
    })
  })

  describe('iso', () => {
    it('should format date as ISO', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(util.iso(date)).toBe('2024-01-15T10:30:00.000Z')
    })
  })

  describe('isoDate', () => {
    it('should format date as ISO date only', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      expect(util.isoDate(date)).toBe('2024-01-15')
    })
  })
})
