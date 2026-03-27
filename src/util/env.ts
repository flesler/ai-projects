/** Load .env and read environment variables */

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import config from './config'

const findRoot = (): string => {
  const filename = fileURLToPath(import.meta.url)
  let currentDir = path.dirname(filename)
  const maxDepth = 10
  for (let i = 0; i < maxDepth; i++) {
    try {
      if (fs.existsSync(path.join(currentDir, 'package.json'))) {
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
  return process.cwd()
}

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

const ROOT = findRoot()
let envHome = process.env.AIP_HOME
if (!envHome) {
  dotenv.config({ path: path.join(ROOT, '.env'), quiet: true })
  envHome = process.env.AIP_HOME
}
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

/** Configuration from .env. AIP_HOME = base directory, projects in AIP_HOME/projects/ */
const env = {
  ROOT,
  AIP_HOME: envHome,
} as const

export default env
