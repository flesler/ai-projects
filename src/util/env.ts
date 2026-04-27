/** Read environment variables */
import dotenv from 'dotenv'
import path from 'path'
import config from './config'

export function optionalString(key: string): string | undefined
export function optionalString(key: string, defaultValue: string): string
export function optionalString(key: string, defaultValue?: string): string | undefined {
  return process.env[key] ?? defaultValue
}

export function requiredString(key: string): string {
  const value = optionalString(key)
  if (typeof value !== 'string' || !value) {
    throw new Error(`Environment variable ${key} is required`)
  }
  return value
}

export function boolean(key: string, defaultValue = false): boolean {
  const val = process.env[key]
  return (val === 'true' || val === '1') ?? defaultValue
}

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ quiet: true, override: true })
}

/**
 * Determine AIP_HOME directory
 * 1. Use AIP_HOME env var if set (from ~/.bashrc or similar)
 * 2. Otherwise, auto-detect by traversing up from CWD looking for standard dirs
 */
let envHome = process.env.AIP_HOME
if (!envHome) {
  envHome = process.cwd()
  const candidates = envHome.split(path.sep)
  for (const dir of [config.dirs.PROJECTS, config.dirs.SKILLS, config.dirs.AGENTS]) {
    const index = candidates.indexOf(dir)
    if (index !== -1) {
      // Detect we are in a sub-dir
      envHome = candidates.slice(0, index).join(path.sep)
      break
    }
  }
}

/** Configuration. AIP_HOME = base directory, projects in AIP_HOME/projects/ */
const env = {
  AIP_HOME: envHome,
  ERROR_LOG: process.env.AIP_ERROR_LOG,
} as const

export default env
