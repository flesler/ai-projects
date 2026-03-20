/** Status logging utilities for append-only activity logs */

import util from './index.js'

/**
 * Append a timestamped entry to status.md
 */
export const appendStatus = async (directory: string, entry: string): Promise<void> => {
  const statusPath = util.join(directory, 'status.md')
  const timestamp = new Date().toISOString()
  const logEntry = `[${timestamp}] ${entry}\n`

  // Append to file (create if doesn't exist)
  await util.write(statusPath, logEntry)
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
 * Log a status change with optional summary
 */
export const logStatusChange = async (
  directory: string,
  action: string,
  details?: Record<string, any>,
): Promise<void> => {
  let entry = action

  if (details && Object.keys(details).length > 0) {
    const detailStr = Object.entries(details)
      .map(([key, value]) => `${key}=${value}`)
      .join(', ')
    entry = `${action}: ${detailStr}`
  }

  await appendStatus(directory, entry)
}

export default {
  appendStatus,
  readStatus,
  logStatusChange,
}
