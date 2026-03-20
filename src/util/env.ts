/** Environment utilities for project/task context */

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
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
      const hasPackageJson = fs.existsSync(path.join(currentDir, 'package.json'))
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

// Load .env from root
dotenv.config({ path: path.join(ROOT, '.env') })

const defaultHome = path.join(ROOT, 'tmp', 'hermes')

/** Configuration from environment */
export const config = {
  ROOT,
  PROJECTS_HOME: process.env.PROJECTS_HOME
    ? path.isAbsolute(process.env.PROJECTS_HOME)
      ? process.env.PROJECTS_HOME
      : path.join(ROOT, process.env.PROJECTS_HOME)
    : defaultHome,
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const

/**
 * Infer project slug from current working directory
 * Returns null if not in a project directory
 */
export const getProjectFromPwd = (pwd: string = process.cwd()): string | null => {
  // Expected structure: PROJECTS_HOME/{project-slug}/tasks/{task-slug}
  // or PROJECTS_HOME/{project-slug}/
  const relative = path.relative(config.PROJECTS_HOME, pwd)
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
  const relative = path.relative(config.PROJECTS_HOME, pwd)
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
    throw new Error(`Not in a project directory. PWD: ${pwd}, PROJECTS_HOME: ${config.PROJECTS_HOME}`)
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

export default {
  ...config,
  getProjectFromPwd,
  getTaskFromPwd,
  getCurrentContext,
  requireProject,
  requireTask,
  exportContext,
}
