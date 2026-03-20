/** Project and task management utilities */

import path from 'path'
import util from './index.js'
import env from './env.js'
import config from './config.js'
import {
  writeFrontmatter,
  readFrontmatter,
  updateFrontmatter,
  type ProjectFrontmatter,
  type TaskFrontmatter,
  type AgentFrontmatter,
} from './frontmatter.js'

/**
 * Get project directory path
 */
export const getProjectDir = (projectSlug: string): string => {
  return util.join(env.TEAM_HOME, config.dirs.PROJECTS, projectSlug)
}

/**
 * Get task directory path
 */
export const getTaskDir = (projectSlug: string, taskSlug: string): string => {
  return util.join(getProjectDir(projectSlug), config.dirs.TASKS, taskSlug)
}

/**
 * Get agent directory path
 */
export const getAgentDir = (agentSlug: string): string => {
  return util.join(env.TEAM_HOME, config.dirs.AGENTS, agentSlug)
}

/**
 * List all projects
 */
export const listProjects = async (): Promise<string[]> => {
  const projectsDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS)
  const projects = await util.listDir(projectsDir)
  // Filter out non-directories and special directories
  const filtered: string[] = []
  for (const project of projects) {
    const projectDir = getProjectDir(project)
    const isDir = await util.fileExists(projectDir)
    if (isDir && project !== config.dirs.AGENTS) {
      filtered.push(project)
    }
  }
  return filtered
}

/**
 * List all tasks in a project
 */
export const listTasks = async (projectSlug: string): Promise<string[]> => {
  const tasksDir = util.join(getProjectDir(projectSlug), config.dirs.TASKS)
  const exists = await util.fileExists(tasksDir)
  if (!exists) {
    return []
  }
  return await util.listDir(tasksDir)
}

/**
 * List all agents
 */
export const listAgents = async (): Promise<string[]> => {
  const agentsDir = util.join(env.TEAM_HOME, config.dirs.AGENTS)
  const exists = await util.fileExists(agentsDir)
  if (!exists) {
    return []
  }
  return await util.listDir(agentsDir)
}

/**
 * Create a new project
 */
export const createProject = async (
  slug: string,
  frontmatter: ProjectFrontmatter,
): Promise<string> => {
  const projectDir = getProjectDir(slug)

  // Create directory structure
  await util.ensureDir(projectDir)
  await util.ensureDir(util.join(projectDir, config.dirs.TASKS))
  await util.ensureDir(util.join(projectDir, config.dirs.HOOKS))

  // Write main.md with frontmatter
  await writeFrontmatter(util.join(projectDir, config.files.MAIN), frontmatter)

  // Create empty status.md
  await util.write(util.join(projectDir, config.files.STATUS), '')

  return projectDir
}

/**
 * Create a new task
 */
export const createTask = async (
  projectSlug: string,
  taskSlug: string,
  frontmatter: TaskFrontmatter,
): Promise<string> => {
  const taskDir = getTaskDir(projectSlug, taskSlug)

  // Create directory structure
  await util.ensureDir(taskDir)
  await util.ensureDir(util.join(taskDir, config.dirs.HOOKS))

  // Write main.md with frontmatter
  await writeFrontmatter(util.join(taskDir, config.files.MAIN), frontmatter)

  // Create empty status.md
  await util.write(util.join(taskDir, config.files.STATUS), '')

  return taskDir
}

/**
 * Create a new agent
 */
export const createAgent = async (
  slug: string,
  frontmatter: AgentFrontmatter,
): Promise<string> => {
  const agentDir = getAgentDir(slug)

  // Create directory structure
  await util.ensureDir(agentDir)

  // Write main.md with frontmatter
  await writeFrontmatter(util.join(agentDir, config.files.MAIN), frontmatter)

  return agentDir
}

/**
 * Get project metadata
 */
export const getProject = async (projectSlug: string): Promise<Partial<ProjectFrontmatter> | null> => {
  const mainPath = util.join(getProjectDir(projectSlug), config.files.MAIN)
  const exists = await util.fileExists(mainPath)
  if (!exists) {
    return null
  }
  return await readFrontmatter<ProjectFrontmatter>(mainPath)
}

/**
 * Get task metadata
 */
export const getTask = async (projectSlug: string, taskSlug: string): Promise<Partial<TaskFrontmatter> | null> => {
  const mainPath = util.join(getTaskDir(projectSlug, taskSlug), config.files.MAIN)
  const exists = await util.fileExists(mainPath)
  if (!exists) {
    return null
  }
  return await readFrontmatter<TaskFrontmatter>(mainPath)
}

/**
 * Get agent metadata
 */
export const getAgent = async (agentSlug: string): Promise<Partial<AgentFrontmatter> | null> => {
  const mainPath = util.join(getAgentDir(agentSlug), config.files.MAIN)
  const exists = await util.fileExists(mainPath)
  if (!exists) {
    return null
  }
  return await readFrontmatter<AgentFrontmatter>(mainPath)
}

/**
 * Update project metadata
 */
export const updateProject = async (
  projectSlug: string,
  updates: Partial<ProjectFrontmatter>,
): Promise<Partial<ProjectFrontmatter>> => {
  const mainPath = util.join(getProjectDir(projectSlug), config.files.MAIN)
  return await updateFrontmatter(mainPath, updates)
}

/**
 * Update task metadata
 */
export const updateTask = async (
  projectSlug: string,
  taskSlug: string,
  updates: Partial<TaskFrontmatter>,
): Promise<Partial<TaskFrontmatter>> => {
  const mainPath = util.join(getTaskDir(projectSlug, taskSlug), config.files.MAIN)
  return await updateFrontmatter(mainPath, updates)
}

/**
 * Read all files in a task for context ingestion
 */
export const ingestTask = async (projectSlug: string, taskSlug: string): Promise<string> => {
  const taskDir = getTaskDir(projectSlug, taskSlug)
  const projectDir = getProjectDir(projectSlug)
  const files: string[] = []

  // Read project context
  const projectMain = util.join(projectDir, config.files.MAIN)
  if (await util.fileExists(projectMain)) {
    files.push(`## Project: ${projectSlug}\n\n${await util.read(projectMain)}`)
  }

  // Read task files
  const taskMain = util.join(taskDir, config.files.MAIN)
  if (await util.fileExists(taskMain)) {
    files.push(`## Task: ${taskSlug}\n\n${await util.read(taskMain)}`)
  }

  const taskStatus = util.join(taskDir, config.files.STATUS)
  if (await util.fileExists(taskStatus)) {
    files.push(`## Task Status Log\n\n${await util.read(taskStatus)}`)
  }

  return files.join('\n\n---\n\n')
}

/**
 * Read all files in a project for context ingestion
 */
export const ingestProject = async (projectSlug: string): Promise<string> => {
  const projectDir = getProjectDir(projectSlug)
  const files: string[] = []

  // Read project files
  const projectMain = util.join(projectDir, config.files.MAIN)
  if (await util.fileExists(projectMain)) {
    files.push(`## Project: ${projectSlug}\n\n${await util.read(projectMain)}`)
  }

  const projectStatus = util.join(projectDir, config.files.STATUS)
  if (await util.fileExists(projectStatus)) {
    files.push(`## Project Status Log\n\n${await util.read(projectStatus)}`)
  }

  // Read all task main.md files
  const tasks = await listTasks(projectSlug)
  for (const taskSlug of tasks) {
    const taskMain = util.join(getTaskDir(projectSlug, taskSlug), config.files.MAIN)
    if (await util.fileExists(taskMain)) {
      files.push(`## Task: ${taskSlug}\n\n${await util.read(taskMain)}`)
    }
  }

  return files.join('\n\n---\n\n')
}

/**
 * Read multiple files for context ingestion
 */
export const ingestFiles = async (filePaths: string[]): Promise<string> => {
  const files: string[] = []

  for (const filePath of filePaths) {
    if (await util.fileExists(filePath)) {
      const content = await util.read(filePath)
      files.push(`## ${path.basename(filePath)}\n\n${content}`)
    }
  }

  return files.join('\n\n---\n\n')
}

export default {
  getProjectDir,
  getTaskDir,
  getAgentDir,
  listProjects,
  listTasks,
  listAgents,
  createProject,
  createTask,
  createAgent,
  getProject,
  getTask,
  getAgent,
  updateProject,
  updateTask,
  ingestTask,
  ingestProject,
  ingestFiles,
}
