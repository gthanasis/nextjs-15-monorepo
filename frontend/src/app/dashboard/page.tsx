import Menu from '@/components/layouts/Menu'
import Authenticated from '@/guards/authenticated'

export default async function DashboardPage() {
  await Authenticated()
  return (
    <div className="min-h-screen">
      <Menu />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold">Dashboard</h1>
        </div>
      </main>
    </div>
  )
}
