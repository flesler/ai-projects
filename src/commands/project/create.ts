import { z } from 'zod'
import defineCommand from '../../util/defineCommand.js'
import util from '../../util/index.js'
import logUtil from '../../util/log.js'
import projects from '../../util/projects.js'

export default defineCommand({
  description: 'Create a new project with name, description, optional status, assignee and body',
  options: z.object({
    description: z.string().describe('Project description'),
    status: z.string().default('active').describe('Initial status'),
    assignee: z.string().optional().describe('Assignee agent slug'),
    body: z.string().optional().describe('Initial body/content (markdown)'),
  }),
  args: z.object({
    name: z.string().describe('Project name'),
  }),
  handler: async ({ name, description, status, assignee, body }) => {
    const slug = util.slugify(name)

    // Run pre-create hooks
    const projectDir = projects.getProjectDir(slug)
    // Create project
    await projects.createProject(slug, {
      name, description, status, assignee, created: new Date().toISOString(),
    }, body)

    // Log creation
    await logUtil.append(projectDir, 'project', slug, 'created', `${name} > status is ${status}`)

    console.log(`Project created: ${slug}. Path: ${projectDir}`)
  },
})
