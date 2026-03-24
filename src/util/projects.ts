/** Project and task management utilities */

import path from 'path'
import config from './config.js'
import env from './env.js'
import {
  readFrontmatter,
  updateFrontmatter,
  writeFrontmatter,
  type AgentFrontmatter,
  type ProjectFrontmatter,
  type TaskFrontmatter,
} from './frontmatter.js'
import util from './index.js'

const projects = {
  /**
   * Get project directory path
   */
  getProjectDir(projectSlug: string): string {
    return util.join(env.TEAM_HOME, config.dirs.PROJECTS, projectSlug)
  },

  /**
   * Get task directory path
   */
  getTaskDir(projectSlug: string, taskSlug: string): string {
    return util.join(this.getProjectDir(projectSlug), config.dirs.TASKS, taskSlug)
  },

  /**
   * Get agent directory path
   */
  getAgentDir(agentSlug: string): string {
    return util.join(env.TEAM_HOME, config.dirs.AGENTS, agentSlug)
  },

  /**
   * List all projects
   */
  async listProjects(): Promise<string[]> {
    const projectsDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS)
    const projects = await util.listDir(projectsDir)
    const filtered: string[] = []
    for (const project of projects) {
      const projectDir = this.getProjectDir(project)
      const isDir = await util.fileExists(projectDir)
      if (isDir && project !== config.dirs.AGENTS) {
        filtered.push(project)
      }
    }
    return filtered
  },

  /**
   * List all tasks in a project
   */
  async listTasks(projectSlug: string): Promise<string[]> {
    const tasksDir = util.join(this.getProjectDir(projectSlug), config.dirs.TASKS)
    const exists = await util.fileExists(tasksDir)
    if (!exists) {
      return []
    }
    return await util.listDir(tasksDir)
  },

  /**
   * List all agents
   */
  async listAgents(): Promise<string[]> {
    const agentsDir = util.join(env.TEAM_HOME, config.dirs.AGENTS)
    const exists = await util.fileExists(agentsDir)
    if (!exists) {
      return []
    }
    return await util.listDir(agentsDir)
  },

  /**
   * Create a new project
   */
  async createProject(
    slug: string,
    frontmatter: ProjectFrontmatter,
  ): Promise<string> {
    const projectDir = this.getProjectDir(slug)

    await util.ensureDir(projectDir)
    await util.ensureDir(util.join(projectDir, config.dirs.TASKS))
    await util.ensureDir(util.join(projectDir, config.dirs.HOOKS))

    await writeFrontmatter(util.join(projectDir, config.files.MAIN), frontmatter)
    await util.write(util.join(projectDir, config.files.STATUS), '')

    return projectDir
  },

  /**
   * Create a new task
   */
  async createTask(
    projectSlug: string,
    taskSlug: string,
    frontmatter: TaskFrontmatter,
  ): Promise<string> {
    const taskDir = this.getTaskDir(projectSlug, taskSlug)

    await util.ensureDir(taskDir)
    await util.ensureDir(util.join(taskDir, config.dirs.HOOKS))

    await writeFrontmatter(util.join(taskDir, config.files.MAIN), frontmatter)
    await util.write(util.join(taskDir, config.files.STATUS), '')

    return taskDir
  },

  /**
   * Create a new agent
   */
  async createAgent(
    slug: string,
    frontmatter: AgentFrontmatter,
  ): Promise<string> {
    const agentDir = this.getAgentDir(slug)

    await util.ensureDir(agentDir)
    await writeFrontmatter(util.join(agentDir, config.files.MAIN), frontmatter)

    return agentDir
  },

  /**
   * Get project metadata
   */
  async getProject(projectSlug: string): Promise<Partial<ProjectFrontmatter> | null> {
    const mainPath = util.join(this.getProjectDir(projectSlug), config.files.MAIN)
    const exists = await util.fileExists(mainPath)
    if (!exists) {
      return null
    }
    return await readFrontmatter<ProjectFrontmatter>(mainPath)
  },

  /**
   * Get task metadata
   */
  async getTask(projectSlug: string, taskSlug: string): Promise<Partial<TaskFrontmatter> | null> {
    const mainPath = util.join(this.getTaskDir(projectSlug, taskSlug), config.files.MAIN)
    const exists = await util.fileExists(mainPath)
    if (!exists) {
      return null
    }
    return await readFrontmatter<TaskFrontmatter>(mainPath)
  },

  /**
   * Get agent metadata
   */
  async getAgent(agentSlug: string): Promise<Partial<AgentFrontmatter> | null> {
    const mainPath = util.join(this.getAgentDir(agentSlug), config.files.MAIN)
    const exists = await util.fileExists(mainPath)
    if (!exists) {
      return null
    }
    return await readFrontmatter<AgentFrontmatter>(mainPath)
  },

  /**
   * Update project metadata
   */
  async updateProject(
    projectSlug: string,
    updates: Partial<ProjectFrontmatter>,
  ): Promise<Partial<ProjectFrontmatter>> {
    const mainPath = util.join(this.getProjectDir(projectSlug), config.files.MAIN)
    return await updateFrontmatter(mainPath, updates)
  },

  /**
   * Update task metadata
   */
  async updateTask(
    projectSlug: string,
    taskSlug: string,
    updates: Partial<TaskFrontmatter>,
  ): Promise<Partial<TaskFrontmatter>> {
    const mainPath = util.join(this.getTaskDir(projectSlug, taskSlug), config.files.MAIN)
    const current = await readFrontmatter<TaskFrontmatter>(mainPath)
    if (current?.status === 'ongoing') {
      throw new Error('Cannot update ongoing task. Should be done by user or update manually')
    }
    return await updateFrontmatter(mainPath, updates)
  },

  /**
   * Read all files in a task for context ingestion
   */
  async ingestTask(projectSlug: string, taskSlug: string): Promise<string> {
    const taskDir = this.getTaskDir(projectSlug, taskSlug)
    const projectDir = this.getProjectDir(projectSlug)
    const files: string[] = []

    const projectMain = util.join(projectDir, config.files.MAIN)
    if (await util.fileExists(projectMain)) {
      files.push(`## Project: ${projectSlug}\n\n${await util.read(projectMain)}`)
    }

    const taskMain = util.join(taskDir, config.files.MAIN)
    if (await util.fileExists(taskMain)) {
      files.push(`## Task: ${taskSlug}\n\n${await util.read(taskMain)}`)
    }

    const taskStatus = util.join(taskDir, config.files.STATUS)
    if (await util.fileExists(taskStatus)) {
      files.push(`## Task Status Log\n\n${await util.read(taskStatus)}`)
    }

    return files.join('\n\n---\n\n')
  },

  /**
   * Read all files in a project for context ingestion
   */
  async ingestProject(projectSlug: string): Promise<string> {
    const projectDir = this.getProjectDir(projectSlug)
    const files: string[] = []

    const projectMain = util.join(projectDir, config.files.MAIN)
    if (await util.fileExists(projectMain)) {
      files.push(`## Project: ${projectSlug}\n\n${await util.read(projectMain)}`)
    }

    const projectStatus = util.join(projectDir, config.files.STATUS)
    if (await util.fileExists(projectStatus)) {
      files.push(`## Project Status Log\n\n${await util.read(projectStatus)}`)
    }

    const tasks = await this.listTasks(projectSlug)
    for (const taskSlug of tasks) {
      const taskMain = util.join(this.getTaskDir(projectSlug, taskSlug), config.files.MAIN)
      if (await util.fileExists(taskMain)) {
        files.push(`## Task: ${taskSlug}\n\n${await util.read(taskMain)}`)
      }
    }

    return files.join('\n\n---\n\n')
  },

  /**
   * Read multiple files for context ingestion
   */
  async ingestFiles(filePaths: string[]): Promise<string> {
    const files: string[] = []

    for (const filePath of filePaths) {
      if (await util.fileExists(filePath)) {
        const content = await util.read(filePath)
        files.push(`## ${path.basename(filePath)}\n\n${content}`)
      }
    }

    return files.join('\n\n---\n\n')
  },
}

export default projects
