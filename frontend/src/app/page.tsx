import { DashBoardLayout } from '@/components/layouts/dashboard/DashBoardLayout'

export default function Page() {
  return (
    <DashBoardLayout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold">Welcome to Your App</h1>
        <p className="mt-4">This is your public landing page.</p>
      </div>
    </DashBoardLayout>
  )
}
