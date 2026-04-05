/** Log utilities for append-only TSV activity logs */

import config from './config.js'
import ctx from './context.js'
import util from './index.js'

const log = {
  /**
   * Format a TSV entry: date\ttime\tentityType\slug\action\text
   */
  formatEntry(entityType: string, slug: string, action: string, text: string): string {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const date = `${year}-${month}-${day}`
    return `${date}\t${time}\t${entityType}\t${slug}\t${action}\t${text}\n`
  },

  /**
   * Append a TSV entry to log.tsv
   * Columns: date, time, entityType, slug, action, text (tab-separated, no headers)
   * Action types: created, updated, log
   */
  async append(directory: string, entityType: string, slug: string, action: string, text: string): Promise<void> {
    const logPath = util.join(directory, config.files.LOG)
    const entry = this.formatEntry(entityType, slug, action, text)
    await util.append(logPath, entry)
  },

  /**
   * Read log history from log.tsv
   */
  async read(directory: string): Promise<string> {
    const logPath = util.join(directory, config.files.LOG)
    const exists = await util.fileExists(logPath)
    if (!exists) {
      return ''
    }
    return await util.read(logPath)
  },

  /**
   * Log to current task's log.tsv
   */
  async task(slug: string, text: string, agent?: string): Promise<void> {
    const context = ctx.getCurrentContext()
    if (!context.project || !context.task) {
      throw new Error('Not in a task directory')
    }
    const taskDir = util.joinHome(config.dirs.PROJECTS, context.project, config.dirs.TASKS, context.task)
    await this.append(taskDir, 'task', slug, 'log', agent ? `${agent}: ${text}` : text)
  },

  /**
   * Log to current project's log.tsv
   */
  async project(slug: string, text: string, agent?: string): Promise<void> {
    const project = ctx.getProjectFromPwd()
    if (!project) {
      throw new Error('Not in a project directory')
    }
    const projectDir = util.joinHome(config.dirs.PROJECTS, project)
    await this.append(projectDir, 'project', slug, 'log', agent ? `${agent}: ${text}` : text)
  },
}

export default log
