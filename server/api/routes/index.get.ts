import { SystemRoute } from '../../models/SystemRoute'
import { routeService } from '../../utils/route.service'

export default defineEventHandler(async (event) => {
  try {
    const currentUser = event.context.user
    if (!currentUser)
      throw createError({ statusCode: 401, message: 'Not authenticated', statusMessage: 'error.unauthorized' })

    // 1. Ensure DB is connected (though routeService is likely loaded)
    await connectDB()

    // 2. Get User Permissions
    const userPermissions = currentUser.permissions || []

    // 3. Get filtered routes from RAM Cache
    const cleanRoutes = routeService.getForUser(userPermissions)

    // If cache is empty, try to reload (fallback)
    if (cleanRoutes.length === 0 && (await SystemRoute.countDocuments()) > 0) {
      await routeService.reload()
      return { success: true, data: routeService.getForUser(userPermissions) }
    }

    return { success: true, data: cleanRoutes }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: error.message, statusMessage: 'error.server_error' })
  }
})
