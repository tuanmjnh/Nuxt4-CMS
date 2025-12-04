import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const limit = parseInt(body.limit as string) || 10
    // const cursor = query.cursor as string
    // const roles = query.role as string

    const filter: any = { isDeleted: false }

    if (body.cursor)
      filter.createdAt = { $lt: Number(body.cursor) }

    if (body.roles) {
      const roles = Array.isArray(body.roles) ? body.roles : [body.roles]
      const roleIds: string[] = []
      const roleNames: string[] = []

      roles.forEach((r: any) => {
        if (typeof r === 'string') {
          if (r.match(/^[0-9a-fA-F]{24}$/)) {
            roleIds.push(r)
          } else {
            roleNames.push(r)
          }
        }
      })

      if (roleNames.length > 0) {
        const { Role } = await import('../../models/Role')
        const foundRoles = await Role.find({ name: { $in: roleNames } }).select('_id')
        roleIds.push(...foundRoles.map(r => r._id.toString()))
      }

      if (roleIds.length > 0) {
        filter.roles = { $in: roleIds }
      }
    }

    const users = await User.find(filter, '-password')
      .populate('roles')
      .sort({ createdAt: -1 })
      .limit(limit)

    const nextCursor = users.length === limit ? (users[users.length - 1] as any).createdAt : null

    return {
      success: true,
      data: users,
      nextCursor
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
