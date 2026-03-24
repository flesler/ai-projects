/** Status logging utilities for append-only activity logs */

import util from './index.js'
import config from './config.js'
import env from './env.js'
import ctx from './context.js'

const status = {
  /**
   * Standardized log format: timestamp | agent | text
   */
  formatLogEntry(text: string, agent?: string): string {
    const timestamp = new Date().toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '')
    const agentPart = agent ? ` | ${agent}` : ''
    return `[${timestamp}${agentPart}] ${text}\n`
  },

  /**
   * Append a standardized entry to status.md
   */
  async appendStatus(directory: string, text: string, agent?: string): Promise<void> {
    const statusPath = util.join(directory, config.files.STATUS)
    const logEntry = this.formatLogEntry(text, agent)
    await util.write(statusPath, logEntry)
  },

  /**
   * Append to status.md only if it exists
   */
  async appendStatusIfExists(directory: string, text: string, agent?: string): Promise<boolean> {
    const statusPath = util.join(directory, config.files.STATUS)
    const exists = await util.fileExists(statusPath)
    if (!exists) {
      return false
    }
    const logEntry = this.formatLogEntry(text, agent)
    await util.write(statusPath, logEntry)
    return true
  },

  /**
   * Read status history from status.md
   */
  async readStatus(directory: string): Promise<string> {
    const statusPath = util.join(directory, config.files.STATUS)
    const exists = await util.fileExists(statusPath)
    if (!exists) {
      return ''
    }
    return await util.read(statusPath)
  },

  /**
   * Get current agent from environment
   */
  getCurrentAgent(): string | undefined {
    return process.env.CURRENT_AGENT
  },

  /**
   * Log to current task's status.md
   */
  async logTask(text: string, agent?: string): Promise<void> {
    const context = ctx.getCurrentContext()
    if (!context.project || !context.task) {
      throw new Error('Not in a task directory')
    }
    const taskDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS, context.project, config.dirs.TASKS, context.task)
    await this.appendStatus(taskDir, text, agent || this.getCurrentAgent())
  },

  /**
   * Log to current project's status.md
   */
  async logProject(text: string, agent?: string): Promise<void> {
    const project = ctx.getProjectFromPwd()
    if (!project) {
      throw new Error('Not in a project directory')
    }
    const projectDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS, project)
    await this.appendStatus(projectDir, text, agent || this.getCurrentAgent())
  },

  /**
   * Log a status change with optional summary
   */
  async logStatusChange(
    directory: string,
    action: string,
    details?: Record<string, any>,
    agent?: string,
  ): Promise<void> {
    let entry = action

    if (details && Object.keys(details).length > 0) {
      const detailStr = Object.entries(details)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ')
      entry = `${action}: ${detailStr}`
    }

    await this.appendStatus(directory, entry, agent)
  },
}

export default status
