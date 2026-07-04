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
      { desc: 'task show → task ingest', input: ['task', 'show', ['my-task']], expected: { noun: 'task', verb: 'ingest', args: ['my-task'] } },
      { desc: 'task status → task current', input: ['task', 'status', []], expected: { noun: 'task', verb: 'current', args: [] } },
      // Project aliases
      { desc: 'project done → project update --status done', input: ['project', 'done', ['my-project']], expected: { noun: 'project', verb: 'update', args: ['--status', 'done', 'my-project'] } },
      { desc: 'project stop → project update --status done', input: ['project', 'stop', ['my-project']], expected: { noun: 'project', verb: 'update', args: ['--status', 'done', 'my-project'] } },
      // Passthrough cases
      { desc: 'non-aliased command passes through', input: ['task', 'update', ['--status', 'done']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done'] } },
      { desc: 'unknown noun passes through', input: ['agent', 'list', []], expected: { noun: 'agent', verb: 'list', args: [] } },
      { desc: 'preserves extra args after prepended args', input: ['task', 'done', ['my-task', '--log', 'finished']], expected: { noun: 'task', verb: 'update', args: ['--status', 'done', 'my-task', '--log', 'finished'] } },
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
      { desc: 'strips --project flag and keeps value', input: [['--project', 'privacy', 'unbroker-scan'], positionalArgs], expected: ['privacy', 'unbroker-scan'] },
      { desc: 'strips --name flag and keeps value', input: [['privacy', '--name', 'unbroker-scan'], positionalArgs], expected: ['privacy', 'unbroker-scan'] },
      { desc: 'handles multiple positional flags in order', input: [['--project', 'privacy', '--name', 'scan'], positionalArgs], expected: ['privacy', 'scan'] },
      { desc: 'preserves regular flags', input: [['--status', 'done', 'my-task'], positionalArgs], expected: ['--status', 'done', 'my-task'] },
      { desc: 'unknown flags that match positional names get stripped', input: [['--project', 'privacy'], positionalArgs], expected: ['privacy'] },
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
      { desc: 'task show my-task → task ingest my-task', input: ['task', 'show', 'my-task'], expected: ['task', 'ingest', 'my-task'] },
      { desc: 'task log "text" → log append "text"', input: ['task', 'log', 'some text'], expected: ['log', 'append', 'some text'] },
      { desc: 'task status → task current', input: ['task', 'status'], expected: ['task', 'current'] },
      // Key=value syntax (positional args confusion)
      { desc: 'task update status=done → task update --status done', input: ['task', 'update', 'status=done'], expected: ['task', 'update', '--status', 'done'] },
      { desc: 'task update my-task status=in-progress → task update my-task --status in-progress', input: ['task', 'update', 'my-task', 'status=in-progress'], expected: ['task', 'update', 'my-task', '--status', 'in-progress'] },
      // Arg aliases (--summary/--message → --log)
      { desc: 'task update --summary "text" → task update --log "text"', input: ['task', 'update', '--summary', 'text'], expected: ['task', 'update', '--log', 'text'] },
      { desc: 'task update --message "text" → task update --log "text"', input: ['task', 'update', '--message', 'text'], expected: ['task', 'update', '--log', 'text'] },
      // Combined: alias + arg alias
      { desc: 'task done my-task --summary "done" → task update --status done my-task --log "done"', input: ['task', 'done', 'my-task', '--summary', 'done'], expected: ['task', 'update', '--status', 'done', 'my-task', '--log', 'done'] },
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
