import type commands from '../commands/index.js'
import type util from './index.js'

/** Shortcut for Array<keyof T> */
export type KeysOf<T> = Array<keyof T>

/** The return type of the typeof operator */
export type TypeOf = ReturnType<typeof util.typeOf>

type Commands = typeof commands

export type Noun = keyof Commands
export type Verbs<N extends Noun> = keyof Commands[N]
