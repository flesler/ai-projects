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
  },
  files: {
    MAIN: 'main.md',
    STATUS: 'status.md',
    LOG: 'audit.log',
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
