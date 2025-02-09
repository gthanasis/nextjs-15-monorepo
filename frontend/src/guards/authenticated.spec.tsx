import { describe, it, expect, vi, afterEach, Mock } from 'vitest'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import type { Session } from 'next-auth'
import Authenticated from '@/guards/authenticated'

// Mock NextAuth `auth` function
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

// Mock Next.js `redirect`
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))

describe('Authenticated Component', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should call `auth` to get the session', async () => {
    vi.mocked(auth as Mock).mockResolvedValue({
      user: { name: 'John Doe', email: 'john@example.com', image: 'profile.jpg' },
    } as Session) // ✅ Explicitly casting as `Session`

    await Authenticated()

    expect(auth).toHaveBeenCalled()
  })

  it('should redirect if no session exists', async () => {
    vi.mocked(auth as Mock).mockResolvedValue(null)

    await Authenticated()

    expect(redirect).toHaveBeenCalledWith('/not-allowed')
  })

  it('should not redirect if session exists', async () => {
    vi.mocked(auth as Mock).mockResolvedValue({
      user: { name: 'John Doe', email: 'john@example.com', image: 'profile.jpg' },
    } as Session) // ✅ Ensure it's cast as `Session`

    await Authenticated()

    expect(redirect).not.toHaveBeenCalled()
  })
})
