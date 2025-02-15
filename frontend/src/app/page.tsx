import { DashBoardLayout } from '@/components/layouts/DashBoardLayout'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function Page() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center bg-black text-white px-6 overflow-hidden">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_#333_0%,_#000_100%)]" />
        {/* Moving Background */}
        <div className="absolute inset-0 before:absolute before:inset-0 before:bg-[url('/grid.svg')] before:opacity-10 animate-wavyBackground" />
      </div>

      <div className="relative text-center">
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">Next.js 15 Monorepo</h1>
        <p className="mt-4 text-lg text-gray-300">A simple, kickstart app with Authentication included.</p>

        {/* Call to Action */}
        <div className="mt-8">
          <Button
            variant="outline"
            size="lg"
            className={cn('flex items-center gap-3 border-gray-500 text-black text-2xl py-4 px-8 scale-125')}
            asChild
          >
            <Link href="/public">Get Started</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
