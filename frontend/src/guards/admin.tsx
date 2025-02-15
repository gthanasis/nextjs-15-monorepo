import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Session } from 'next-auth'

export default async function Admin(): Promise<Session> {
  const session = await auth()
  const role = session?.user?.role
  if (!role || role !== 'admin' || session === null) return redirect('/not-allowed')
  return session
}
