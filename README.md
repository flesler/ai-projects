# AIP - AI Project Management CLI

Command-line tool for managing AI agent projects, tasks, and agents.

## Installation

```bash
npm install -g aip
```

## Usage

```bash
aip <noun> <verb> [options]
```

### Projects

```bash
# Create a new project
aip project create --name "Project Name" --description "Description"
```

### Tasks

```bash
# Create a new task in a project
aip task create --project "project-name" --name "Task Name"

# Mark a task as complete
aip task complete --project "project-name" --task "task-name"
```

### Agents

```bash
# Create a new agent profile
aip agent create --name "agent-name" --description "Agent description"
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run dev

# Test
npm test
```

## License

MIT
# Test change
