/** Frontmatter parsing and writing utilities */

import yaml from 'yaml'
import util from './index.js'

/** Project frontmatter structure */
export interface ProjectFrontmatter {
  name: string
  description: string
  status?: string
  assignee?: string
  created?: string
}

/** Task frontmatter structure */
export interface TaskFrontmatter {
  name: string
  description?: string
  assignee?: string
  status?: string
  created?: string
}

/** Agent frontmatter structure */
export interface AgentFrontmatter {
  name: string
  description?: string
  status?: string
  created?: string
}

/** Generic frontmatter type */
export type AnyFrontmatter = ProjectFrontmatter | TaskFrontmatter | AgentFrontmatter

/**
 * Parse YAML frontmatter from markdown content
 * Returns { frontmatter, content } or null if no frontmatter found
 */
export const parseFrontmatter = <T extends AnyFrontmatter>(content: string): { frontmatter: Partial<T>; content: string } | null => {
  const trimmed = content.trim()
  if (!trimmed.startsWith('---')) {
    return null
  }

  const match = trimmed.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) {
    return null
  }

  const frontmatter = yaml.parse(match[1]) as T
  return { frontmatter, content: match[2].trim() }
}

/**
 * Write frontmatter + content to markdown
 */
export const writeFrontmatter = async (filePath: string, frontmatter: AnyFrontmatter, content: string = ''): Promise<void> => {
  const yamlContent = yaml.stringify(frontmatter).trim()
  const markdown = `---\n${yamlContent}\n---\n\n${content}`.trim()
  await util.write(filePath, markdown + '\n')
}

/**
 * Update specific frontmatter fields in a file
 */
export const updateFrontmatter = async <T extends AnyFrontmatter>(
  filePath: string,
  updates: Partial<T>,
): Promise<T> => {
  const content = await util.read(filePath)
  const parsed = parseFrontmatter<T>(content)

  if (!parsed) {
    throw new Error(`No frontmatter found in ${filePath}`)
  }

  const updated = { ...parsed.frontmatter, ...updates } as T
  await writeFrontmatter(filePath, updated, parsed.content)
  return updated
}

/**
 * Read and parse frontmatter from a file
 */
export const readFrontmatter = async <T extends AnyFrontmatter>(filePath: string): Promise<Partial<T>> => {
  const content = await util.read(filePath)
  const parsed = parseFrontmatter<T>(content)

  if (!parsed) {
    throw new Error(`No frontmatter found in ${filePath}`)
  }

  return parsed.frontmatter
}
