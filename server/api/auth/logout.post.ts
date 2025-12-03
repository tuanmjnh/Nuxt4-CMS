import { UserSession } from '../../models/UserSession'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { refreshToken } = body

    if (refreshToken) {
      await connectDB()
      await UserSession.deleteOne({ refreshToken })
    }

    return { success: true, message: 'Logout successfully' }
  } catch (error) {
    // Ignore errors during logout
    return { success: true, message: 'Logout successfully' }
  }
})
