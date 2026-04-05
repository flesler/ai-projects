import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import hooks from '../../util/hooks.js'
import util from '../../util/index.js'
import projects from '../../util/projects.js'
import statusUtil from '../../util/status.js'

export default defineCommand({
  description: 'Create a new project with name, description, optional status and assignee',
  options: z.object({
    description: z.string().describe('Project description'),
    status: z.string().default('active').describe('Initial status'),
    assignee: z.string().optional().describe('Assignee agent slug'),
  }),
  args: z.object({
    name: z.string().describe('Project name'),
  }),
  handler: async ({ name, description, status, assignee }) => {
    const slug = util.slugify(name)

    // Run pre-create hooks
    const projectDir = projects.getProjectDir(slug)
    const preHookSuccess = await hooks.runHooks(projectDir, 'pre-create', {
      action: 'pre-create',
      entityType: 'project',
    })

    if (!preHookSuccess) {
      throw new Error('Pre-create hook failed, aborting project creation')
    }

    // Create project
    await projects.createProject(slug, {
      name, description, status, assignee, created: new Date().toISOString(),
    })

    // Log creation
    await statusUtil.appendStatus(projectDir, 'project', slug, 'created', `status is ${status}`)

    // Run post-create hooks
    await hooks.runHooks(projectDir, 'post-create', {
      action: 'post-create',
      entityType: 'project',
    })

    console.log(`Project created: ${slug}`)
    console.log(`  Path: ${projectDir}`)
  },
})
