import api from './axios'
import { AuthResponse, LoginPayload, RegisterPayload } from '@/lib/types/auth.types'

export const authApi = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', payload)
    return data
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', payload)
    return data
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout')
  },

  me: async () => {
    const { data } = await api.get('/auth/me')
    return data
  },

  getGithubOAuthUrl: (): string => {
    return `${process.env.NEXT_PUBLIC_API_URL}/auth/github`
  },
}