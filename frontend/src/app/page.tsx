'use client'

import Menu from '@/components/layouts/Menu'

export default function Page() {
  return (
    <div className="min-h-screen">
      <Menu />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold">Welcome to Your App</h1>
          <p className="mt-4">This is your public landing page.</p>
        </div>
      </main>
    </div>
  )
}
