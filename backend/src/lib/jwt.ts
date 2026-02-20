import { SignJWT, jwtVerify } from 'jose'

export interface JwtPayload {
  sub: string
  email: string
}

function getSecret(envVar: string): Uint8Array {
  const value = process.env[envVar]
  if (!value) throw new Error(`Missing required environment variable: ${envVar}`)
  return new TextEncoder().encode(value)
}

export async function signAccessToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(getSecret('JWT_ACCESS_SECRET'))
}

export async function signRefreshToken(payload: JwtPayload): Promise<string> {
  return new SignJWT({ email: payload.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret('JWT_REFRESH_SECRET'))
}

export async function verifyAccessToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret('JWT_ACCESS_SECRET'), {
    algorithms: ['HS256'],
  })
  return { sub: payload.sub as string, email: payload['email'] as string }
}

export async function verifyRefreshToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret('JWT_REFRESH_SECRET'), {
    algorithms: ['HS256'],
  })
  return { sub: payload.sub as string, email: payload['email'] as string }
}
