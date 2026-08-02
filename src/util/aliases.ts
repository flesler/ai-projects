import { logAlias } from './logError.js'
import type { Noun } from './types'

type CommandAlias = {
  noun: Noun
  verb: string
  prependArgs?: string[]
  /** When true, treat the 2nd+ positional as a `--log` value (for done/finish-style verbs). */
  joinTrailingAsLog?: boolean
}

/** Map (noun, aliasVerb) → real command. Prepended args are injected before the user's args. */
export const commandAliases: Partial<Record<Noun, Record<string, CommandAlias>>> = {
  task: {
    complete: { noun: 'task', verb: 'update', prependArgs: ['--status', 'done'], joinTrailingAsLog: true },
    done: { noun: 'task', verb: 'update', prependArgs: ['--status', 'done'], joinTrailingAsLog: true },
    stop: { noun: 'task', verb: 'update', prependArgs: ['--status', 'done'], joinTrailingAsLog: true },
    finish: { noun: 'task', verb: 'update', prependArgs: ['--status', 'done'], joinTrailingAsLog: true },
    log: { noun: 'log', verb: 'append' },
    show: { noun: 'task', verb: 'ingest' },
    status: { noun: 'task', verb: 'current' },
  },
  project: {
    stop: { noun: 'project', verb: 'update', prependArgs: ['--status', 'done'] },
    done: { noun: 'project', verb: 'update', prependArgs: ['--status', 'done'] },
  },
}

/** Map (noun, verb, wrongFlag) → real flag name */
export const argAliases: Partial<Record<Noun, Record<string, Record<string, string>>>> = {
  task: {
    update: {
      summary: 'log',
      message: 'log',
      note: 'log',
    },
  },
}

/** Resolve a command alias. Returns the real (noun, verb, args) triplet. */
export function resolveCommand(noun: string, verb: string, args: string[]): { noun: string; verb: string; args: string[] } {
  const alias = (commandAliases as Record<string, Record<string, CommandAlias> | undefined>)[noun]?.[verb]
  if (alias) {
    const original = `${noun} ${verb} ${args.join(' ')}`.trim()
    logAlias([noun, verb, ...args], original)

    // Special handling for 'status' alias: GET (no args) vs SET (with args)
    if (verb === 'status' && noun === 'task') {
      if (args.length === 0) {
        // GET: task status → task current
        return { noun: 'task', verb: 'current', args: [] }
      } else {
        // SET: task status <value> → task update --status <value>
        const transformedArgs = joinTrailingPositionalsAsLog(args)
        return { noun: 'task', verb: 'update', args: ['--status', ...transformedArgs] }
      }
    }

    // Special handling for 'log' alias: task log <slug> <message> → log append --task <slug> <message>
    if (verb === 'log' && noun === 'task') {
      if (args.length >= 2) {
        // Two or more positionals: first is task slug, rest is message
        const taskSlug = args[0]
        const message = args.slice(1).join(' ')
        return { noun: 'log', verb: 'append', args: ['--task', taskSlug, message] }
      } else if (args.length === 1) {
        // Single positional: if it contains spaces, it's a message; otherwise it's a task slug
        const onlyArg = args[0]
        if (onlyArg.includes(' ')) {
          // Multi-word single positional: treat as message (pass through as-is)
          return { noun: 'log', verb: 'append', args: [onlyArg] }
        } else {
          // Single token: treat as task slug, no message (will prompt or use default)
          return { noun: 'log', verb: 'append', args: ['--task', onlyArg] }
        }
      }
      // No args: pass through to log append (will prompt for message)
      return { noun: 'log', verb: 'append', args: [] }
    }

    const transformedArgs = alias.joinTrailingAsLog ? joinTrailingPositionalsAsLog(args) : args
    return { noun: alias.noun, verb: alias.verb, args: [...(alias.prependArgs || []), ...transformedArgs] }
  }
  return { noun, verb, args }
}

/**
 * When a `done`/`finish`-style alias has 2+ positional args, treat the 2nd+ as a `--log` value.
 * Example: `done my-task "all done"` → update --status done my-task --log "all done"
 * Single positional (just a task slug) passes through unchanged.
 * If --log is already explicitly provided, leave positionals as-is (only one log wins).
 */
function joinTrailingPositionalsAsLog(args: string[]): string[] {
  const hasExplicitLog = args.some(a => a === '--log')
  if (hasExplicitLog) return args

  // Split into positional (no leading --) and flag (leading --) tokens, preserving flag-value pairs.
  const positionals: string[] = []
  const others: string[] = []
  let i = 0
  while (i < args.length) {
    const a = args[i]
    if (a.startsWith('--')) {
      // Flag + its value (if next isn't a flag and isn't the last), keep together.
      others.push(a)
      if (i + 1 < args.length && !args[i + 1].startsWith('--')) {
        others.push(args[i + 1])
        i += 2
        continue
      }
      i++
      continue
    }
    positionals.push(a)
    i++
  }

  if (positionals.length < 2) {
    // Single positional: if it contains spaces, it's a log message, not a task slug.
    // Agents in a task PWD run `aip task done "long message"` expecting PWD to supply the task.
    // Task slugs are single tokens (no spaces). A multi-word positional is a log message.
    if (positionals.length === 1 && positionals[0].includes(' ')) {
      const message = positionals[0]
      return ['--log', message, ...others]
    }
    return args
  }

  const task = positionals[0]
  const message = positionals.slice(1).join(' ')
  return [task, '--log', message, ...others]
}

/** Rewrite mistyped --flag names to their canonical equivalents. */
export function resolveArgAliases(noun: string, verb: string, args: string[]): string[] {
  const mappings = (argAliases as Record<string, Record<string, Record<string, string> | undefined> | undefined>)[noun]?.[verb]
  if (!mappings) return args
  return args.map((arg) => {
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      if (key in mappings) {
        return `--${mappings[key]}`
      }
    }
    return arg
  })
}

/** Convert `key=value` tokens into `--key value` so agents using positional syntax still work. */
export function resolveKeyValueArgs(args: string[]): string[] {
  const result: string[] = []
  for (const arg of args) {
    const eqIdx = arg.indexOf('=')
    if (eqIdx > 0 && !arg.startsWith('-')) {
      result.push(`--${arg.slice(0, eqIdx)}`, arg.slice(eqIdx + 1))
    } else {
      result.push(arg)
    }
  }
  return result
}

/** Strip -- prefix when users mistakenly use positional arg names as flags and reorder args correctly.
 *  Example: `aip task create unbroker-scan --project privacy` → `aip task create privacy unbroker-scan`
 *  This requires knowing which args are positional (passed from command schema). */
export function resolvePositionalFlagMisuse(args: string[], positionalArgNames: Set<string>): string[] {
  const positionalArgList = Array.from(positionalArgNames)
  const slots: Array<string | undefined> = new Array(positionalArgList.length).fill(undefined)
  const otherArgs: string[] = []

  // Extract positional values from --flag misuse
  let i = 0
  while (i < args.length) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2)
      if (positionalArgNames.has(key) && i + 1 < args.length && !args[i + 1].startsWith('--')) {
        const index = positionalArgList.indexOf(key)
        if (index !== -1) {
          slots[index] = args[i + 1]
        }
        i += 2
        continue
      }
    }
    otherArgs.push(args[i])
    i++
  }

  // Fill empty slots with other args in order
  let otherIndex = 0
  for (let i = 0; i < slots.length; i++) {
    if (slots[i] === undefined && otherIndex < otherArgs.length) {
      slots[i] = otherArgs[otherIndex++]
    }
  }

  // Return filled slots + any remaining other args
  const result = slots.filter((v): v is string => v !== undefined)
  if (otherIndex < otherArgs.length) {
    result.push(...otherArgs.slice(otherIndex))
  }

  return result
}

/** Transform raw CLI args through all alias layers: command aliases → key=value → arg aliases.
 *  Accepts the full `[noun, verb, ...rest]` array and returns the rewritten version. */
export function transformArgs(args: string[]): string[] {
  const [noun = '', verb = '', ...rest] = args

  // Handle bare verb aliases: `aip list` → `aip task list`
  if (noun === 'list' && (!verb || verb.startsWith('-'))) {
    logAlias([noun], 'task list')
    const extraArgs = verb ? [verb, ...rest] : rest
    return ['task', 'list', ...extraArgs]
  }

  const cmdResult = resolveCommand(noun, verb, rest)
  const kvResult = resolveKeyValueArgs(cmdResult.args)
  const finalArgs = resolveArgAliases(cmdResult.noun, cmdResult.verb, kvResult)
  return [cmdResult.noun, cmdResult.verb, ...finalArgs]
}
