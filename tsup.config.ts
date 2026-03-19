import { defineConfig } from 'tsup'
import { glob } from 'glob'

export default defineConfig({
  entry: ['src/index.ts', ...glob.sync('src/commands/**/*.ts')],
  format: ['esm'],
  dts: true,
  splitting: false,
  sourcemap: false,
  clean: true,
  treeshake: true,
  minify: false,
  external: ['zod-opts', 'zod'],
})
