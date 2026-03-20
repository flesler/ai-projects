#!/usr/bin/env tsx
/**
 * Generate shell completion scripts for AIP CLI
 * Usage: tsx bin/completion.ts [bash|zsh]
 */

import commands from '../src/commands/index.js'

const nouns = Object.keys(commands)
const nounVerbMap: Record<string, string[]> = {}

for (const noun of nouns) {
  nounVerbMap[noun] = Object.keys(commands[noun as keyof typeof commands])
}

const shell = process.argv[2] || 'bash'

if (shell === 'bash') {
  generateBashCompletion()
} else if (shell === 'zsh') {
  generateZshCompletion()
} else {
  console.error(`Unknown shell: ${shell}. Use 'bash' or 'zsh'`)
  process.exit(1)
}

function generateBashCompletion() {
  console.log(`# AIP CLI Bash Completion
# Source this file: source <(tsx bin/completion.ts bash)
# Or add to ~/.bashrc: eval "$(tsx bin/completion.ts bash)"

_aip_completion() {
  local cur prev words cword
  _init_completion || return

  # Complete nouns (first argument after 'aip')
  if ((cword == 1)); then
    COMPREPLY=($(compgen -W "${nouns.join(' ')}" -- "$cur"))
    return
  fi

  # Complete verbs (second argument)
  if ((cword == 2)); then
    local noun="\${words[1]}"
    case "$noun" in`)
  for (const noun of nouns) {
    console.log(`      ${noun}) COMPREPLY=($(compgen -W "${nounVerbMap[noun].join(' ')}" -- "$cur")) ;;`)
  }
  console.log(`    esac
    return
  fi

  # Complete options
  case "\${words[1]} \${words[2]}" in`)
  for (const noun of nouns) {
    for (const verb of nounVerbMap[noun]) {
      console.log(`    '${noun} ${verb}') COMPREPLY=($(compgen -f -- "$cur")) ;;`)
    }
  }
  console.log(`  esac
}

complete -F _aip_completion aip`)
}

function generateZshCompletion() {
  console.log(`#compdef aip
# AIP CLI Zsh Completion
# Source this file: source <(tsx bin/completion.ts zsh)
# Or add to ~/.zshrc: eval "$(tsx bin/completion.ts zsh)"

_aip() {
  local -a nouns`)
  console.log(`  nouns=(
${nouns.map(n => `    '${n}'`).join('\n')}
  )`)

  for (const noun of nouns) {
    console.log(`  local -a ${noun}_verbs=(
${nounVerbMap[noun].map(v => `    '${v}'`).join('\n')}
  )`)
  }

  console.log(`
  _arguments -C \\
    '1:noun:->nouns' \\
    '2:verb:->verbs' \\
    '*::arg:->args'

  case $state in
    nouns)
      _describe 'noun' nouns
      ;;
    verbs)
      local noun=$words[1]
      case $noun in`)
  for (const noun of nouns) {
    console.log(`        (${noun}) _describe 'verb' ${noun}_verbs ;;`)
  }
  console.log(`      esac
      ;;
    args)
      _files
      ;;
  esac
}

_aip`)
}
