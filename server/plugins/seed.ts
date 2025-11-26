import { seedRoutes } from '../utils/seedRoutes'

export default defineNitroPlugin(async (nitroApp) => {
  try {
    await connectDB()
    await seedRoutes()
  } catch (error) {
    console.error('Error seeding routes:', error)
  }
})
