import { auth } from '@/auth'
import React from 'react'
import MenuAvatar from '@/components/layouts/MenuAvatar'

export default async function Menu() {
  const session = await auth()
  return (
    <>
      <header className="bg-white shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold">Your App</h1>
              </div>
            </div>
            <div className="flex items-center">
              <MenuAvatar session={session} />
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}
