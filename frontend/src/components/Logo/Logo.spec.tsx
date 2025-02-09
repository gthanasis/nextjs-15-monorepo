import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Logo from '@/components/Logo/Logo'

describe('Logo Component', () => {
  it('displays the logo message', () => {
    render(<Logo />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Your App')
  })
})
