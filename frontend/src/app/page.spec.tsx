import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Page from './page'
import { vi } from 'vitest'

// Mock the `DashBoardLayout` to avoid testing its implementation
vi.mock('@/components/layouts/dashboard/DashBoardLayout', () => ({
  DashBoardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}))

describe('Page Component', () => {
  it('renders the dashboard layout', () => {
    render(<Page />)
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument()
  })

  it('displays the welcome message', () => {
    render(<Page />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Welcome to Your App')
  })

  it('displays the subtext', () => {
    render(<Page />)
    expect(screen.getByText('This is your public landing page.')).toBeInTheDocument()
  })
})
