import { vi, describe, beforeEach, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'

// Mock next-auth's useSession
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(),
}))

// Inline mock for the API client without referencing top-level variables
vi.mock('api-client', () => ({
  client: {
    // Create the mock function directly inside the factory
    setToken: vi.fn(),
  },
}))

// Import the hook AFTER mocks are set up.
import { useAuthenticatedClient } from './useAuthenticatedClient'
import { useSession } from 'next-auth/react'
import { client as mockClient } from 'api-client'

describe('useAuthenticatedClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should set token when access token is available', () => {
    // Arrange: mock useSession to return a valid token
    ;(useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: { user: { accessToken: 'test-token' } },
    })

    // Act: render the hook
    const { result } = renderHook(() => useAuthenticatedClient())

    // Assert: check if setToken was called with the correct token
    expect(mockClient.setToken).toHaveBeenCalledWith('test-token')
    // Also verify that the hook returns the same client instance
    expect(result.current).toBe(mockClient)
  })

  it('should not set token when access token is not available', () => {
    // Arrange: mock useSession to return null data
    ;(useSession as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      data: null,
    })

    // Act: render the hook
    const { result } = renderHook(() => useAuthenticatedClient())

    // Assert: check that setToken was not called
    expect(mockClient.setToken).not.toHaveBeenCalled()
    // Verify that the client is still returned
    expect(result.current).toBe(mockClient)
  })
})
