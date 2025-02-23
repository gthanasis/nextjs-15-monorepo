// Logo Component
import Link from 'next/link'

export default function Logo() {
  return (
    <div className="flex-shrink-0 flex items-center">
      <Link href="/public">
        <h1 className="text-xl font-bold">Your App</h1>
      </Link>
    </div>
  )
}
