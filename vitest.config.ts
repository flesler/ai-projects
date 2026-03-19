import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vitest/config'
import type { Reporter, SerializedError, TestModule, TestRunEndReason } from 'vitest/node'

const APP_NAME = path.basename(__dirname)
const LOG_FILE = './tests.log'
const TO_FILE = !!process.env.FILE
const VERBOSE = process.env.VERBOSE === '1'

class FileReporter implements Reporter {
  onTestRunEnd(
    testModules: ReadonlyArray<TestModule>,
    unhandledErrors: ReadonlyArray<SerializedError>,
    _reason: TestRunEndReason,
  ): void {
    let output = ''

    testModules.forEach((module) => {
      const relativePath = module.moduleId ? path.relative(process.cwd(), module.moduleId) : module.moduleId || ''
      const tests = Array.from(module.children.allTests())
      const hasFailures = tests.some(test => test.result()?.state === 'failed')
      const status = hasFailures ? '❌' : '✅'
      output += `${status} ${relativePath}\n`

      tests.forEach((test) => {
        const result = test.result()
        if (result?.state === 'failed' && result.errors) {
          result.errors.forEach((error: SerializedError) => {
            const testName = test.fullName
            const location = error.stack?.match(/at .*\/src\/[^:]+:\d+:\d+/)?.[0]
              ?.replace('at ', '').replace(process.cwd(), '') || null
            output += `  ${testName}: ${error.message}`
            if (location) output += ` (${location})`
            output += '\n'
          })
        }
      })
    })

    unhandledErrors.forEach((error) => {
      output += `❌ GLOBAL: ${error.message || error.toString()}\n`
    })

    try {
      fs.writeFileSync(LOG_FILE, output.trim())
    } catch (err) {
      console.error('Failed to write vitest.log:', err)
    }
  }
}

export default defineConfig(() => ({
  cacheDir: `/tmp/${APP_NAME}`,
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'bin/**/*.test.ts'],
    exclude: ['node_modules', 'dist', 'tmp'],
    setupFiles: ['./src/setup.ts'],
    // test:watch:file prints nothing but saves to file the last result (for AI)
    reporters: [TO_FILE ? new FileReporter() : VERBOSE ? 'verbose' : 'dot'],
    logHeapUsage: false,
    outputFile: undefined, // Disable file output
    silent: false, // Keep error messages visible
    ui: false, // Disable web UI
    // Performance optimizations
    pool: 'threads',
    threads: {
      singleThread: false,
      useAtomics: true,
    },
    // Watch mode optimizations
    watchExclude: ['**/node_modules/**', '**/dist/**', '**/tmp/**'],
    // Skip heavy operations for speed
    coverage: {
      enabled: false, // Disable by default for speed
    },
    // Faster TypeScript processing
    typecheck: {
      enabled: false, // Let ESLint handle type checking
    },
  },
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  // Use ESM for better performance
  esbuild: {
    target: 'node18',
  },
}))
