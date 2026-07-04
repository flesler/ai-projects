import { logAlias } from './logError.js'
import type { Noun } from './types'

type CommandAlias = {
  noun: Noun
  verb: string
  prependArgs?: string[]
}

/** Map (noun, aliasVerb) → real command. Prepended args are injected before the user's args. */
export const commandAliases: Partial<Record<Noun, Record<string, CommandAlias>>> = {
  task: {
    complete: { noun: 'task', verb: 'update', prependArgs: ['--status', 'done'] },
    done: { noun: 'task', verb: 'update', prependArgs: ['--status', 'done'] },
    stop: { noun: 'task', verb: 'update', prependArgs: ['--status', 'done'] },
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
    },
  },
}

/** Resolve a command alias. Returns the real (noun, verb, args) triplet. */
export function resolveCommand(noun: string, verb: string, args: string[]): { noun: string; verb: string; args: string[] } {
  const alias = (commandAliases as Record<string, Record<string, CommandAlias> | undefined>)[noun]?.[verb]
  if (alias) {
    const original = `${noun} ${verb} ${args.join(' ')}`.trim()
    logAlias([noun, verb, ...args], original)
    return { noun: alias.noun, verb: alias.verb, args: [...(alias.prependArgs || []), ...args] }
  }
  return { noun, verb, args }
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

/** Strip -- prefix when users mistakenly use positional arg names as flags.
 *  Example: `aip task create --project privacy unbroker-scan` → `aip task create privacy unbroker-scan`
 *  This requires knowing which args are positional (passed from command schema). */
export function resolvePositionalFlagMisuse(args: string[], positionalArgNames: Set<string>): string[] {
  const result: string[] = []
  let i = 0
  while (i < args.length) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2)
      if (positionalArgNames.has(key) && i + 1 < args.length && !args[i + 1].startsWith('--')) {
        // Skip the --flag, keep only the value
        result.push(args[i + 1])
        i += 2
        continue
      }
    }
    result.push(args[i])
    i++
  }
  return result
}

/** Transform raw CLI args through all alias layers: command aliases → key=value → arg aliases.
 *  Accepts the full `[noun, verb, ...rest]` array and returns the rewritten version. */
export function transformArgs(args: string[]): string[] {
  const [noun = '', verb = '', ...rest] = args
  const cmdResult = resolveCommand(noun, verb, rest)
  const kvResult = resolveKeyValueArgs(cmdResult.args)
  const finalArgs = resolveArgAliases(cmdResult.noun, cmdResult.verb, kvResult)
  return [cmdResult.noun, cmdResult.verb, ...finalArgs]
}
