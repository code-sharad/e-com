import { seedCustomers } from '@/lib/seed-data'

async function main() {
  try {
    await seedCustomers()
    console.log('Seeding completed successfully!')
  } catch (error) {
    console.error('Error during seeding:', error)
    process.exit(1)
  }
}

main() 