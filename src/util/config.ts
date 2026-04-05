export default {
  dirs: {
    PROJECTS: 'projects',
    SKILLS: 'skills',
    AGENTS: 'agents',
    // Subdirectories
    TASKS: 'tasks',
    INPUTS: 'inputs',
    OUTPUTS: 'outputs',
    HOOKS: 'hooks',
    SCRIPTS: 'scripts',
  },
  files: {
    MAIN: 'main.md',
    STATUS: 'status.tsv',
    LOG: 'audit.log',
    SKILL: 'SKILL.md',
  },
  hookTypes: [
    'pre-create',
    'post-create',
    'pre-complete',
    'post-complete',
    'pre-start',
    'post-start',
    'pre-update',
    'post-update',
  ] as const,
  languages: ['ts', 'js', 'sh', 'py'] as const,
  targets: ['project', 'task'] as const,
} as const
