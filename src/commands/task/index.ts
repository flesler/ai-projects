import { z } from 'zod'
import commands from 'src/util/commands.js'

export default commands.define(
  z.object({}),
  async () => {
    console.log('Task commands:')
    console.log('  aip task create --project "project-name" --name "Task Name"')
    console.log('  aip task complete --project "project-name" --task "task-name"')
    console.log('\nRun with --help for more details')
  },
)
