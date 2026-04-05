/** Status logging utilities for append-only TSV activity logs */

import config from './config.js'
import ctx from './context.js'
import util from './index.js'

const status = {
  /**
   * Format a TSV entry: date\ttime\tentityType\slug\action\text
   */
  formatEntry(entityType: string, slug: string, action: string, text: string): string {
    const now = new Date()
    const date = now.toISOString().split('T')[0]
    const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    return `${date}\t${time}\t${entityType}\t${slug}\t${action}\t${text}\n`
  },

  /**
   * Append a TSV entry to status.tsv
   * Columns: dateTime, entityType, slug, action, text (tab-separated, no headers)
   * Action types: created, updated, log
   */
  async appendStatus(directory: string, entityType: string, slug: string, action: string, text: string): Promise<void> {
    const statusPath = util.join(directory, config.files.STATUS)
    const entry = this.formatEntry(entityType, slug, action, text)
    await util.append(statusPath, entry)
  },

  /**
   * Append to status.tsv only if it exists
   */
  async appendStatusIfExists(directory: string, entityType: string, slug: string, action: string, text: string): Promise<boolean> {
    const statusPath = util.join(directory, config.files.STATUS)
    const exists = await util.fileExists(statusPath)
    if (!exists) {
      return false
    }
    const entry = this.formatEntry(entityType, slug, action, text)
    await util.append(statusPath, entry)
    return true
  },

  /**
   * Read status history from status.tsv
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
   * Log to current task's status.tsv
   */
  async logTask(slug: string, text: string, agent?: string): Promise<void> {
    const context = ctx.getCurrentContext()
    if (!context.project || !context.task) {
      throw new Error('Not in a task directory')
    }
    const taskDir = util.joinHome(config.dirs.PROJECTS, context.project, config.dirs.TASKS, context.task)
    await this.appendStatus(taskDir, 'task', slug, 'log', agent ? `${agent}: ${text}` : text)
  },

  /**
   * Log to current project's status.tsv
   */
  async logProject(slug: string, text: string, agent?: string): Promise<void> {
    const project = ctx.getProjectFromPwd()
    if (!project) {
      throw new Error('Not in a project directory')
    }
    const projectDir = util.joinHome(config.dirs.PROJECTS, project)
    await this.appendStatus(projectDir, 'project', slug, 'log', agent ? `${agent}: ${text}` : text)
  },

  /**
   * Log a status change with optional details
   */
  async logStatusChange(
    directory: string,
    entityType: string,
    slug: string,
    changeAction: string,
    details?: Record<string, any>,
    agent?: string,
  ): Promise<void> {
    let entry = changeAction

    if (details && Object.keys(details).length > 0) {
      const detailStr = Object.entries(details)
        .map(([key, value]) => `${key}=${value}`)
        .join(', ')
      entry = `${changeAction}: ${detailStr}`
    }

    await this.appendStatus(directory, entityType, slug, 'updated', agent ? `${agent} | ${entry}` : entry)
  },
}

export default status
