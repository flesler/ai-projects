import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'

export default defineCommand({
  description: 'Output project directory path (for cd)',
  options: z.object({}),
  args: z.object({ name: z.string().describe('Project name (slug)') }),
  handler: async ({ name }) => {
    const projectDir = projects.getProjectDir(name)
    console.log(projectDir)
  },
})
