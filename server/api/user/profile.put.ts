import { User } from '../../models/User'

export default defineEventHandler(async (event) => {
  try {
    // Get user from context (set by auth middleware)
    const currentUser = event.context.user

    if (!currentUser) throw createError({ statusCode: 401, message: 'Not authenticated', statusMessage: 'error.unauthorized' })

    const body = await readBody(event)
    const { name, username, email, bio, avatar, personNumber, region, dateBirth, gender, address } = body

    // Connect to database
    await connectDB()

    // Get current user
    const user = await User.findById(currentUser.userId)

    if (!user || !user.isActive) throw createError({ statusCode: 404, message: 'User not found or inactive', statusMessage: 'error.not_found' })

    // Check if email is being changed and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email })
      if (existingUser) throw createError({ statusCode: 400, message: 'Email already in use', statusMessage: 'error.validation' })
      user.email = email
    }

    // Check if username is being changed and if it's already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username })
      if (existingUser) throw createError({ statusCode: 400, message: 'Username already in use', statusMessage: 'error.validation' })
      user.username = username
    }

    // Update user fields
    if (name) user.name = name
    if (bio !== undefined) user.bio = bio
    if (personNumber !== undefined) user.personNumber = personNumber
    if (region !== undefined) user.region = region
    if (dateBirth !== undefined) user.dateBirth = dateBirth
    if (gender !== undefined) user.gender = gender
    if (address !== undefined) user.address = address

    if (avatar !== undefined) {
      user.avatar = avatar
      // Add to avatars history if not already present (checking by public_id or url if possible, otherwise deep equality or just push)
      // Assuming Cloudinary object has public_id
      if (avatar && avatar.public_id) {
        const exists = user.avatars?.some((a: any) => a.public_id === avatar.public_id)
        if (!exists) {
          user.avatars = [...(user.avatars || []), avatar]
        }
      } else if (avatar) {
        // Fallback for simple string or object without public_id
        user.avatars = [...(user.avatars || []), avatar]
      }
    }

    await user.save()

    // Return updated user without password
    const updatedUser = await User.findById(user._id)
      .select('-password')
      .populate('roles')

    if (!updatedUser) throw createError({ statusCode: 500, message: 'Failed to retrieve updated user', statusMessage: 'error.server_error' })

    return {
      success: true,
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          name: updatedUser.name,
          roles: updatedUser.roles,
          avatar: updatedUser.avatar,
          avatars: updatedUser.avatars,
          bio: updatedUser.bio,
          personNumber: updatedUser.personNumber,
          region: updatedUser.region,
          dateBirth: updatedUser.dateBirth,
          gender: updatedUser.gender,
          address: updatedUser.address
        }
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, statusMessage: 'error.server_error', message: error.message })
  }
})
