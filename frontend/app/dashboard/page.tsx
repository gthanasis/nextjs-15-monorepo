import { getServerSession } from 'next-auth'
import Menu from '@/components/layouts/Menu'

export default async function DashboardPage() {
  const session = await getServerSession()

  return (
    <div className="min-h-screen">
      <Menu />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="mt-4">Welcome, {session?.user?.name}</p>
        </div>
      </main>
    </div>
  )
}
