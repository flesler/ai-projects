/** Auto-generated command map - DO NOT EDIT */

import agentCreate from './agent/create.js'
import agentCurrent from './agent/current.js'
import agentList from './agent/list.js'
import agentPath from './agent/path.js'
import agentStart from './agent/start.js'
import helpApi from './help/api.js'
import helpHooks from './help/hooks.js'
import helpQuickstart from './help/quickstart.js'
import helpSkill from './help/skill.js'
import helpUsage from './help/usage.js'
import hookCreate from './hook/create.js'
import hookRun from './hook/run.js'
import logAppend from './log/append.js'
import logRead from './log/read.js'
import projectCreate from './project/create.js'
import projectCurrent from './project/current.js'
import projectList from './project/list.js'
import projectPath from './project/path.js'
import projectUpdate from './project/update.js'
import skillRead from './skill/read.js'
import taskCreate from './task/create.js'
import taskCurrent from './task/current.js'
import taskIngest from './task/ingest.js'
import taskList from './task/list.js'
import taskPath from './task/path.js'
import taskStart from './task/start.js'
import taskUpdate from './task/update.js'
import utilRead from './util/read.js'

/** Command map organized by noun and verb */
const commands = {
  agent: {
    create: agentCreate,
    current: agentCurrent,
    list: agentList,
    path: agentPath,
    start: agentStart,
  },
  help: {
    api: helpApi,
    hooks: helpHooks,
    quickstart: helpQuickstart,
    skill: helpSkill,
    usage: helpUsage,
  },
  hook: {
    create: hookCreate,
    run: hookRun,
  },
  log: {
    append: logAppend,
    read: logRead,
  },
  project: {
    create: projectCreate,
    current: projectCurrent,
    list: projectList,
    path: projectPath,
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
    path: taskPath,
    start: taskStart,
    update: taskUpdate,
  },
  util: {
    read: utilRead,
  },
} as const

export default commands
