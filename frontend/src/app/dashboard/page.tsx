import Authenticated from '@/guards/authenticated'

export default async function DashboardPage() {
  await Authenticated()
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold">Dashboard (Authenticated Only)</h1>
    </div>
  )
}
