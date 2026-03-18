/**
 * Simple logger with colors
 */

const colors = {
  reset: '\x1b[0m',
  blue: '\x1b[0;34m',
  green: '\x1b[0;32m',
  yellow: '\x1b[1;33m',
  red: '\x1b[0;31m',
  cyan: '\x1b[0;36m',
} as const

type LogLevel = 'info' | 'success' | 'warning' | 'error'

export function log(message: string, level: LogLevel = 'info'): void {
  const prefix = {
    info: `${colors.blue}ℹ️${colors.reset}`,
    success: `${colors.green}✅${colors.reset}`,
    warning: `${colors.yellow}⚠️${colors.reset}`,
    error: `${colors.red}❌${colors.reset}`,
  }[level]
  
  console.log(`${prefix}  ${message}${colors.reset}`)
}

export function logInfo(message: string): void {
  log(message, 'info')
}

export function logSuccess(message: string): void {
  log(message, 'success')
}

export function logWarning(message: string): void {
  log(message, 'warning')
}

export function logError(message: string): void {
  log(message, 'error')
}
