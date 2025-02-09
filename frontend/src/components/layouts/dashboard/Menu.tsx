import { auth } from '@/auth'
import React from 'react'
import Logo from '@/components/Logo/Logo'
import NavLink from '@/components/layouts/dashboard/NavLink'
import MenuAvatar from '@/components/layouts/dashboard/MenuAvatar'

// Main Menu Component
export default async function Menu() {
  const session = await auth()
  return (
    <header className="bg-white shadow">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Logo />
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink href="/dashboard">Dashboard</NavLink>
              <NavLink href="/public">Public</NavLink>
              <NavLink href="/semi-restricted">Semi restricted</NavLink>
            </div>
          </div>
          <div className="flex items-center">
            <MenuAvatar session={session} />
          </div>
        </div>
      </nav>
    </header>
  )
}
