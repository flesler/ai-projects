/** Hook system for pre/post action execution */

import { spawn } from 'child_process'
import path from 'path'
import config from './config.js'
import util from './index.js'

/** Hook types - re-export from config for type safety */
export type HookType = typeof config.hookTypes[number]

/** Hook execution context */
export interface HookContext {
  project?: string
  task?: string
  action: string
  entityType: 'project' | 'task'
}

const hooks = {
  /** Find all hooks of a given type in a directory. */
  async findHooks(directory: string, hookType: HookType): Promise<string[]> {
    const hooksDir = util.join(directory, config.dirs.HOOKS)
    const exists = await util.fileExists(hooksDir)
    if (!exists) {
      return []
    }

    const files = await util.listDir(hooksDir)
    const prefix = `${hookType}.`
    return files
      .filter(f => f.startsWith(prefix))
      .map(f => util.join(hooksDir, f))
  },

  /** Execute a hook script. */
  async executeHook(
    hookPath: string,
    context: HookContext,
    targetDir: string,
  ): Promise<boolean> {
    const exists = await util.fileExists(hookPath)
    if (!exists) {
      return true
    }

    const projectDir = context.project
      ? util.joinHome(config.dirs.PROJECTS, context.project)
      : targetDir
    const taskDir = context.task
      ? util.join(projectDir, config.dirs.TASKS, context.task)
      : ''

    const hookEnv = {
      ...process.env,
      HOOK_TYPE: context.action,
      ENTITY_TYPE: context.entityType,
      TARGET_DIR: targetDir,
      PROJECT_DIR: projectDir,
      ...(context.project ? { PROJECT_SLUG: context.project } : {}),
      ...(context.task ? { TASK_SLUG: context.task, TASK_DIR: taskDir } : {}),
    }

    return new Promise((resolve) => {
      const proc = spawn(hookPath, [], {
        stdio: 'inherit', env: hookEnv, cwd: targetDir, shell: false,
      })

      proc.on('close', (code, signal) => {
        if (code === 0) {
          resolve(true)
        } else {
          console.error(`Hook ${path.basename(hookPath)} failed (code=${code ?? signal})`)
          resolve(false)
        }
      })

      proc.on('error', (err) => {
        console.error(`Failed to execute hook ${hookPath}: ${err.message}`)
        resolve(false)
      })
    })
  },

  /** Run all hooks of a given type for a project/task */
  async runHooks(
    directory: string,
    hookType: HookType,
    context: HookContext,
  ): Promise<boolean> {
    const hooks = await this.findHooks(directory, hookType)
    const isPreHook = hookType.startsWith('pre-')

    for (const hook of hooks) {
      const success = await this.executeHook(hook, context, directory)
      if (!success && isPreHook) {
        return false
      }
    }

    return true
  },

  /** Run hooks for both project and task levels */
  async runHooksForContext(
    projectDir: string,
    taskDir: string | undefined,
    hookType: HookType,
    context: HookContext,
  ): Promise<boolean> {
    const projectSuccess = await this.runHooks(projectDir, hookType, context)
    if (!projectSuccess) {
      return false
    }

    if (taskDir) {
      const taskSuccess = await this.runHooks(taskDir, hookType, context)
      if (!taskSuccess) {
        return false
      }
    }

    return true
  },
}

export default hooks
