import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import projects from '../../util/projects.js'
import env from '../../util/env.js'

export default defineCommand(
  z.object({
    project: z.string().optional().describe('Project slug (defaults to current project from $PWD)'),
  }),
  async ({ project }) => {
    // Use current project from PWD if not specified
    const projectSlug = project || env.getProjectFromPwd()
    if (!projectSlug) {
      throw new Error('No project specified and not in a project directory')
    }

    const content = await projects.ingestProject(projectSlug)
    console.log(content)
  },
)
