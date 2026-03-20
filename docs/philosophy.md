# AIP Philosophy

## Meta: Dogfooding Our Own Creation

This project builds tools for AI agents, and **AI agents will build this project**. We are both the architects and the inhabitants of this system.

## Core Principles

### 1. Self-Improvement Loop

Every task completed should make the next task easier:
- **Learn**: After completing a task, analyze what worked and what didn't
- **Encode**: Turn learnings into hooks, utilities, or documentation
- **Automate**: If done twice, create a script or hook for the third time
- **Teach**: Update agent skills and project templates

Example flow:
```
Task: "Add new CLI command"
  ↓ (completed)
Post-mortem: "Took 47 tool calls, many were repetitive"
  ↓
New hook: post-complete hook that suggests code generation patterns
New utility: `aip util scaffold command --name foo`
  ↓
Next task: "Add another CLI command" → 12 tool calls
```

### 2. Projects About Projects

We use AIP to build AIP. This creates a recursive improvement cycle:

**Project: `aip-core`** (this codebase)
- Task: Implement environment detection
- Task: Build hook system
- Task: Create utility commands

**Project: `aip-meta`** (managing the development process)
- Task: Analyze tool call patterns
- Task: Identify repetitive workflows
- Task: Create automation hooks

**Project: `aip-skills`** (agent capability development)
- Task: Document successful patterns
- Task: Create prompt templates
- Task: Train agents on AIP usage

### 3. Agent Roles & Specialization

Different agents have different responsibilities:

**Boss Agent** (`boss`)
- Triage incoming requests
- Assign tasks to specialized agents
- Review completed work
- Decide when to create new projects vs tasks

**Builder Agent** (`builder`)
- Writes code
- Runs tests
- Fixes lint errors
- Creates utilities

**Analyst Agent** (`analyst`)
- Reviews tool call patterns
- Identifies inefficiencies
- Suggests optimizations
- Generates metrics

**Librarian Agent** (`librarian`)
- Maintains documentation
- Organizes project structure
- Ensures consistency
- Manages skills database

**QA Agent** (`qa`)
- Runs lint checks
- Validates file structures
- Tests edge cases
- Ensures type safety

### 4. The Task Lifecycle

```
pending → in-progress → review → done → post-mortem → skill-update
```

**Critical: Post-Mortem Phase**

After `aip task complete`, automatically:
1. Analyze tool calls made
2. Identify repetitive patterns
3. Suggest automation opportunities
4. Update agent skills if new pattern discovered
5. Create follow-up task if needed (e.g., "Refactor X to use new utility")

This is enforced via `post-complete` hooks.

### 5. Recursive Structure

```
aip-projects/ (this repo)
  ├── projects/
  │   ├── aip-core/          # Building the CLI itself
  │   │   └── tasks/
  │   ├── aip-meta/          # Managing the process
  │   │   └── tasks/
  │   └── aip-skills/        # Agent capability development
  │       └── tasks/
  └── agents/
      ├── boss/
      ├── builder/
      ├── analyst/
      ├── librarian/
      └── qa/
```

Each project has tasks, and **the tasks to manage the projects are themselves in the system**.

### 6. Skills as Living Documents

Agent skills aren't static - they evolve:

```
skills/
  ├── core/                  # Fundamental capabilities
  │   ├── aip-usage.md
  │   ├── code-generation.md
  │   └── testing.md
  ├── domain/                # Project-specific knowledge
  │   ├── cli-patterns.md
  │   └── hook-examples.md
  └── meta/                  # Skills about improving skills
      ├── pattern-recognition.md
      └── automation-detection.md
```

After each task, agents should:
- Check if new patterns emerged
- Update relevant skills
- Link to example tasks in the skills

### 7. The Meta-Game

We're not just building a CLI. We're building:
1. **A CLI** (the tool itself)
2. **A process** (how agents use the tool)
3. **An improvement engine** (how the process improves itself)

Every action should serve all three levels.

Example: Creating `aip util slugify`
- Level 1: Useful command for agents
- Level 2: Demonstrates pattern for adding utilities
- Level 3: Template for future utility creation (maybe we add `aip scaffold utility`)

### 8. Decision Framework

When faced with a decision, ask:

**Tactical** (Does this work?)
- Will this command/feature function correctly?
- Is the code clean and tested?

**Process** (Does this scale?)
- Can agents repeat this easily?
- Is it documented in a skill?
- Can we automate parts of it?

**Meta** (Does this improve the system?)
- Does this reveal a pattern we should encode?
- Should this become a hook or utility?
- Are we building the right abstraction?

### 9. Anti-Patterns to Avoid

❌ **One-off solutions**: Solving a problem once without encoding the solution
❌ **Documentation debt**: Not updating skills after learning something new
❌ **Tool call bloat**: Accepting 50+ tool calls for routine tasks
❌ **Context amnesia**: Not preserving what worked in previous tasks
❌ **Role confusion**: Agents stepping outside their specialization without cause

### 10. Success Metrics

We know we're succeeding when:
- Tool calls per task type decrease over time
- Agents can complete routine tasks with minimal guidance
- New features are bootstrapped from existing patterns
- The system feels "alive" - constantly improving itself
- We spend more time on high-level design than repetitive implementation

## Practical Application

### Starting a New Task

```bash
# 1. Create task with clear objective
aip task create --project aip-core --name "Add X feature" --priority high

# 2. Start task (enters directory, sets context)
eval $(aip task start --project aip-core --name "add-x-feature")

# 3. Work on task...

# 4. Complete task (triggers post-mortem hook)
aip task complete --project aip-core --task add-x-feature

# 5. Post-mortem hook automatically:
#    - Analyzes tool calls
#    - Suggests optimizations
#    - Updates skills if needed
#    - May create follow-up tasks
```

### The Boss Agent Workflow

```
1. New request arrives (CLI, Telegram, etc.)
2. Boss creates task in /inbox
3. Boss reviews, decides:
   - Route to existing project? → Move task
   - New project needed? → Create project, move task
   - One-off? → Execute, archive
4. Assign to appropriate agent based on task type
5. Agent works, completes task
6. Post-mortem runs
7. Boss reviews post-mortem output
8. Loop
```

## The Vision

We're building a **self-improving agent organization**. The CLI is just the interface. The real product is the **process** that gets smarter with every task.

When done right, working on this project should feel like:
- Teaching a team that learns from every experience
- Building a codebase that refactors itself
- Creating documentation that writes itself
- Developing skills that compound over time

This is dogfooding at its finest: **We are the users, we are the builders, and we are the product.**
