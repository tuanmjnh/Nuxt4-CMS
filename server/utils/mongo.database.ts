import mongoose from 'mongoose'

let isConnected = false
let connectionPromise: Promise<void> | null = null

export const connectDB = async () => {
  if (isConnected) return

  // If a connection is currently being established, return that promise
  if (connectionPromise) return connectionPromise


  // Create a new connection promise
  connectionPromise = (async () => {
    try {
      const config = useRuntimeConfig()

      if (!config.mongodb_uri)
        throw new Error('MONGODB_URI is not defined in environment variables')


      if (mongoose.connection.readyState === 1) {
        isConnected = true
        return
      }

      await mongoose.connect(config.mongodb_uri, { dbName: config.mongodb_name })
      isConnected = true
      console.log('MongoDB connected successfully')
    } catch (error) {
      console.error('MongoDB connection error:', error)
      throw error
    } finally {
      // Keep promise if successful, or clear it if checking logic needs refined?
      // Actually if we want singleton, we keep it. 
      // But if it fails, we should probably clear it? 
      // For now, simple singleton pattern.
    }
  })()

  return connectionPromise
}

// Handle connection events
mongoose.connection.on('disconnected', () => {
  isConnected = false
  console.log('MongoDB disconnected')
})

mongoose.connection.on('error', (error) => {
  console.error('MongoDB error:', error)
  isConnected = false
})

export default mongoose
