/**
 * Task commands - shows help when no verb is provided
 */

import { z } from 'zod'
import { defineCommand } from 'src/util/defineCommand.js'

export default defineCommand(
  z.object({}),
  async () => {
    console.log('Task commands:')
    console.log('  aip task create --project "project-name" --name "Task Name"')
    console.log('  aip task complete --project "project-name" --task "task-name"')
    console.log('\nRun with --help for more details')
  },
)
