import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import useGoogleOneTap from './useGoogleOneTap'

// Mock Google Identity Services API
const mockGoogle = {
  accounts: {
    id: {
      initialize: vi.fn(),
      prompt: vi.fn(),
      renderButton: vi.fn(),
    },
  },
}

describe('useGoogleOneTap Hook', () => {
  beforeEach(() => {
    // Mock window.google globally
    ;(global as any).window.google = mockGoogle
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize Google One Tap on mount', () => {
    const onSuccess = vi.fn()
    const onError = vi.fn()

    renderHook(() =>
      useGoogleOneTap({
        clientId: 'test-client-id',
        onSuccess,
        onError,
      })
    )

    expect(mockGoogle.accounts.id.initialize).toHaveBeenCalledWith({
      client_id: 'test-client-id',
      callback: expect.any(Function),
      auto_select: true,
      context: 'signin',
    })
  })

  it('should not initialize if window.google is undefined', () => {
    ;(global as any).window.google = undefined

    const onSuccess = vi.fn()
    const onError = vi.fn()

    renderHook(() =>
      useGoogleOneTap({
        clientId: 'test-client-id',
        onSuccess,
        onError,
      })
    )

    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).not.toHaveBeenCalled()
  })

  it('should call onSuccess if Google callback returns a valid credential', () => {
    const onSuccess = vi.fn()
    const onError = vi.fn()

    renderHook(() =>
      useGoogleOneTap({
        clientId: 'test-client-id',
        onSuccess,
        onError,
      })
    )

    // Simulate Google callback response
    const callback = mockGoogle.accounts.id.initialize.mock.calls[0][0].callback
    callback({ credential: 'valid-token' })

    expect(onSuccess).toHaveBeenCalledWith('valid-token')
    expect(onError).not.toHaveBeenCalled()
  })

  it('should call onError if Google callback does not return a credential', () => {
    const onSuccess = vi.fn()
    const onError = vi.fn()

    renderHook(() =>
      useGoogleOneTap({
        clientId: 'test-client-id',
        onSuccess,
        onError,
      })
    )

    // Simulate Google callback response
    const callback = mockGoogle.accounts.id.initialize.mock.calls[0][0].callback
    callback({ credential: null })

    expect(onSuccess).not.toHaveBeenCalled()
    expect(onError).toHaveBeenCalledWith('Google One Tap authentication failed.')
  })

  it('should trigger the Google prompt when calling prompt()', () => {
    const { result } = renderHook(() =>
      useGoogleOneTap({
        clientId: 'test-client-id',
      })
    )

    act(() => {
      result.current.prompt()
    })

    expect(mockGoogle.accounts.id.prompt).toHaveBeenCalled()
  })

  it('should not prompt if already prompting', () => {
    const { result } = renderHook(() =>
      useGoogleOneTap({
        clientId: 'test-client-id',
      })
    )

    // First call
    act(() => {
      result.current.prompt()
    })

    // Second call should not happen if already prompting
    act(() => {
      result.current.prompt()
    })

    expect(mockGoogle.accounts.id.prompt).toHaveBeenCalledTimes(1)
  })

  it('should call renderButton with correct parameters', () => {
    const { result } = renderHook(() =>
      useGoogleOneTap({
        clientId: 'test-client-id',
      })
    )

    const mockElement = document.createElement('div')
    const options = { theme: 'outline', size: 'large', width: 200 }

    act(() => {
      result.current.renderGoogleButton(mockElement, options)
    })

    expect(mockGoogle.accounts.id.renderButton).toHaveBeenCalledWith(mockElement, options)
  })
})
