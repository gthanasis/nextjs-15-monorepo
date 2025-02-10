'use client'
import React from 'react'
import { useSession } from 'next-auth/react'
import { Session } from 'next-auth'
import LoginModal from '@/components/modals/LoginModal'
import { Button } from '@/components/ui/button'
import UserDropdownMenu from '@/components/layouts/dashboard/UserDropdownMenu'

type Props = {
  session: Session | null
}

export default function MenuAvatar(props: Props) {
  const { session } = props
  const { data } = useSession()
  console.log(JSON.stringify(data, null, 2))
  const user = data?.user || session?.user

  return <>{user ? <UserDropdownMenu /> : <LoginModal trigger={<Button>Login</Button>} />}</>
}
