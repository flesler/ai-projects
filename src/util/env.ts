/* eslint-disable @typescript-eslint/no-unused-vars */
import dotenv from 'dotenv'
import os from 'os'
import util from './index.js'

function optionalString(key: string): string | undefined
function optionalString(key: string, defaultValue: string): string
function optionalString(key: string, defaultValue?: string): string | undefined {
  return process.env[key] ?? defaultValue
}

// @ts-expect-error - unused function
function requiredString(key: string): string {
  const value = optionalString(key)
  if (typeof value !== 'string' || !value) {
    throw new Error(`Environment variable ${key} is required`)
  }
  return value
}

// @ts-expect-error - unused function
function boolean(key: string, defaultValue = false): boolean {
  const val = process.env[key]
  return (val === 'true' || val === '1') ?? defaultValue
}

dotenv.config()

const defaultHome = util.join(os.homedir(), 'projects')

export default {
  PROJECTS_HOME: optionalString('PROJECTS_HOME', defaultHome),
  NODE_ENV: optionalString('NODE_ENV', 'development'),
} as const
