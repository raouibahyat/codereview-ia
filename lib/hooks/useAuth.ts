'use client'
import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { authApi } from '@/lib/api/auth.api'
import { LoginPayload, RegisterPayload } from '@/lib/types/auth.types'

export function useAuth() {
  const router = useRouter()
  const { user, accessToken, isLoading, setAuth, clearAuth } = useAuthStore()

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await authApi.login(payload)
    setAuth(data.user, data.accessToken)
    router.push('/dashboard')
  }, [setAuth, router])

  const register = useCallback(async (payload: RegisterPayload) => {
    const data = await authApi.register(payload)
    setAuth(data.user, data.accessToken)
    router.push('/dashboard')
  }, [setAuth, router])

  const logout = useCallback(async () => {
    await authApi.logout()
    clearAuth()
    router.push('/login')
  }, [clearAuth, router])

  const loginWithGithub = useCallback(() => {
    window.location.href = authApi.getGithubOAuthUrl()
  }, [])

  return {
    user,
    accessToken,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    loginWithGithub,
  }
}