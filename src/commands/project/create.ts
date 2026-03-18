/**
 * aip project create
 * 
 * Create a new project with proper structure
 */

import { slugify } from '../../utils/slug.js'

export async function projectCreate(args: string[]) {
  const nameIdx = args.indexOf('--name')
  const descIdx = args.indexOf('--description')
  
  if (nameIdx === -1 || descIdx === -1) {
    console.error('Usage: aip project create --name "Project Name" --description "Description"')
    process.exit(1)
  }
  
  const name = args[nameIdx + 1]
  const description = args[descIdx + 1]
  
  const slug = slugify(name)
  
  console.log('Creating project:')
  console.log(`  Name: ${name}`)
  console.log(`  Slug: ${slug}`)
  console.log(`  Description: ${description}`)
  console.log('\n[TODO: Implement project creation]')
}
