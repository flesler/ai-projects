/**
 * File system utilities
 */

import { mkdirSync, writeFileSync, readFileSync, existsSync, readdirSync } from 'fs'
import { dirname, join } from 'path'

/**
 * Ensure directory exists
 */
export function ensureDir(dirPath: string): void {
  if (!existsSync(dirPath)) {
    mkdirSync(dirPath, { recursive: true })
  }
}

/**
 * Write file, creating parent directories if needed
 */
export function writeFile(filePath: string, content: string): void {
  ensureDir(dirname(filePath))
  writeFileSync(filePath, content, 'utf8')
}

/**
 * Read file
 */
export function readFile(filePath: string): string {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`)
  }
  return readFileSync(filePath, 'utf8')
}

/**
 * Check if file exists
 */
export function fileExists(filePath: string): boolean {
  return existsSync(filePath)
}

/**
 * List directory contents
 */
export function listDir(dirPath: string): string[] {
  if (!existsSync(dirPath)) {
    return []
  }
  return readdirSync(dirPath)
}

/**
 * Join path segments safely
 */
export function joinPath(...segments: string[]): string {
  return join(...segments)
}
