/** Wrapper for console, with log levels and contexts */
import _ from 'lodash'
import path from 'path'
import util from './index.js'

const SEP = '  '

export default class {
  private filename: string | undefined
  private context: string | undefined

  constructor(filename?: string) {
    this.filename = filename
  }

  private log = (isError: boolean, type: string, ...args: any[]) => {
    if (this.filename && !this.context) {
      this.context = `<${setupContext(this.filename)}>`
    }
    if (this.context) {
      args.unshift(this.context)
    }
    const [date, time] = new Date().toISOString().split(/[T.]/)
    args.unshift(type, date, time)

    const line = args.map(this.stringify).map(this.sanitize).join(SEP)
    if (isError) {
      console.error(line)
    } else {
      console.log(line)
    }
    return line
  }

  private stringify = (data: any): string => {
    if (!data) {
      return '-'
    }
    if (_.isNumber(data)) {
      return `${data}`
    }
    if (_.isError(data)) {
      return util.oneLine(data.message || '')
    }
    if (_.isFunction(data)) {
      return util.oneLine(data.toString())
    }
    if (_.isObject(data) || _.isArray(data)) {
      try {
        return util.dump(data)
      } catch (err) {
        // Handle things like objects with circular references
        return `Failed to stringify: ${err.message}`
      }
    }
    return _.toString(data)
  }

  /** Remove all extra spaces so we can safely split by $SEP into a CSV if needed */
  private sanitize = (data: string): string => {
    return data.replace(/ {2,}/g, ' ')
  }

  public debug = (...args: any[]) => {
    this.log(false, '[DEBUG]', ...args)
  }

  public info = (...args: any[]) => {
    this.log(false, '[INFO]', ...args)
  }

  public warn = (...args: any[]) => {
    this.log(true, '[WARN]', ...args)
  }

  public error = (...args: any[]) => {
    this.log(true, '[ERROR]', ...args)
  }
}

const setupContext = (filename: string): string => {
  const parts = filename.split(path.sep)
  const [file, dir, ...rest] = parts.reverse()

  if (!rest.length) {
    // Just a custom name
    return filename
  }

  const name = path.basename(file, '.js').replace('.ts', '')

  // If it's index, use parent directory
  if (name === 'index') {
    return dir
  }

  // For command files, include both noun and verb
  const commandsIdx = parts.indexOf('commands')
  if (commandsIdx !== -1 && commandsIdx < parts.length - 1) {
    const commandParts = parts.slice(commandsIdx + 1)
    if (commandParts.length >= 2) {
      const [noun, verb] = commandParts
      return `<${noun}/${verb.replace('.js', '').replace('.ts', '')}>`
    }
  }

  // Default: just the basename
  return name
}
