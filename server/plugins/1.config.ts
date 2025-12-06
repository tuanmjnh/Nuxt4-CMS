import { connectDB } from '../utils/mongo.database'
import { configService } from '../utils/config.service'
import { routeService } from '../utils/route.service'
import { seedDatabase } from '../utils/seed.database'

export default defineNitroPlugin(async (nitroApp) => {
  try {
    // Ensure DB is connected
    await connectDB()

    // console.log('Loading system configuration from database...')

    // Load config into RAM
    await configService.load()

    // Seed Database
    await seedDatabase()

    // Load Routes into RAM (After seed to pick up new routes)
    await routeService.load()

    console.log('System configuration loaded successfully')
    // console.log(configService.getAll())
  } catch (error) {
    console.error('Failed to load system configuration:', error)
  }
})
