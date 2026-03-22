#!/usr/bin/env tsx
/**
 * Pre-generates src/commands/index.ts with all command imports
 * to avoid dynamic imports at runtime
 */

import fastGlob from 'fast-glob'
import _ from 'lodash'
import util from '../src/util/index.js'

util.run(async () => {
  // Find all command files (excluding test files and index.ts)
  const commandFiles = await fastGlob('src/commands/*/*.ts', {
    cwd: process.cwd(),
    ignore: ['**/*.test.ts', '**/index.ts'],
  })
  commandFiles.sort()

  // Group commands by noun and verb (extracted from file path)
  const commands: Record<string, Record<string, string>> = {}

  for (const file of commandFiles) {
    // Split by forward slash since glob always returns forward slashes
    const parts = file.split('/')
    const commandsIndex = parts.findIndex(p => p === 'commands')
    const noun = parts[commandsIndex + 1]
    const verb = parts[commandsIndex + 2]?.replace('.ts', '')

    if (!commands[noun]) {
      commands[noun] = {}
    }
    commands[noun][verb] = file
  }

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
    // Quote noun if it contains special characters (like hyphens)
    const safeNoun = noun.includes('-') ? `'${noun}'` : noun
    output += `  ${safeNoun}: {\n`
    for (const verb of util.keysOf(verbs).sort()) {
      // Quote verb if it contains special characters
      const safeVerb = verb.includes('-') ? `'${verb}'` : verb
      output += `    ${safeVerb}: ${importMap[`${noun}.${verb}`]},\n`
    }
    output += `  },\n`
  }

  output += `} as const\n\n`
  output += `export default commands\n`

  // Write the generated file
  const outputPath = 'src/commands/index.ts'
  const current = await util.readRepo(outputPath)
  if (current !== output) {
    await util.write(outputPath, output)
    console.log(`Generated ${outputPath} with ${importIndex} command imports`)
  }
})
