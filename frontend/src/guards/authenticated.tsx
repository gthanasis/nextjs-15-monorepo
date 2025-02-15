import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from 'next-auth'

export default async function Authenticated(): Promise<Session> {
  const session = await auth()
  if (!session) return redirect('/not-allowed')
  return session
}
