import { defineConfig } from 'tsup'

export default defineConfig((options) => {
  const dts = options.dts !== false
  const now = Date.now()

  return {
    entry: ['src/index.ts'],
    format: ['esm'],
    platform: 'node',
    target: 'node20',
    outDir: 'dist',
    dts,
    splitting: false,
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
