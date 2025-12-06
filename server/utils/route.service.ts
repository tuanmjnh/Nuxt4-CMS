import { SystemRoute } from '../models/SystemRoute'
import { hasPermission } from './permissions'

// Global variable cached in RAM
let routeCache: any[] | null = null

export const routeService = {
  // 1. Initialization function (Load from DB to RAM) 
  async load() {
    try {
      const routes = await SystemRoute.find().sort({ sort: 1 }).lean()
      routeCache = routes
      console.log('System Routes loaded:', routeCache?.length, 'items')
    } catch (e) {
      console.error('Failed to load routes:', e)
      routeCache = []
    }
  },

  // 2. Get all routes
  getAll() {
    return routeCache || []
  },

  // 3. Reload function
  async reload() {
    await this.load()
  },

  // 4. Get routes for user
  getForUser(permissions: string[] = []) {
    if (!routeCache) return []

    // Map routes by ID for quick parent lookup
    const routeMap = new Map(routeCache.map(r => [r._id.toString(), r]))

    const checkAccess = (route: any): boolean => {
      // 3.1 Check specific permissions if defined
      if (route.permissions && route.permissions.length > 0) {
        for (const permission of route.permissions) {
          if (!hasPermission(permission, permissions)) {
            return false
          }
        }
      }

      // 3.2 Check parent permission recursively
      if (route.parent) {
        const parentId = typeof route.parent === 'string' ? route.parent : route.parent.toString()
        const parent = routeMap.get(parentId)
        if (parent) {
          return checkAccess(parent)
        }
      }

      return true
    }

    return routeCache.filter(route => checkAccess(route))
  }
}
