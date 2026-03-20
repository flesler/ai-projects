/** Status logging utilities for append-only activity logs */

import util from './index.js'
import env from './env.js'
import path from 'path'

/**
 * Standardized log format: timestamp | agent | text
 */
export const formatLogEntry = (text: string, agent?: string): string => {
  const timestamp = new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '')
  const agentPart = agent ? ` | ${agent}` : ''
  return `[${timestamp}${agentPart}] ${text}\n`
}

/**
 * Append a standardized entry to status.md
 * Creates the file if it doesn't exist
 */
export const appendStatus = async (directory: string, text: string, agent?: string): Promise<void> => {
  const statusPath = util.join(directory, 'status.md')
  const logEntry = formatLogEntry(text, agent)

  // Append to file (create if doesn't exist)
  await util.write(statusPath, logEntry)
}

/**
 * Append to status.md only if it exists (doesn't create)
 * Used for optional logging
 */
export const appendStatusIfExists = async (directory: string, text: string, agent?: string): Promise<boolean> => {
  const statusPath = util.join(directory, 'status.md')
  const exists = await util.fileExists(statusPath)
  if (!exists) {
    return false
  }
  const logEntry = formatLogEntry(text, agent)
  await util.write(statusPath, logEntry)
  return true
}

/**
 * Read status history from status.md
 */
export const readStatus = async (directory: string): Promise<string> => {
  const statusPath = util.join(directory, 'status.md')
  const exists = await util.fileExists(statusPath)
  if (!exists) {
    return ''
  }
  return await util.read(statusPath)
}

/**
 * Get current agent from environment
 */
export const getCurrentAgent = (): string | undefined => {
  return process.env.CURRENT_AGENT
}

/**
 * Log to current task's status.md (from $PWD)
 */
export const logTask = async (text: string, agent?: string): Promise<void> => {
  const context = env.getCurrentContext()
  if (!context.project || !context.task) {
    throw new Error('Not in a task directory')
  }
  const taskDir = path.join(env.PROJECTS_HOME, context.project, 'tasks', context.task)
  await appendStatus(taskDir, text, agent || getCurrentAgent())
}

/**
 * Log to current project's status.md (from $PWD)
 */
export const logProject = async (text: string, agent?: string): Promise<void> => {
  const project = env.getProjectFromPwd()
  if (!project) {
    throw new Error('Not in a project directory')
  }
  const projectDir = path.join(env.PROJECTS_HOME, project)
  await appendStatus(projectDir, text, agent || getCurrentAgent())
}

/**
 * Log a status change with optional summary
 */
export const logStatusChange = async (
  directory: string,
  action: string,
  details?: Record<string, any>,
  agent?: string,
): Promise<void> => {
  let entry = action

  if (details && Object.keys(details).length > 0) {
    const detailStr = Object.entries(details)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ')
    entry = `${action}: ${detailStr}`
  }

  await appendStatus(directory, entry, agent)
}

export default {
  formatLogEntry,
  appendStatus,
  appendStatusIfExists,
  readStatus,
  getCurrentAgent,
  logTask,
  logProject,
  logStatusChange,
}
