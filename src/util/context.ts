/** Project/task context from $PWD */

import path from 'path'
import util from './index.js'
import config from './config.js'
import env from './env.js'

const projectsDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS)

export const getProjectFromPwd = (pwd: string = process.cwd()): string | null => {
  const relative = path.relative(projectsDir, pwd)
  if (!relative || relative.startsWith('..')) {
    return null
  }
  const parts = relative.split(path.sep).filter(Boolean)
  if (parts.length === 0) {
    return null
  }
  return parts[0]
}

export const getTaskFromPwd = (pwd: string = process.cwd()): string | null => {
  const relative = path.relative(projectsDir, pwd)
  if (!relative || relative.startsWith('..')) {
    return null
  }
  const parts = relative.split(path.sep).filter(Boolean)
  if (parts.length < 3 || parts[1] !== config.dirs.TASKS) {
    return null
  }
  return parts[2]
}

export const getCurrentContext = (pwd: string = process.cwd()): {
  project: string | null
  task: string | null
} => {
  return {
    project: getProjectFromPwd(pwd),
    task: getTaskFromPwd(pwd),
  }
}

export const requireProject = (pwd: string = process.cwd()): string => {
  const project = getProjectFromPwd(pwd)
  if (!project) {
    throw new Error(`Not in a project directory. PWD: ${pwd}, projects: ${projectsDir}`)
  }
  return project
}

export const requireTask = (pwd: string = process.cwd()): { project: string; task: string } => {
  const context = getCurrentContext(pwd)
  if (!context.project || !context.task) {
    throw new Error(`Not in a task directory. PWD: ${pwd}`)
  }
  return { project: context.project, task: context.task }
}

export const exportContext = (pwd: string = process.cwd()): string => {
  const context = getCurrentContext(pwd)
  const lines: string[] = []
  if (context.project) {
    lines.push(`export CURRENT_PROJECT="${context.project}"`)
  }
  if (context.task) {
    lines.push(`export CURRENT_TASK="${context.task}"`)
  }
  if (process.env.CURRENT_AGENT) {
    lines.push(`export CURRENT_AGENT="${process.env.CURRENT_AGENT}"`)
  }
  return lines.join('\n')
}

export const getTargetDir = (
  target?: 'project' | 'task',
  pwd: string = process.cwd(),
): {
  targetDir: string
  projectDir: string
  entityType: 'project' | 'task'
} => {
  const context = getCurrentContext(pwd)

  if (target === 'project') {
    const project = getProjectFromPwd(pwd)
    if (!project) {
      throw new Error('Not in a project directory. Use --project flag or cd into a project.')
    }
    const projectDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS, project)
    return { targetDir: projectDir, projectDir, entityType: 'project' }
  }

  if (target === 'task') {
    if (!context.project || !context.task) {
      throw new Error('Not in a task directory. Use --project and --task flags or cd into a task.')
    }
    const projectDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS, context.project)
    const targetDir = util.join(projectDir, config.dirs.TASKS, context.task)
    return { targetDir, projectDir, entityType: 'task' }
  }

  if (context.task && context.project) {
    const projectDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS, context.project)
    const targetDir = util.join(projectDir, config.dirs.TASKS, context.task)
    return { targetDir, projectDir, entityType: 'task' }
  }

  if (context.project) {
    const projectDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS, context.project)
    return { targetDir: projectDir, projectDir, entityType: 'project' }
  }

  throw new Error('Not in a project or task directory. Specify --target flag.')
}

export default {
  getProjectFromPwd,
  getTaskFromPwd,
  getCurrentContext,
  requireProject,
  requireTask,
  exportContext,
  getTargetDir,
}
