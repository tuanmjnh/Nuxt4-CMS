import jwt from 'jsonwebtoken'

export interface JWTPayload {
  userId: string
  email: string
  username: string
  role: string | Models.Role
  deviceType?: 'pc' | 'mobile' | 'tablet' | 'web'
}

export const generateAccessToken = (payload: JWTPayload): string => {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '15m' // 15 minutes
  })
}

export const generateRefreshToken = (payload: JWTPayload): string => {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: '7d' // 7 days
  })
}

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwtSecret) as JWTPayload
  } catch (error) {
    return null
  }
}

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwtRefreshSecret) as JWTPayload
  } catch (error) {
    return null
  }
}

export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7)
}
