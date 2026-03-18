#!/usr/bin/env node
/**
 * AIP - AI Project Management CLI
 * 
 * Usage:
 *   aip <noun> <verb> [options]
 * 
 * Examples:
 *   aip project create --name "My Project" --description "Description"
 *   aip task create --project "my-project" --name "Task Name"
 *   aip task complete --project "my-project" --task "task-name"
 *   aip agent create --name "researcher" --description "Research agent"
 */

import { projectCreate } from './commands/project/create.js'
import { taskCreate } from './commands/task/create.js'
import { taskComplete } from './commands/task/complete.js'
import { agentCreate } from './commands/agent/create.js'

// Library exports
export { projectCreate } from './commands/project/create.js'
export { taskCreate, taskComplete } from './commands/task/index.js'
export { agentCreate } from './commands/agent/create.js'
export * from './env.js'
export * from './utils/fs.js'
export * from './utils/logger.js'
export * from './utils/slug.js'

const args = process.argv.slice(2)
const [noun, verb, ...rest] = args

if (!noun || !verb) {
  console.log(`
AIP - AI Project Management CLI

Usage:
  aip <noun> <verb> [options]

Nouns:
  project   Manage projects
  task      Manage tasks
  agent     Manage agents

Examples:
  aip project create --name "My Project" --description "Description"
  aip task create --project "my-project" --name "Task Name"
  aip task complete --project "my-project" --task "task-name"
  aip agent create --name "researcher" --description "Research agent"
`)
  process.exit(1)
}

async function main() {
  try {
    switch (noun) {
      case 'project':
        if (verb === 'create') {
          await projectCreate(rest)
        } else {
          console.error(`Unknown project verb: ${verb}`)
          process.exit(1)
        }
        break
      case 'task':
        if (verb === 'create') {
          await taskCreate(rest)
        } else if (verb === 'complete') {
          await taskComplete(rest)
        } else {
          console.error(`Unknown task verb: ${verb}`)
          process.exit(1)
        }
        break
      case 'agent':
        if (verb === 'create') {
          await agentCreate(rest)
        } else {
          console.error(`Unknown agent verb: ${verb}`)
          process.exit(1)
        }
        break
      default:
        console.error(`Unknown noun: ${noun}`)
        process.exit(1)
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error)
    process.exit(1)
  }
}

main()
