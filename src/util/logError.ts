import fs from 'fs'
import path from 'path'
import commandMap from '../commands/index.js'
import env from './env.js'
import util from './index.js'

const HEADER = 'date\ttime\tnoun\tverb\textra_args\terror'

export function logError(args: readonly string[], err: unknown): void {
  if (!env.ERROR_LOG) return

  const now = new Date()
  const iso = now.toISOString()
  const [date, timePart] = iso.split('T')
  const time = timePart.replace(/\.\d+Z$/, '')
  let noun: string = ''
  let verb: string = ''

  if (util.isKeyOf(args[0], commandMap)) {
    noun = args[0]
    if (util.isKeyOf(args[1], commandMap[noun as keyof typeof commandMap])) {
      verb = args[1]
    }
  }

  const consumed = (noun ? 1 : 0) + (verb ? 1 : 0)
  const extraArgs = args.slice(consumed).join(' ')

  const line = [date, time, noun, verb, extraArgs, util.errorMessage(err)]
    .map(escapeTsv)
    .join('\t')

  const dir = path.dirname(env.ERROR_LOG)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const exists = fs.existsSync(env.ERROR_LOG)
  fs.appendFileSync(env.ERROR_LOG, (exists ? '' : HEADER + '\n') + line + '\n')
}

function escapeTsv(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\t/g, '\\t').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
}
