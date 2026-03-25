/** Load .env and read environment variables */

import dotenv from 'dotenv'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

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
if (envHome?.startsWith('~')) {
  envHome = path.join(os.homedir(), envHome.slice(1))
}
if (!envHome || !path.isAbsolute(envHome)) {
  console.error('AIP_HOME env var must be set and be an absolute path', envHome || '')
  process.exit(1)
}

/** Configuration from .env. TEAM_HOME = base (tmp/hermes), projects in TEAM_HOME/projects/ */
const env = {
  ROOT,
  AIP_HOME: envHome,
  NODE_ENV: optionalString('NODE_ENV', 'development'),
} as const

export default env
