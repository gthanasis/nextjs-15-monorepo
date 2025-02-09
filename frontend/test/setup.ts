import '@testing-library/jest-dom/vitest'
import { vi } from 'vitest'

// Mock NextAuth.js session
vi.mock('next-auth/react', () => ({
  useSession: vi.fn(() => ({ data: null, status: 'unauthenticated' })),
  signIn: vi.fn(),
  signOut: vi.fn(),
}))
