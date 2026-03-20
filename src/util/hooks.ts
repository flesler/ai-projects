/** Hook system for pre/post action execution */

import { spawn } from 'child_process'
import path from 'path'
import util from './index.js'

/** Hook types */
export type HookType
  = | 'pre-create'
    | 'post-create'
    | 'pre-complete'
    | 'post-complete'
    | 'pre-start'
    | 'post-start'
    | 'pre-update'
    | 'post-update'

/** Hook execution context */
export interface HookContext {
  project?: string
  task?: string
  action: string
  entityType: 'project' | 'task'
}

/** Supported hook extensions */
const HOOK_EXTENSIONS = ['.ts', '.js', '.sh', '.py']

/**
 * Find all hooks of a given type in a directory
 */
export const findHooks = async (directory: string, hookType: HookType): Promise<string[]> => {
  const hooksDir = path.join(directory, 'hooks')
  const exists = await util.fileExists(hooksDir)
  if (!exists) {
    return []
  }

  const files = await util.listDir(hooksDir)
  const hooks: string[] = []

  for (const file of files) {
    const baseName = path.basename(file)
    for (const ext of HOOK_EXTENSIONS) {
      if (baseName === `${hookType}${ext}`) {
        hooks.push(path.join(hooksDir, file))
      }
    }
  }

  return hooks
}

/**
 * Execute a hook script
 * Returns true if successful, false if failed
 */
export const executeHook = async (hookPath: string, context: HookContext): Promise<boolean> => {
  const exists = await util.fileExists(hookPath)
  if (!exists) {
    return true
  }

  // Set up environment for hook
  const env = {
    ...process.env,
    HOOK_TYPE: context.action,
    ENTITY_TYPE: context.entityType,
    ...(context.project ? { PROJECT_SLUG: context.project } : {}),
    ...(context.task ? { TASK_SLUG: context.task } : {}),
  }

  return new Promise((resolve) => {
    const ext = path.extname(hookPath)
    let command: string
    let args: string[]

    // Determine how to execute based on extension
    if (ext === '.ts') {
      command = 'tsx'
      args = [hookPath]
    } else if (ext === '.js') {
      command = 'node'
      args = [hookPath]
    } else if (ext === '.sh') {
      command = 'bash'
      args = [hookPath]
    } else if (ext === '.py') {
      command = 'python3'
      args = [hookPath]
    } else {
      console.error(`Unknown hook extension: ${ext}`)
      resolve(false)
      return
    }

    const proc = spawn(command, args, {
      stdio: 'inherit',
      env,
      cwd: path.dirname(hookPath),
    })

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(true)
      } else {
        console.error(`Hook ${hookPath} failed with exit code ${code}`)
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
    const success = await executeHook(hook, context)
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
