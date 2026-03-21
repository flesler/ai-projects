/** Auto-generated command map - DO NOT EDIT */

import agentCreate from './agent/create.js'
import agentCurrent from './agent/current.js'
import agentList from './agent/list.js'
import agentStart from './agent/start.js'
import hookCreate from './hook/create.js'
import hookRun from './hook/run.js'
import projectCreate from './project/create.js'
import projectCurrent from './project/current.js'
import projectList from './project/list.js'
import projectUpdate from './project/update.js'
import skillRead from './skill/read.js'
import taskCreate from './task/create.js'
import taskCurrent from './task/current.js'
import taskIngest from './task/ingest.js'
import taskList from './task/list.js'
import taskStart from './task/start.js'
import taskUpdate from './task/update.js'
import utilCompact from './util/compact.js'
import utilGlob from './util/glob.js'
import utilInspect from './util/inspect.js'
import utilIso from './util/iso.js'
import utilJoin from './util/join.js'
import utilLog from './util/log.js'
import utilLs from './util/ls.js'
import utilOneline from './util/oneline.js'
import utilPostmortem from './util/postmortem.js'
import utilRead from './util/read.js'
import utilRelative from './util/relative.js'
import utilSlugify from './util/slugify.js'
import utilWrite from './util/write.js'

/** Command map organized by noun and verb */
const commands = {
  agent: {
    create: agentCreate,
    current: agentCurrent,
    list: agentList,
    start: agentStart,
  },
  hook: {
    create: hookCreate,
    run: hookRun,
  },
  project: {
    create: projectCreate,
    current: projectCurrent,
    list: projectList,
    update: projectUpdate,
  },
  skill: {
    read: skillRead,
  },
  task: {
    create: taskCreate,
    current: taskCurrent,
    ingest: taskIngest,
    list: taskList,
    start: taskStart,
    update: taskUpdate,
  },
  util: {
    compact: utilCompact,
    glob: utilGlob,
    inspect: utilInspect,
    iso: utilIso,
    join: utilJoin,
    log: utilLog,
    ls: utilLs,
    oneline: utilOneline,
    postmortem: utilPostmortem,
    read: utilRead,
    relative: utilRelative,
    slugify: utilSlugify,
    write: utilWrite,
  },
} as const

export default commands
