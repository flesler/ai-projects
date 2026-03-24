import { exec as cpExec, spawn as cpSpawn } from 'child_process'
import fs from 'fs/promises'
import _ from 'lodash'
import type { Duration, DurationInputObject, MomentInput } from 'moment'
import moment from 'moment'
import path from 'path'
import { fileURLToPath } from 'url'
import type { InspectOptions } from 'util'
import { inspect as utilInspect } from 'util'

const util = {
  // Relative to the project root
  REPO: fileURLToPath(import.meta.url.replace(/\/(dist|src)\/.*/, '/')),

  join: (...segments: string[]): string => {
    return path.join(...segments)
  },

  onRepo: (...segments: string[]): string => {
    return util.join(util.REPO, ...segments)
  },

  /** Ensure directory exists */
  async ensureDir(dirPath: string): Promise<void> {
    await fs.mkdir(dirPath, { recursive: true })
  },

  /** Write file, creating parent directories if needed */
  async write(filePath: string, content: string): Promise<void> {
    await util.ensureDir(path.dirname(filePath))
    await fs.writeFile(filePath, content, 'utf8')
  },

  /** Read file */
  async read(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf8')
  },

  async readRepo(...segments: string[]): Promise<string> {
    return util.read(util.onRepo(...segments))
  },

  /** Check if file exists */
  async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath)
      return true
    } catch {
      return false
    }
  },

  /** List directory contents */
  async listDir(dirPath: string): Promise<string[]> {
    try {
      return await fs.readdir(dirPath)
    } catch {
      return []
    }
  },

  /** Spawn process: util.spawn(cmd, args, opts?). Returns { stdout, stderr, code }. */
  async spawn(cmd: string, args: string[] = [], opts?: { cwd?: string; env?: NodeJS.ProcessEnv }): Promise<{ stdout: string; stderr: string; code: number | null }> {
    return new Promise((resolve, reject) => {
      const proc = cpSpawn(cmd, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        ...opts,
      })
      let stdout = ''
      let stderr = ''
      proc.stdout?.on('data', (chunk) => {
        stdout += chunk
      })
      proc.stderr?.on('data', (chunk) => {
        stderr += chunk
      })
      proc.on('close', code => resolve({ stdout, stderr, code }))
      proc.on('error', reject)
    })
  },

  /** Exec command string (shell). Returns { stdout, stderr, code }. */
  async exec(command: string, opts?: { cwd?: string; env?: NodeJS.ProcessEnv }): Promise<{ stdout: string; stderr: string; code: number }> {
    return new Promise((resolve) => {
      cpExec(command, { encoding: 'utf8', ...opts }, (err, stdout, stderr) => {
        const c = (err as NodeJS.ErrnoException)?.code
        const code = err ? (typeof c === 'number' ? c : 1) : 0
        resolve({ stdout: stdout ?? '', stderr: stderr ?? '', code })
      })
    })
  },

  /** Empty function */
  noop: (): void => {
  },

  omitByDeep: <T extends {}>(obj: T, fn: (value: any) => boolean): T => {
    if (_.isArray(obj)) {
      return obj.map(v => util.omitByDeep(v, fn)) as any
    }
    if (_.isPlainObject(obj)) {
      return _.mapValues(_.omitBy(obj, fn), v => util.omitByDeep(v as any, fn)) as T
    }
    return obj as T
  },

  /** Omit nils from an object (not false or zeroes) */
  omitNilsDeep: <T extends {}>(obj: T): T => {
    return util.omitByDeep(obj, _.isNil)
  },

  /** Omit undefineds from an object */
  omitUndefinedsDeep: <T extends {}>(obj: T): T => {
    return util.omitByDeep(obj, _.isUndefined)
  },

  /** Similar to lodash cloneDeep but with stronger typing. Ensure a potential Readonly is removed in the return type */
  cloneDeep: <T>(obj: T | Readonly<T>): T => {
    // Use lodash instead of structuredClone because structuredClone can't handle Decimal.js objects
    return _.cloneDeep(obj)
  },

  int: (val: any): number => {
    return Number.parseInt(val, 10)
  },

  /** Object.keys() with more accurate types */
  keysOf: <T extends object>(obj: T): Array<keyof T> => {
    return Object.keys(obj) as Array<keyof T>
  },

  /** Object.entries() with more accurate types */
  entriesOf: <T extends object>(obj: T) => {
    return Object.entries(obj) as Array<[keyof T, T[keyof T]]>
  },

  /** The "in" operator with more accurate types */
  isKeyOf: <T extends object>(key: string | number | symbol | null | undefined, obj: T): key is keyof T => {
    return !_.isNil(key) && key in obj
  },

  /** Function version of the typeof operator */
  typeOf: (val: any) => {
    return typeof val
  },

  never: {} as never,

  /** Used to resolve type conflicts between Prisma (null) and the rest of the world (undefined) */
  undef: <T>(val: T | null): T | undefined => {
    return val ?? undefined
  },

  /** Used for cases where undefineds should turn to null */
  toNull: <T>(val: T | undefined): T | null => {
    return val ?? null
  },

  /** Used to handle type conflicts between Prisma & GQL enums */
  same: <T extends string, U extends string>(value: T): U => {
    return value as any as U
  },

  /** Asserts that something is not nil */
  notNil: <T>(value: T | null | undefined): T => {
    if (_.isNil(value)) {
      throw new Error(`Received unexpected ${value} value`)
    }
    return value
  },

  randomInt: (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min
  },

  /** Creates a Promise object with resolve() and reject() methods */
  promise: <T>() => {
    let extra: { resolve: (value: T) => void; reject: (reason?: any) => void }
    const promise = new Promise<T>((resolve, reject) => {
      extra = { resolve, reject }
    })
    // @ts-expect-error bad inferrence, the promise is sync
    return _.extend(promise, extra)
  },

  isPromise: (data: unknown): data is Promise<any> => {
    return _.isObject(data) && 'catch' in data
  },

  /** Creates a promise that resolves after {ms} milliseconds */
  delay: (ms: number | DurationInputObject): Promise<void> => {
    const time = _.isObject(ms) ? util.toMS(ms) : ms
    return new Promise(resolve => setTimeout(resolve, time))
  },

  /** Maps an array to a list of promises and wraps them into a single promise */
  promiseMap: <T, K>(list: Readonly<T[]>, mapper: (v: T, i: number, a: Readonly<T[]>) => Promise<K> | K): Promise<K[]> => {
    return Promise.all(list.map(mapper))
  },

  /** Like _.memoize but all arguments are used as part of the key */
  memoize: <F extends (...args: any[]) => any>(fn: F): F => {
    return _.memoize(fn, util.memoizeKey)
  },

  toMS: (duration?: DurationInputObject): number => {
    return moment.duration(duration).asMilliseconds()
  },

  toSecs: (duration?: DurationInputObject): number => {
    return moment.duration(duration).asSeconds()
  },

  /** Dumps an object as a one-liner string */
  inspect: (obj: any, options?: InspectOptions): string => {
    return utilInspect(obj, { colors: false, showHidden: false, depth: null, compact: true, breakLength: Infinity, ...options })
  },

  /** Like JSON.stringify but tries to avoid an error due to circular references in the object */
  stringify(data: any, replacer?: ((this: any, key: string, value: any) => any) | null, space?: string | number): string {
    const set = new WeakSet()
    return JSON.stringify(data, (key, value) => {
      if (_.isObject(value)) {
        if (set.has(value)) {
          return '[Circular]'
        }
        set.add(value)
      }
      return _.isFunction(replacer) ? replacer(key, value) : value
    }, space)
  },

  /** Dumps an object as a JSON one-liner */
  dump: (data: any): string => {
    return util.oneLine(util.stringify(data))
  },

  /** Collapses excessive whitespace. Trims around newlines, max one blank line, 2+ spaces → tab (blood test parser relies on tabs for column sep). */
  compactWhitespace: (s: string): string => {
    return s
      .replace(/\\n/g, '\n')
      .replace(/\r/g, '')
      .replace(/[ \t]*\n[ \t]*/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/ {2,}/g, '\t')
      .trim()
  },

  /** Converts a potentially multi-line string into a one-liner */
  oneLine: (str: string): string => {
    return str
      // Encode them so they are the actual character
      .replace(/\n/g, '\\n')
      .replace(/\t/g, '\\t')
      // Replace multiple spaces for one, since "  " is the column separator
      .replace(/ +/g, ' ')
      .trim()
  },

  /** Checks if a search is included in a string, case insensitive */
  fuzzySearch: (str: string | undefined | null, search: string | undefined | null): boolean => {
    return _.includes(_.toLower(str || ''), _.toLower(search || ''))
  },

  /** Returns a Duration object of `until - since` */
  elapsed: (since: MomentInput, until: MomentInput = Date.now()): Duration => {
    return moment.duration(moment(until).diff(since || 0))
  },

  /** Formats a date as ISO string */
  iso: (date: MomentInput): string => {
    return moment.utc(date).toISOString()
  },

  isoDate: (date: MomentInput): string => {
    return util.iso(date).slice(0, 10)
  },

  /** Used when memoize needs to cache on all arguments */
  memoizeKey: (...args: any[]): string => {
    return args.join('')
  },

  /** Used to trick the TypeScript compiler to not detected unreachable code while debugging */
  exit: (code = 0) => {
    process.exit(code)
  },

  /** When the compiler is being mean */
  set: (obj: any, key: string, value: any) => {
    obj[key] = value
    return obj
  },

  run: async (main: () => Promise<void>) => {
    try {
      await main()
      process.exit(0)
    } catch (err) {
      console.error(err)
      process.exit(1)
    }
  },

  isMain: (): boolean => {
    // Check if this file is being run directly (not imported)
    // Works for both 'dist/index.js' and npm-linked 'bin/aip'
    const mainModule = process.argv[1] || ''
    return mainModule.includes('/index.') || mainModule.endsWith('/bin/aip')
  },

  errorMessage: (err: unknown): string => {
    return err instanceof Error ? err.message : String(err)
  },

  /** Converts a string to a URL-friendly slug */
  slugify: (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  },
}

export default util

/** Shortcut for Array<keyof T> */
export type KeysOf<T> = Array<keyof T>

/** The return type of the typeof operator */
export type TypeOf = ReturnType<typeof util.typeOf>

/** Promise with resolve/reject methods */
export interface PromiseExtra<T> extends Promise<T> {
  resolve: (value: T) => void
  reject: (reason?: any) => void
}
