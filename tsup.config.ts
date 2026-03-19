import fg from 'fast-glob'
import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  const dts = options.dts !== false
  const now = Date.now()

  return {
    entry: ['src/index.ts', ...fg.sync('src/commands/**/*.ts')],
    format: ['esm'],
    platform: 'node',
    target: 'node24',
    outDir: 'dist',
    dts,
    splitting: true,
    sourcemap: false,
    clean: dts,
    treeshake: dts,
    minify: dts,
    silent: !dts,
    skipNodeModulesBundle: true,
    external: ['zod-opts', 'zod'],
    esbuildOptions(options) {
      options.banner = {
        js: '#!/usr/bin/env node',
      }
      options.legalComments = 'none'
      options.drop = ['debugger']
    },
    async onSuccess() {
      if (!dts) {
        console.log(`Build success in ${Date.now() - now}ms`)
      }
    },
  }
})
