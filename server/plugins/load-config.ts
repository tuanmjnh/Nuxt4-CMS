import { connectDB } from '../utils/mongodb'
import { SystemConfig } from '../models/SystemConfig'

export default defineNitroPlugin(async (nitroApp) => {
  try {
    // Ensure DB is connected
    await connectDB()

    console.log('🔄 Loading system configuration from database...')

    const configs = await SystemConfig.find({})
    const runtimeConfig = useRuntimeConfig()

    let loadedCount = 0
    for (const config of configs) {
      if (config.isPublic) {
        // Update public config
        // @ts-ignore
        if (!runtimeConfig.public) runtimeConfig.public = {}
        // @ts-ignore
        runtimeConfig.public[config.key] = config.value
      } else {
        // Update private config
        // @ts-ignore
        runtimeConfig[config.key] = config.value
      }
      loadedCount++
    }

    console.log(`✅ Loaded ${loadedCount} system configurations`)
  } catch (error) {
    console.error('❌ Failed to load system configuration:', error)
    // Don't crash the app if config fails to load, just log error
  }
})
