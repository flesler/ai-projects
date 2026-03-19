import 'source-map-support/register'

import { addAlias } from 'module-alias'
import path from 'path'

// Make it work with both node & ts-node
const supportsTypeScript = '.ts' in require.extensions
const dir = supportsTypeScript ? 'src' : 'dist'
addAlias('src', path.join(__dirname, '..', dir))

// Without this, the process doesn't exit with error code on unhandled promise exceptions
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err)
  process.exit(1)
})

process.on('uncaughtException', (err) => {
  console.error('Unhandled Exception:', err)
  process.exit(1)
})

