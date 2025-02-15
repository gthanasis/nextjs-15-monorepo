import { auth } from '@/auth'
import React from 'react'
import Logo from '@/components/Logo/Logo'
import MenuAvatar from '@/components/Menu/MenuAvatar'

// Main Menu Component
export default async function Menu(props: { children: React.ReactNode }) {
  const { children } = props
  const session = await auth()
  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Logo />
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">{children}</div>
          </div>
          <div className="flex items-center">
            <MenuAvatar session={session} />
          </div>
        </div>
      </nav>
    </header>
  )
}
