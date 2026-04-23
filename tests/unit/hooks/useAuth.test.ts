import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthProvider, useAuth } from './useAuth'
import * as authLib from '@/lib/auth'

vi.mock('@/lib/auth')

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('throws error when used outside AuthProvider', () => {
    expect(() => renderHook(() => useAuth())).toThrow('useAuth must be used within an AuthProvider')
  })

  it('initializes with no user', async () => {
    vi.mocked(authLib.getCurrentUser).mockResolvedValue(null)
    
    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('handles login successfully', async () => {
    vi.mocked(authLib.getCurrentUser).mockResolvedValue(null)
    vi.mocked(authLib.signIn).mockResolvedValue({
      data: {
        id: '1',
        email: 'test@example.com',
        role: 'jobseeker',
        first_name: 'Test',
        last_name: 'User',
        created_at: new Date().toISOString(),
      },
      error: null,
    })

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => expect(result.current.isLoading).toBe(false))

    const { error } = await result.current.login('test@example.com', 'password')
    
    expect(error).toBeNull()
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user?.email).toBe('test@example.com')
  })
})
