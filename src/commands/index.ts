/** Auto-generated command map - DO NOT EDIT */

import agentCreate from './agent/create.js'
import projectCreate from './project/create.js'
import taskComplete from './task/complete.js'
import taskCreate from './task/create.js'

/** Command map organized by noun and verb */
const commands = {
  agent: {
    create: agentCreate,
  },
  project: {
    create: projectCreate,
  },
  task: {
    complete: taskComplete,
    create: taskCreate,
  },
} as const

export default commands
