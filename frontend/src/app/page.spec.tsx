import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import Page from './page'

describe('Page Component', () => {
  it('displays the main heading', () => {
    render(<Page />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Next.js 15 Monorepo')
  })

  it('displays the subtext', () => {
    render(<Page />)
    expect(screen.getByText('A simple, kickstart app with Authentication included.')).toBeInTheDocument()
  })

  it('renders the Get Started link', () => {
    render(<Page />)
    const link = screen.getByRole('link', { name: /get started/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/public')
  })
})
