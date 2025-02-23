import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useSession } from 'next-auth/react'
import { useAuthenticatedClient } from './setUserToken'
import { ApiClient } from 'api-client'

// Mock next-auth useSession hook
vi.mock('next-auth/react')

describe('useAuthenticatedClient', () => {
  let mockClient: ApiClient

  beforeEach(() => {
    // Create a mock client before each test
    mockClient = {
      setToken: vi.fn(),
    } as unknown as ApiClient

    // Clear all mocks before each test
    vi.clearAllMocks()
  })

  it('should set token when access token is available', () => {
    // Mock useSession to return an access token
    ;(useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        user: {
          accessToken: 'test-token',
        },
      },
    })

    // Render the hook
    const { result } = renderHook(() => useAuthenticatedClient(mockClient))

    // Check if setToken was called with the correct token
    expect(mockClient.setToken).toHaveBeenCalledWith('test-token')
    // Check if the client is returned
    expect(result.current).toBe(mockClient)
  })

  it('should not set token when access token is not available', () => {
    // Mock useSession to return no data
    ;(useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
    })

    // Render the hook
    const { result } = renderHook(() => useAuthenticatedClient(mockClient))

    // Check if setToken was not called
    expect(mockClient.setToken).not.toHaveBeenCalled()
    // Check if the client is returned
    expect(result.current).toBe(mockClient)
  })
})
