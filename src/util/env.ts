/** Environment utilities for project/task context */

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import util from './index.js'
import { fileURLToPath } from 'url'

/**
 * Find the project root by looking for package.json
 */
const findRoot = (): string => {
  // Start from the directory of this file (in dist/)
  const filename = fileURLToPath(import.meta.url)
  let currentDir = path.dirname(filename)

  // Walk up the directory tree looking for package.json
  const maxDepth = 10
  for (let i = 0; i < maxDepth; i++) {
    try {
      const hasPackageJson = fs.existsSync(util.join(currentDir, 'package.json'))
      if (hasPackageJson) {
        return currentDir
      }

      const parentDir = path.dirname(currentDir)
      if (parentDir === currentDir) {
        break
      }
      currentDir = parentDir
    } catch {
      break
    }
  }

  // Fallback to cwd
  return process.cwd()
}

/** Project root directory */
const ROOT = findRoot()

// Load .env from root (silently, no tips)
dotenv.config({ path: util.join(ROOT, '.env'), quiet: true })

const defaultTeamHome = util.join(ROOT, 'tmp', 'hermes')

/** Configuration from environment. TEAM_HOME = base (tmp/hermes), projects live in TEAM_HOME/projects/ */
export const config = {
  ROOT,
  TEAM_HOME: process.env.TEAM_HOME
    ? path.isAbsolute(process.env.TEAM_HOME)
      ? process.env.TEAM_HOME
      : util.join(ROOT, process.env.TEAM_HOME)
    : defaultTeamHome,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const

/**
 * Infer project slug from current working directory
 * Returns null if not in a project directory
 */
const projectsDir = util.join(config.TEAM_HOME, 'projects')

export const getProjectFromPwd = (pwd: string = process.cwd()): string | null => {
  const relative = path.relative(projectsDir, pwd)
  if (!relative || relative.startsWith('..')) {
    return null
  }

  const parts = relative.split(path.sep).filter(Boolean)
  if (parts.length === 0) {
    return null
  }

  // First part is always project slug
  return parts[0]
}

/**
 * Infer task slug from current working directory
 * Returns null if not in a task directory
 */
export const getTaskFromPwd = (pwd: string = process.cwd()): string | null => {
  const relative = path.relative(projectsDir, pwd)
  if (!relative || relative.startsWith('..')) {
    return null
  }

  const parts = relative.split(path.sep).filter(Boolean)
  // Need at least: [project, tasks, task]
  if (parts.length < 3 || parts[1] !== 'tasks') {
    return null
  }

  return parts[2]
}

/**
 * Get current project and task from PWD
 */
export const getCurrentContext = (pwd: string = process.cwd()): {
  project: string | null
  task: string | null
} => {
  return {
    project: getProjectFromPwd(pwd),
    task: getTaskFromPwd(pwd),
  }
}

/**
 * Validate that current directory is within a project
 * Throws error if not
 */
export const requireProject = (pwd: string = process.cwd()): string => {
  const project = getProjectFromPwd(pwd)
  if (!project) {
    throw new Error(`Not in a project directory. PWD: ${pwd}, projects: ${projectsDir}`)
  }
  return project
}

/**
 * Validate that current directory is within a task
 * Throws error if not
 */
export const requireTask = (pwd: string = process.cwd()): { project: string; task: string } => {
  const context = getCurrentContext(pwd)
  if (!context.project || !context.task) {
    throw new Error(`Not in a task directory. PWD: ${pwd}`)
  }
  return { project: context.project, task: context.task }
}

/**
 * Export environment variables for current context
 * Returns shell commands to export
 */
export const exportContext = (pwd: string = process.cwd()): string => {
  const context = getCurrentContext(pwd)
  const lines: string[] = []

  if (context.project) {
    lines.push(`export CURRENT_PROJECT="${context.project}"`)
  }

  if (context.task) {
    lines.push(`export CURRENT_TASK="${context.task}"`)
  }

  // CURRENT_AGENT could come from config or environment
  if (process.env.CURRENT_AGENT) {
    lines.push(`export CURRENT_AGENT="${process.env.CURRENT_AGENT}"`)
  }

  return lines.join('\n')
}

/**
 * Get target directory for hooks based on current context or explicit target
 */
export const getTargetDir = (
  target?: 'project' | 'task',
  pwd: string = process.cwd(),
): {
  targetDir: string
  projectDir: string
  entityType: 'project' | 'task'
} => {
  const context = getCurrentContext(pwd)

  if (target === 'project') {
    const project = getProjectFromPwd(pwd)
    if (!project) {
      throw new Error('Not in a project directory. Use --project flag or cd into a project.')
    }
    const projectDir = util.join(config.TEAM_HOME, 'projects', project)
    return { targetDir: projectDir, projectDir, entityType: 'project' }
  }

  if (target === 'task') {
    if (!context.project || !context.task) {
      throw new Error('Not in a task directory. Use --project and --task flags or cd into a task.')
    }
    const projectDir = util.join(config.TEAM_HOME, 'projects', context.project)
    const targetDir = util.join(projectDir, 'tasks', context.task)
    return { targetDir, projectDir, entityType: 'task' }
  }

  // Auto-detect
  if (context.task && context.project) {
    const projectDir = util.join(config.TEAM_HOME, 'projects', context.project)
    const targetDir = util.join(projectDir, 'tasks', context.task)
    return { targetDir, projectDir, entityType: 'task' }
  }

  if (context.project) {
    const projectDir = util.join(config.TEAM_HOME, 'projects', context.project)
    return { targetDir: projectDir, projectDir, entityType: 'project' }
  }

  throw new Error('Not in a project or task directory. Specify --target flag.')
}

export default {
  ...config,
  getProjectFromPwd,
  getTaskFromPwd,
  getCurrentContext,
  requireProject,
  requireTask,
  exportContext,
  getTargetDir,
}
