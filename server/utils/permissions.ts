/**
 * Check if a user has permission for a specific path
 * @param path The path to check access for (e.g., '/api/users')
 * @param permissions The list of permissions the user has (e.g., ['*', '/api/users/*'])
 * @returns boolean
 */
export const hasPermission = (path: string, permissions: string[]): boolean => {
  if (!permissions || permissions.length === 0) return false

  // Check for full wildcard access
  if (permissions.includes('*')) return true

  // Check specific permissions
  return permissions.some(permission => {
    // Exact match
    if (permission === path) return true

    // Wildcard match (e.g., /api/users/* matches /api/users/create)
    if (permission.endsWith('/*')) {
      const prefix = permission.slice(0, -2) // Remove /*
      return path.startsWith(prefix)
    }

    return false
  })
}
