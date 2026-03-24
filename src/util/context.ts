/** Project/task context from $PWD */

import path from 'path'
import util from './index.js'
import config from './config.js'
import env from './env.js'

const projectsDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS)

const context = {
  getProjectFromPwd(pwd: string = process.cwd()): string | null {
    const relative = path.relative(projectsDir, pwd)
    if (!relative || relative.startsWith('..')) {
      return null
    }
    const parts = relative.split(path.sep).filter(Boolean)
    if (parts.length === 0) {
      return null
    }
    return parts[0]
  },

  getTaskFromPwd(pwd: string = process.cwd()): string | null {
    const relative = path.relative(projectsDir, pwd)
    if (!relative || relative.startsWith('..')) {
      return null
    }
    const parts = relative.split(path.sep).filter(Boolean)
    if (parts.length < 3 || parts[1] !== config.dirs.TASKS) {
      return null
    }
    return parts[2]
  },

  getCurrentContext(pwd: string = process.cwd()): {
    project: string | null
    task: string | null
  } {
    return {
      project: this.getProjectFromPwd(pwd),
      task: this.getTaskFromPwd(pwd),
    }
  },

  requireProject(pwd: string = process.cwd()): string {
    const project = this.getProjectFromPwd(pwd)
    if (!project) {
      throw new Error(`Not in a project directory. PWD: ${pwd}, projects: ${projectsDir}`)
    }
    return project
  },

  requireTask(pwd: string = process.cwd()): { project: string; task: string } {
    const ctx = this.getCurrentContext(pwd)
    if (!ctx.project || !ctx.task) {
      throw new Error(`Not in a task directory. PWD: ${pwd}`)
    }
    return { project: ctx.project, task: ctx.task }
  },

  exportContext(pwd: string = process.cwd()): string {
    const ctx = this.getCurrentContext(pwd)
    const lines: string[] = []
    if (ctx.project) {
      lines.push(`export CURRENT_PROJECT="${ctx.project}"`)
    }
    if (ctx.task) {
      lines.push(`export CURRENT_TASK="${ctx.task}"`)
    }
    if (process.env.CURRENT_AGENT) {
      lines.push(`export CURRENT_AGENT="${process.env.CURRENT_AGENT}"`)
    }
    return lines.join('\n')
  },

  getTargetDir(
    target?: 'project' | 'task',
    pwd: string = process.cwd(),
  ): {
    targetDir: string
    projectDir: string
    entityType: 'project' | 'task'
  } {
    const ctx = this.getCurrentContext(pwd)

    if (target === 'project') {
      const project = this.getProjectFromPwd(pwd)
      if (!project) {
        throw new Error('Not in a project directory. Use --project flag or cd into a project.')
      }
      const projectDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS, project)
      return { targetDir: projectDir, projectDir, entityType: 'project' }
    }

    if (target === 'task') {
      if (!ctx.project || !ctx.task) {
        throw new Error('Not in a task directory. Use --project and --task flags or cd into a task.')
      }
      const projectDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS, ctx.project)
      const targetDir = util.join(projectDir, config.dirs.TASKS, ctx.task)
      return { targetDir, projectDir, entityType: 'task' }
    }

    if (ctx.task && ctx.project) {
      const projectDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS, ctx.project)
      const targetDir = util.join(projectDir, config.dirs.TASKS, ctx.task)
      return { targetDir, projectDir, entityType: 'task' }
    }

    if (ctx.project) {
      const projectDir = util.join(env.TEAM_HOME, config.dirs.PROJECTS, ctx.project)
      return { targetDir: projectDir, projectDir, entityType: 'project' }
    }

    throw new Error('Not in a project or task directory. Specify --target flag.')
  },
}

export default context
