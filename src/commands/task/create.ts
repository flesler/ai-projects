/**
 * aip task create
 * 
 * Create a new task in a project
 */

export async function taskCreate(args: string[]) {
  const projectIdx = args.indexOf('--project')
  const nameIdx = args.indexOf('--name')
  
  if (projectIdx === -1 || nameIdx === -1) {
    console.error('Usage: aip task create --project "project-name" --name "Task Name"')
    process.exit(1)
  }
  
  const project = args[projectIdx + 1]
  const name = args[nameIdx + 1]
  
  console.log('Creating task:')
  console.log(`  Project: ${project}`)
  console.log(`  Name: ${name}`)
  console.log('\n[TODO: Implement task creation]')
}
