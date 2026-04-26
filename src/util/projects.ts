/** Project and task management utilities */

import config from './config.js'
import env from './env.js'
import { parseFrontmatter, readFrontmatter, updateFrontmatter, writeFrontmatter, type AgentFrontmatter, type AnyFrontmatter, type ProjectFrontmatter, type TaskFrontmatter } from './frontmatter.js'
import util from './index.js'

/** Task status enumeration */
export enum TaskStatus {
  BACKLOG = 'backlog',
  IN_PROGRESS = 'in-progress',
  ONGOING = 'ongoing',
  DONE = 'done',
  BLOCKED = 'blocked',
  TO_DO = 'to-do',
}

/** Helper to get all valid task statuses */
export const ALL_TASK_STATUSES = Object.values(TaskStatus)

/** Helper to get active (non-terminal) task statuses */
export const ACTIVE_TASK_STATUSES = [
  TaskStatus.BACKLOG,
  TaskStatus.IN_PROGRESS,
  TaskStatus.ONGOING,
]

const TASK_SUBDIRS = [config.dirs.HOOKS, config.dirs.INPUTS, config.dirs.OUTPUTS, config.dirs.SCRIPTS] as const
const PROJECT_SUBDIRS = [config.dirs.TASKS, ...TASK_SUBDIRS] as const

const projects = {
  /** Get project directory path */
  getProjectDir(projectSlug: string): string {
    return util.joinHome(config.dirs.PROJECTS, projectSlug)
  },

  /** Get task directory path */
  getTaskDir(projectSlug: string, taskSlug: string): string {
    return util.join(this.getProjectDir(projectSlug), config.dirs.TASKS, taskSlug)
  },

  /**
   * Find a task by slug, optionally within a specific project
   * If projectSlug not provided, searches all projects
   * Throws if task found in multiple projects (ambiguous)
   */
  async findTask(taskSlug: string, projectSlug?: string): Promise<{ project: string; task: string }> {
    if (projectSlug) {
      return { project: projectSlug, task: taskSlug }
    }

    // Search all projects for the task
    const allProjects = await this.listProjects()
    const matches: string[] = []

    await util.promiseEach(allProjects, async (project) => {
      const tasks = await this.listTasks(project)
      if (tasks.includes(taskSlug)) {
        matches.push(project)
      }
    })

    if (matches.length === 0) {
      throw new Error(`Task '${taskSlug}' not found. Use --project to specify the project.`)
    }

    if (matches.length > 1) {
      throw new Error(`Task '${taskSlug}' found in multiple projects: ${matches.join(', ')}. Use --project to specify which one.`)
    }

    return { project: matches[0], task: taskSlug }
  },

  /** Get agent directory path */
  getAgentDir(agentSlug: string): string {
    return util.join(env.AIP_HOME, config.dirs.AGENTS, agentSlug)
  },

  /** List all projects */
  async listProjects(): Promise<string[]> {
    const projectsDir = util.join(env.AIP_HOME, config.dirs.PROJECTS)
    const projects = await util.listDir(projectsDir)

    const results = await util.promiseMap(projects, async (project) => {
      const projectDir = this.getProjectDir(project)
      const isDir = await util.fileExists(projectDir)
      return isDir && project !== config.dirs.AGENTS ? project : null
    })

    return results.filter((p): p is string => p !== null).sort()
  },

  /** List all tasks in a project */
  async listTasks(projectSlug: string): Promise<string[]> {
    const tasksDir = util.join(this.getProjectDir(projectSlug), config.dirs.TASKS)
    const exists = await util.fileExists(tasksDir)
    if (!exists) {
      return []
    }
    return await util.listDir(tasksDir)
  },

  /** List all agents */
  async listAgents(): Promise<string[]> {
    const agentsDir = util.join(env.AIP_HOME, config.dirs.AGENTS)
    const exists = await util.fileExists(agentsDir)
    if (!exists) {
      return []
    }
    return await util.listDir(agentsDir)
  },

  /** Create a new project */
  async createProject(
    slug: string,
    frontmatter: ProjectFrontmatter,
    body?: string,
  ): Promise<string> {
    const projectDir = this.getProjectDir(slug)

    await util.ensureDir(projectDir)
    await Promise.all(
      PROJECT_SUBDIRS.map(dir => util.ensureDir(util.join(projectDir, dir))),
    )

    await writeFrontmatter(util.join(projectDir, config.files.MAIN), frontmatter, body)
    await util.write(util.join(projectDir, config.files.LOG), '')

    return projectDir
  },

  /** Create a new task */
  async createTask(
    projectSlug: string,
    taskSlug: string,
    frontmatter: TaskFrontmatter,
    body?: string,
  ): Promise<string> {
    const taskDir = this.getTaskDir(projectSlug, taskSlug)

    await util.ensureDir(taskDir)
    await Promise.all(
      TASK_SUBDIRS.map(dir => util.ensureDir(util.join(taskDir, dir))),
    )

    await writeFrontmatter(util.join(taskDir, config.files.MAIN), frontmatter, body)
    await util.write(util.join(taskDir, config.files.LOG), '')

    return taskDir
  },

  /** Create a new agent */
  async createAgent(
    slug: string,
    frontmatter: AgentFrontmatter,
  ): Promise<string> {
    const agentDir = this.getAgentDir(slug)

    await util.ensureDir(agentDir)
    await writeFrontmatter(util.join(agentDir, config.files.MAIN), frontmatter)

    return agentDir
  },

  /** Get project metadata */
  async getProject(projectSlug: string): Promise<Partial<ProjectFrontmatter> | null> {
    const mainPath = util.join(this.getProjectDir(projectSlug), config.files.MAIN)
    return await readFrontmatter<ProjectFrontmatter>(mainPath)
  },

  /** Get task metadata */
  async getTask(projectSlug: string, taskSlug: string): Promise<Partial<TaskFrontmatter> | null> {
    const mainPath = util.join(this.getTaskDir(projectSlug, taskSlug), config.files.MAIN)
    return await readFrontmatter<TaskFrontmatter>(mainPath)
  },

  /** Get agent metadata */
  async getAgent(agentSlug: string): Promise<Partial<AgentFrontmatter> | null> {
    const mainPath = util.join(this.getAgentDir(agentSlug), config.files.MAIN)
    return await readFrontmatter<AgentFrontmatter>(mainPath)
  },

  /** Update project metadata */
  async updateProject(
    projectSlug: string,
    updates: Partial<ProjectFrontmatter>,
  ): Promise<Partial<ProjectFrontmatter>> {
    const mainPath = util.join(this.getProjectDir(projectSlug), config.files.MAIN)
    return await updateFrontmatter(mainPath, updates)
  },

  /** Update project/task body (content after frontmatter) */
  async updateBody(
    filePath: string,
    body: string,
  ): Promise<void> {
    const content = await util.read(filePath)
    const parsed = parseFrontmatter<AnyFrontmatter>(content)

    if (!parsed) {
      throw new Error(`No frontmatter found in ${filePath}`)
    }

    await writeFrontmatter(filePath, parsed.frontmatter as AnyFrontmatter, body)
  },

  /** Update task metadata */
  async updateTask(
    projectSlug: string,
    taskSlug: string,
    updates: Partial<TaskFrontmatter>,
  ): Promise<Partial<TaskFrontmatter>> {
    const mainPath = util.join(this.getTaskDir(projectSlug, taskSlug), config.files.MAIN)
    const current = await readFrontmatter<TaskFrontmatter>(mainPath)
    if (current?.status === TaskStatus.ONGOING) {
      throw new Error('Cannot update ongoing task. Should be done by user or update manually')
    }
    return await updateFrontmatter(mainPath, updates)
  },

  /** Read all files in a task for context ingestion */
  async ingestTask(projectSlug: string, taskSlug: string): Promise<void> {
    const taskDir = this.getTaskDir(projectSlug, taskSlug)
    const projectDir = this.getProjectDir(projectSlug)

    const paths = [
      util.join(projectDir, config.files.MAIN),
      util.join(taskDir, config.files.MAIN),
      util.join(taskDir, config.files.LOG),
    ]

    await util.logFiles(...paths)
  },

  /** Read all files in a project for context ingestion */
  async ingestProject(projectSlug: string): Promise<void> {
    const projectDir = this.getProjectDir(projectSlug)
    const tasks = await this.listTasks(projectSlug)

    const paths = [
      util.join(projectDir, config.files.MAIN),
      util.join(projectDir, config.files.LOG),
      ...tasks.map(task => util.join(this.getTaskDir(projectSlug, task), config.files.MAIN)),
    ]

    await util.logFiles(...paths)
  },

  /** Read multiple files for context ingestion */
  async ingestFiles(filePaths: string[]): Promise<void> {
    await util.logFiles(...filePaths)
  },
}

export default projects
