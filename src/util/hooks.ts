/** Hook system for pre/post action execution */

import { spawn } from 'child_process'
import path from 'path'
import util from './index.js'
import config from './config.js'
import env from './env.js'

/** Hook types - re-export from config for type safety */
export type HookType = typeof config.hookTypes[number]

/** Hook execution context */
export interface HookContext {
  project?: string
  task?: string
  action: string
  entityType: 'project' | 'task'
}

/**
 * Find all hooks of a given type in a directory.
 * Extension-agnostic: matches hookType.* (e.g. post-complete.ts, post-complete.sh).
 * Shebang in the file determines how it runs.
 */
export const findHooks = async (directory: string, hookType: HookType): Promise<string[]> => {
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
}

/**
 * Execute a hook script.
 * Extension-agnostic: runs the file directly, shebang handles interpreter.
 * Env: PROJECT_SLUG, TASK_SLUG, TARGET_DIR, PROJECT_DIR, TASK_DIR (when applicable), HOOK_TYPE, ENTITY_TYPE.
 */
export const executeHook = async (
  hookPath: string,
  context: HookContext,
  targetDir: string,
): Promise<boolean> => {
  const exists = await util.fileExists(hookPath)
  if (!exists) {
    return true
  }

  const projectDir = context.project
    ? util.join(env.TEAM_HOME, config.dirs.PROJECTS, context.project)
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
      stdio: 'inherit',
      env: hookEnv,
      cwd: path.dirname(hookPath),
      shell: false,
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
}

/**
 * Run all hooks of a given type for a project/task
 * For pre-hooks: returns false if any hook fails (should prevent action)
 * For post-hooks: logs failures but doesn't prevent action
 */
export const runHooks = async (
  directory: string,
  hookType: HookType,
  context: HookContext,
): Promise<boolean> => {
  const hooks = await findHooks(directory, hookType)
  const isPreHook = hookType.startsWith('pre-')

  for (const hook of hooks) {
    const success = await executeHook(hook, context, directory)
    if (!success && isPreHook) {
      // Pre-hook failed, prevent action
      return false
    }
  }

  return true
}

/**
 * Run hooks for both project and task levels
 */
export const runHooksForContext = async (
  projectDir: string,
  taskDir: string | undefined,
  hookType: HookType,
  context: HookContext,
): Promise<boolean> => {
  // Run project-level hooks first
  const projectSuccess = await runHooks(projectDir, hookType, context)
  if (!projectSuccess) {
    return false
  }

  // Then task-level hooks (if applicable)
  if (taskDir) {
    const taskSuccess = await runHooks(taskDir, hookType, context)
    if (!taskSuccess) {
      return false
    }
  }

  return true
}

export default {
  findHooks,
  executeHook,
  runHooks,
  runHooksForContext,
}
