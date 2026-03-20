/** Test utilities */

import path from 'node:path'

/** Test case for pure functions */
export interface TestCase<Input, Output> {
  desc: string
  input: Input
  expected?: Output
  throws?: string
}

/** Infer test case type from a function */
export type FnTestCase<T extends (...args: any[]) => any> = TestCase<Parameters<T>[0], ReturnType<T>>

/** Convert test file path to module name for vitest */
export const toModule = (filename: string): string => {
  return path.relative(process.cwd(), filename)
    // Remove .test.ts extension
    .replace(/\.test\.[tj]s$/, '')
}
