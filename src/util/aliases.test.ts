import { describe, expect, it } from 'vitest'
import { resolveArgAliases, resolveCommand, resolveKeyValueArgs, resolvePositionalFlagMisuse, transformArgs } from './aliases.js'
import { toModule, type FnTestCase } from './tests.js'

describe(toModule(__filename), () => {
  describe('resolveCommand', () => {
    const cases: FnTestCase<typeof resolveCommand>[] = [
      // Task aliases from agent report
      { desc: 'task done → task update --status done', input: ['task', 'done', ['my-task']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', 'my-task'] } },
      { desc: 'task complete → task update --status done', input: ['task', 'complete', ['my-task']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', 'my-task'] } },
      { desc: 'task stop → task update --status done', input: ['task', 'stop', ['my-task']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', 'my-task'] } },
      { desc: 'task log → log append', input: ['task', 'log', ['some text']], expected: { noun: 'log', verb: 'append', args: ['some text'] } },
      { desc: 'task log <slug> <msg> → log append --task <slug> <msg>', input: ['task', 'log', ['daily-ai-digest', 'Generated digest']], expected: { noun: 'log', verb: 'append', args: ['--task', 'daily-ai-digest', 'Generated digest'] } },
      { desc: 'task log <slug> multi-word → log append --task <slug> joined', input: ['task', 'log', ['daily-ai-digest', 'Generated', '2026-08-02', 'digest']], expected: { noun: 'log', verb: 'append', args: ['--task', 'daily-ai-digest', 'Generated 2026-08-02 digest'] } },
      { desc: 'task log "multi word msg" → log append --log (single positional w/ spaces)', input: ['task', 'log', ['No session logs in last 24h.']], expected: { noun: 'log', verb: 'append', args: ['No session logs in last 24h.'] } },
      { desc: 'task log <slug> → log append --task <slug> (single token)', input: ['task', 'log', ['daily-ai-digest']], expected: { noun: 'log', verb: 'append', args: ['--task', 'daily-ai-digest'] } },
      { desc: 'task log (no args) → log append (prompt)', input: ['task', 'log', []], expected: { noun: 'log', verb: 'append', args: [] } },
      { desc: 'task show → task ingest', input: ['task', 'show', ['my-task']], expected: { noun: 'task', verb: 'ingest', args: ['my-task'] } },
      { desc: 'task status → task current (GET)', input: ['task', 'status', []], expected: { noun: 'task', verb: 'current', args: [] } },
      { desc: 'task status done → task update --status done (SET)', input: ['task', 'status', ['done']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done'] } },
      { desc: 'task status ongoing → task update --status ongoing (SET)', input: ['task', 'status', ['ongoing']], expected: { noun: 'task', verb: 'update', args: ['--status', 'ongoing'] } },
      { desc: 'task status done --log "msg" → task update --status done --log "msg"', input: ['task', 'status', ['done', '--log', 'msg']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', '--log', 'msg'] } },
      { desc: 'task status done "summary" → task update --status done --log "summary"', input: ['task', 'status', ['done', 'summary']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', '--log', 'summary'] } },
      { desc: 'task status done my-task "msg" → task update --status done --log "my-task msg"', input: ['task', 'status', ['done', 'my-task', 'msg']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', '--log', 'my-task msg'] } },
      // Project aliases
      { desc: 'project done → project update --status done', input: ['project', 'done', ['my-project']], expected: { noun: 'project', verb: 'update', args: ['--status', 'done', 'my-project'] } },
      { desc: 'project stop → project update --status done', input: ['project', 'stop', ['my-project']], expected: { noun: 'project', verb: 'update', args: ['--status', 'done', 'my-project'] } },
      // Passthrough cases
      { desc: 'non-aliased command passes through', input: ['task', 'update', ['--status', 'done']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done'] } },
      { desc: 'unknown noun passes through', input: ['agent', 'list', []], expected: { noun: 'agent', verb: 'list', args: [] } },
      { desc: 'preserves extra args after prepended args', input: ['task', 'done', ['my-task', '--log', 'finished']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', 'my-task', '--log', 'finished'] } },
      // done/complete/stop/finish with 2+ positionals: 2nd+ becomes --log
      { desc: 'task done my-task "msg" → --log msg', input: ['task', 'done', ['my-task', 'all done']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', 'my-task', '--log', 'all done'] } },
      { desc: 'task finish update-memory "summary here" → --log', input: ['task', 'finish', ['update-memory', 'No session logs.']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', 'update-memory', '--log', 'No session logs.'] } },
      { desc: 'task complete task "msg" → --log msg', input: ['task', 'complete', ['my-task', 'completion']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', 'my-task', '--log', 'completion'] } },
      { desc: 'task done my-task "multi word" message → --log joined', input: ['task', 'done', ['my-task', 'all', 'done', 'now']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', 'my-task', '--log', 'all done now'] } },
      { desc: 'task done --log present skips joining', input: ['task', 'done', ['my-task', '--log', 'msg', 'extra']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', 'my-task', '--log', 'msg', 'extra'] } },
      { desc: 'task done my-task --status x passes through (1 positional)', input: ['task', 'done', ['my-task', '--status', 'nope']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', 'my-task', '--status', 'nope'] } },
      // Single positional with spaces: treat as --log message (task inferred from PWD context)
      { desc: 'task done "No session logs in 24h" → --log only (1 positional w/ spaces)', input: ['task', 'done', ['No session logs in last 24h.']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', '--log', 'No session logs in last 24h.'] } },
      { desc: 'task finish "Update complete" → --log only (1 positional w/ spaces)', input: ['task', 'finish', ['Update complete.']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', '--log', 'Update complete.'] } },
      { desc: 'task complete "All done here" → --log only (1 positional w/ spaces)', input: ['task', 'complete', ['All done here']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', '--log', 'All done here'] } },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(resolveCommand(...input)).toEqual(expected)
      })
    })
  })

  describe('resolveArgAliases', () => {
    const cases: FnTestCase<typeof resolveArgAliases>[] = [
      { desc: '--summary → --log for task update', input: ['task', 'update', ['--summary', 'did stuff']], expected: ['--log', 'did stuff'] },
      { desc: '--message → --log for task update', input: ['task', 'update', ['--message', 'did stuff']], expected: ['--log', 'did stuff'] },
      { desc: '--note → --log for task update', input: ['task', 'update', ['--note', 'did stuff']], expected: ['--log', 'did stuff'] },
      { desc: 'unrelated flags unchanged', input: ['task', 'update', ['--status', 'done']], expected: ['--status', 'done'] },
      { desc: 'non-aliased noun unchanged', input: ['project', 'update', ['--summary', 'test']], expected: ['--summary', 'test'] },
      { desc: 'mixed with positional args', input: ['task', 'update', ['my-task', '--summary', 'test']], expected: ['my-task', '--log', 'test'] },
      { desc: 'empty args', input: ['task', 'update', []], expected: [] },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(resolveArgAliases(...input)).toEqual(expected)
      })
    })
  })

  describe('resolvePositionalFlagMisuse', () => {
    const positionalArgs = new Set(['project', 'name'])
    const cases: FnTestCase<typeof resolvePositionalFlagMisuse>[] = [
      { desc: 'unbroker-scan --project privacy → privacy unbroker-scan', input: [['unbroker-scan', '--project', 'privacy'], positionalArgs], expected: ['privacy', 'unbroker-scan'] },
      { desc: '--project privacy unbroker-scan → privacy unbroker-scan', input: [['--project', 'privacy', 'unbroker-scan'], positionalArgs], expected: ['privacy', 'unbroker-scan'] },
      { desc: 'privacy --name unbroker-scan → privacy unbroker-scan', input: [['privacy', '--name', 'unbroker-scan'], positionalArgs], expected: ['privacy', 'unbroker-scan'] },
      { desc: '--project privacy --name scan → privacy scan', input: [['--project', 'privacy', '--name', 'scan'], positionalArgs], expected: ['privacy', 'scan'] },
      { desc: 'preserves regular flags', input: [['--status', 'done', 'my-task'], positionalArgs], expected: ['--status', 'done', 'my-task'] },
      { desc: 'doesn\'t strip when next arg is also a flag', input: [['--project', '--other', 'value'], positionalArgs], expected: ['--project', '--other', 'value'] },
      { desc: 'doesn\'t strip unknown positional names', input: [['--unknown', 'value'], positionalArgs], expected: ['--unknown', 'value'] },
      { desc: 'empty args', input: [[], positionalArgs], expected: [] },
      { desc: 'no flags to strip', input: [['privacy', 'unbroker-scan'], positionalArgs], expected: ['privacy', 'unbroker-scan'] },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(resolvePositionalFlagMisuse(...input)).toEqual(expected)
      })
    })
  })

  describe('resolveKeyValueArgs', () => {
    const cases: FnTestCase<typeof resolveKeyValueArgs>[] = [
      { desc: 'key=value → --key value', input: ['status=done'], expected: ['--status', 'done'] },
      { desc: 'multiple key=value pairs', input: ['status=done', 'name=my-task'], expected: ['--status', 'done', '--name', 'my-task'] },
      { desc: 'mixed with regular args', input: ['my-task', 'status=done', '--log', 'test'], expected: ['my-task', '--status', 'done', '--log', 'test'] },
      { desc: 'regular flags unchanged', input: ['--status', 'done'], expected: ['--status', 'done'] },
      { desc: 'positional args without = unchanged', input: ['my-task'], expected: ['my-task'] },
      { desc: 'empty value after =', input: ['name='], expected: ['--name', ''] },
      { desc: 'value containing =', input: ['formula=a=b'], expected: ['--formula', 'a=b'] },
      { desc: '>=2 not split (invalid option name)', input: ['>=2'], expected: ['>=2'] },
      { desc: 'message with >=2 not split', input: ['meets >=2 threshold'], expected: ['meets >=2 threshold'] },
      { desc: '=> not split', input: ['=>'], expected: ['=>'] },
      { desc: 'empty args', input: [], expected: [] },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(resolveKeyValueArgs(input)).toEqual(expected)
      })
    })
  })

  describe('transformArgs (full pipeline)', () => {
    const cases: FnTestCase<typeof transformArgs>[] = [
      // Agent report cases - the actual mistakes agents make
      { desc: 'task done my-task → task update --status done my-task', input: ['task', 'done', 'my-task'], expected: ['task', 'update', '--status', 'done', 'my-task'] },
      { desc: 'task complete my-task → task update --status done my-task', input: ['task', 'complete', 'my-task'], expected: ['task', 'update', '--status', 'done', 'my-task'] },
      { desc: 'task log "text" → log append "text"', input: ['task', 'log', 'some text'], expected: ['log', 'append', 'some text'] },
      { desc: 'task log <slug> <msg> → log append --task <slug> <msg>', input: ['task', 'log', 'daily-ai-digest', 'Generated digest'], expected: ['log', 'append', '--task', 'daily-ai-digest', 'Generated digest'] },
      { desc: 'task log <slug> multi-word → log append --task <slug> joined', input: ['task', 'log', 'daily-ai-digest', 'Generated', '2026-08-02', 'digest'], expected: ['log', 'append', '--task', 'daily-ai-digest', 'Generated 2026-08-02 digest'] },
      { desc: 'task log "multi word msg" → log append --log (single positional w/ spaces)', input: ['task', 'log', 'No session logs in last 24h.'], expected: ['log', 'append', 'No session logs in last 24h.'] },
      { desc: 'task log <slug> → log append --task <slug> (single token)', input: ['task', 'log', 'daily-ai-digest'], expected: ['log', 'append', '--task', 'daily-ai-digest'] },
      { desc: 'task show my-task → task ingest my-task', input: ['task', 'show', 'my-task'], expected: ['task', 'ingest', 'my-task'] },
      { desc: 'task status → task current (GET)', input: ['task', 'status'], expected: ['task', 'current'] },
      { desc: 'task status done → task update --status done (SET)', input: ['task', 'status', 'done'], expected: ['task', 'update', '--status', 'done'] },
      { desc: 'task status ongoing → task update --status ongoing (SET)', input: ['task', 'status', 'ongoing'], expected: ['task', 'update', '--status', 'ongoing'] },
      { desc: 'task status done --log "msg" → task update --status done --log "msg"', input: ['task', 'status', 'done', '--log', 'msg'], expected: ['task', 'update', '--status', 'done', '--log', 'msg'] },
      { desc: 'task status done "summary" → task update --status done --log "summary"', input: ['task', 'status', 'done', 'summary'], expected: ['task', 'update', '--status', 'done', '--log', 'summary'] },
      { desc: 'task status done my-task "msg" → task update --status done --log "my-task msg"', input: ['task', 'status', 'done', 'my-task', 'msg'], expected: ['task', 'update', '--status', 'done', '--log', 'my-task msg'] },
      // Key=value syntax (positional args confusion)
      { desc: 'task update status=done → task update --status done', input: ['task', 'update', 'status=done'], expected: ['task', 'update', '--status', 'done'] },
      { desc: 'task update my-task status=in-progress → task update my-task --status in-progress', input: ['task', 'update', 'my-task', 'status=in-progress'], expected: ['task', 'update', 'my-task', '--status', 'in-progress'] },
      // Arg aliases (--summary/--message → --log)
      { desc: 'task update --summary "text" → task update --log "text"', input: ['task', 'update', '--summary', 'text'], expected: ['task', 'update', '--log', 'text'] },
      { desc: 'task update --message "text" → task update --log "text"', input: ['task', 'update', '--message', 'text'], expected: ['task', 'update', '--log', 'text'] },
      { desc: 'task update --note "text" → task update --log "text"', input: ['task', 'update', '--note', 'text'], expected: ['task', 'update', '--log', 'text'] },
      // Combined: alias + arg alias
      { desc: 'task done my-task --summary "done" → task update --status done my-task --log "done"', input: ['task', 'done', 'my-task', '--summary', 'done'], expected: ['task', 'update', '--status', 'done', 'my-task', '--log', 'done'] },
      // done/complete/stop/finish with single positional containing spaces: treat as --log (message only, task from PWD)
      { desc: 'task done "No session logs in last 24h" → task update --status done --log "No session logs..."', input: ['task', 'done', 'No session logs in last 24h.'], expected: ['task', 'update', '--status', 'done', '--log', 'No session logs in last 24h.'] },
      { desc: 'task finish "Update complete" → task update --status done --log "Update complete"', input: ['task', 'finish', 'Update complete.'], expected: ['task', 'update', '--status', 'done', '--log', 'Update complete.'] },
      // done/complete/stop/finish with 2+ positionals: 2nd+ becomes --log
      { desc: 'task done my-task "all done" → task update --status done my-task --log "all done"', input: ['task', 'done', 'my-task', 'all done'], expected: ['task', 'update', '--status', 'done', 'my-task', '--log', 'all done'] },
      { desc: 'task finish my-task "summary" → task update --status done my-task --log "summary"', input: ['task', 'finish', 'my-task', 'summary'], expected: ['task', 'update', '--status', 'done', 'my-task', '--log', 'summary'] },
      // Project aliases
      { desc: 'project done my-project → project update --status done my-project', input: ['project', 'done', 'my-project'], expected: ['project', 'update', '--status', 'done', 'my-project'] },
      // Passthrough: non-aliased commands unchanged
      { desc: 'task update --status done passes through', input: ['task', 'update', '--status', 'done'], expected: ['task', 'update', '--status', 'done'] },
      { desc: 'agent list passes through', input: ['agent', 'list'], expected: ['agent', 'list'] },
    ]

    cases.forEach(({ desc, input, expected }) => {
      it(`should handle ${desc}`, () => {
        expect(transformArgs(input)).toEqual(expected)
      })
    })
  })
})
