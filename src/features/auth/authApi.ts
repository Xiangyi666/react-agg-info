import { http } from '@/services/api'
import { loginSchema, registerSchema } from './authSchema'
import type { LoginInput, RegisterInput } from './authSchema'
import { z } from 'zod'

const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
})

const authResponseSchema = z.object({
  user: userSchema,
  token: z.string(),
})

export type AuthResponse = z.infer<typeof authResponseSchema>

export async function login(credentials: LoginInput): Promise<AuthResponse> {
  const response = await http.post<unknown>(
    '/auth/login',
    loginSchema.parse(credentials)
  )
  return authResponseSchema.parse(response)
}

export async function register(input: RegisterInput): Promise<AuthResponse> {
  const response = await http.post<unknown>(
    '/auth/register',
    registerSchema.parse(input)
  )
  return authResponseSchema.parse(response)
}
