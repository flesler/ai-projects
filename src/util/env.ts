/**
 * Environment configuration
 */

export const CONFIG = {
  /** Default state directory for Hermes Agent */
  DEFAULT_STATE_DIR: '/mnt/ssd/pi/.hermes',

  /** Project directory */
  PROJECTS_DIR: 'projects',

  /** Skills directory */
  SKILLS_DIR: 'skills',

  /** Agents directory */
  AGENTS_DIR: 'agents',
} as const

export function getStateDir(): string {
  return process.env.AIP_STATE_DIR || CONFIG.DEFAULT_STATE_DIR
}

export function getProjectsDir(): string {
  return `${getStateDir()}/${CONFIG.PROJECTS_DIR}`
}

export function getSkillsDir(): string {
  return `${getStateDir()}/${CONFIG.SKILLS_DIR}`
}

export function getAgentsDir(): string {
  return `${getStateDir()}/${CONFIG.AGENTS_DIR}`
}
