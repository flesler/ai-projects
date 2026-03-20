#!/usr/bin/env tsx
/**
 * Pre-generates src/commands/index.ts with all command imports
 * to avoid dynamic imports at runtime
 */

import fastGlob from 'fast-glob'
import fs from 'fs'
import _ from 'lodash'
import path from 'path'
import util from '../src/util/index.js'

async function main() {
  // Find all command files (excluding test files and index.ts)
  const commandFiles = await fastGlob('src/commands/*/*.ts', {
    cwd: process.cwd(),
    ignore: ['**/*.test.ts', '**/index.ts'],
  })

  // Group commands by noun and verb
  const commands: Record<string, Record<string, string>> = {}

  await util.promiseMap(commandFiles, async (file) => {
    // Split by forward slash since glob always returns forward slashes
    const parts = file.split('/')
    const noun = parts[2] // src/commands/[noun]/[verb].ts
    const verbFile = parts[3] // [verb].ts
    const verb = verbFile.replace('.ts', '')

    if (!commands[noun]) {
      commands[noun] = {}
    }
    commands[noun][verb] = file
  })

  // Generate the index.ts file
  let output = `/** Auto-generated command map - DO NOT EDIT */\n\n`

  // Generate all imports
  let importIndex = 0
  const importMap: Record<string, string> = {}

  for (const [noun, verbs] of util.entriesOf(commands)) {
    for (const [verb, filePath] of util.entriesOf(verbs)) {
      const importName = _.camelCase(`${noun}_${verb}`)
      importMap[`${noun}.${verb}`] = importName
      // filePath is like 'src/commands/agent/create.ts'
      // We're generating 'src/commands/index.ts', so we need relative paths like './agent/create.js'
      const relativePath = filePath.replace('src/commands/', './')
      // Change .ts to .js for runtime imports
      const jsPath = relativePath.replace('.ts', '.js')
      output += `import ${importName} from '${jsPath}'\n`
      importIndex++
    }
  }

  output += `\n`
  output += `/** Command map organized by noun and verb */\n`
  output += `const commands = {\n`

  for (const noun of util.keysOf(commands).sort()) {
    const verbs = commands[noun]
    output += `  ${noun}: {\n`
    for (const verb of util.keysOf(verbs).sort()) {
      output += `    ${verb}: ${importMap[`${noun}.${verb}`]},\n`
    }
    output += `  },\n`
  }

  output += `}\n\n`
  output += `export default commands\n`

  // Write the generated file
  const outputPath = path.join(process.cwd(), 'src/commands/index.ts')
  const current = fs.readFileSync(outputPath, 'utf8')
  if (current !== output) {
    fs.writeFileSync(outputPath, output)
    console.log(`Generated ${outputPath} with ${importIndex} command imports`)
  }
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
