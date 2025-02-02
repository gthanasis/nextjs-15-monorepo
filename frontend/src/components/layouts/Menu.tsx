'use client'
import { signIn, useSession, signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import React from 'react'
import useGoogleOneTap from '@/hooks/useOneTapSignIn'
import LoginModal from '@/components/modals/LoginModal'
import Image from 'next/image'

export default function Menu() {
  const { data } = useSession()
  const { user } = data || {}
  useGoogleOneTap({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    onSuccess: async (credential) => {
      await signIn('credentials', { idToken: credential, redirect: false })
    },
    onError: (error) => {
      console.log('OneTap error:', error)
    },
    autoSelect: false,
  })
  const logOut = () => {
    signOut()
  }

  const userAvatarMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex items-center justify-center">
          <Image
            className="h-8 w-8 rounded-full object-cover"
            src={user?.image || 'https://via.placeholder.com/150'}
            alt=""
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{user?.name}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logOut}>
          Log out
          <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
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
              {user ? userAvatarMenu : <LoginModal trigger={<Button>Login</Button>} />}
            </div>
          </div>
        </nav>
      </header>
    </>
  )
}
