import mongoose from 'mongoose'

let isConnected = false

export const connectDB = async () => {
  if (isConnected) {
    return
  }

  try {
    const config = useRuntimeConfig()
    const uri = config.mongodbUri
    console.log(uri)

    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables')
    }

    await mongoose.connect(uri, {
      dbName: 'nuxt4-cms',
    })
    isConnected = true
    console.log('✅ MongoDB connected successfully')
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    throw error
  }
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
