import jwt from 'jsonwebtoken'

export interface JWTPayload {
  userId: string
  email: string
  username: string
  roles: (string | Models.Role)[]
  deviceType?: 'pc' | 'mobile' | 'tablet' | 'web'
}

export const generateAccessToken = (payload: JWTPayload): string => {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwt_secret as jwt.Secret, {
    expiresIn: (config.jwt_expire || '1d') as string | number
  } as jwt.SignOptions)
}

export const generateRefreshToken = (payload: JWTPayload): string => {
  const config = useRuntimeConfig()
  return jwt.sign(payload, config.jwt_refresh_secret as jwt.Secret, {
    expiresIn: (config.jwt_refresh_expire || '7d') as string | number
  } as jwt.SignOptions)
}

export const verifyAccessToken = (token: string): JWTPayload | null => {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwt_secret) as JWTPayload
  } catch (error) {
    return null
  }
}

export const verifyRefreshToken = (token: string): JWTPayload | null => {
  try {
    const config = useRuntimeConfig()
    return jwt.verify(token, config.jwt_refresh_secret) as JWTPayload
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
