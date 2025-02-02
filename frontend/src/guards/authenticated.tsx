import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function Authenticated() {
  const session = await auth()
  if (!session) return redirect('/not-allowed')
}
