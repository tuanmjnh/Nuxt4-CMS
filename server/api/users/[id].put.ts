import { User } from '../../models/User'
import { Role } from '../../models/Role'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const body = await readBody(event)

  // Check admin permission
  const currentUser = event.context.user
  const isAdmin = currentUser && currentUser.roles && currentUser.roles.some((r: any) => r.name === 'admin' || r === 'admin')
  if (!isAdmin)
    throw createError({ statusCode: 403, message: 'Access denied', statusMessage: 'error.unauthorized' })

  try {
    const user = await User.findById(id)
    if (!user)
      throw createError({ statusCode: 404, message: 'User not found', statusMessage: 'error.user_not_found' })

    // If roles are passed, resolve them
    if (body.roles && Array.isArray(body.roles)) {
      const roleIds = []
      for (const roleInput of body.roles) {
        if (typeof roleInput === 'string' && roleInput.match(/^[0-9a-fA-F]{24}$/)) {
          roleIds.push(roleInput)
        } else if (typeof roleInput === 'string') {
          const roleDoc = await Role.findOne({ name: roleInput })
          if (roleDoc) {
            roleIds.push(roleDoc._id)
          }
        }
      }
      body.roles = roleIds
    }

    // Update fields
    Object.assign(user, body)

    // Handle avatars history if avatar is updated
    if (body.avatar) {
      if (body.avatar.public_id) {
        const exists = user.avatars?.some((a: any) => a.public_id === body.avatar.public_id)
        if (!exists) {
          user.avatars = [...(user.avatars || []), body.avatar]
        }
      } else {
        user.avatars = [...(user.avatars || []), body.avatar]
      }
    }

    await user.save()

    // Return user without password and populated
    const updatedUser = await User.findById(id).select('-password').populate('roles')
    return { success: true, data: updatedUser }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
