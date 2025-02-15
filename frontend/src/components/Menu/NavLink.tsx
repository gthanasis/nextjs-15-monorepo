// components/layouts/dashboard/NavLink.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLinkProps {
  href: string
  children: React.ReactNode
}

export default function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname()
  const isActive = pathname === href

  const baseClasses = 'inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium'
  const activeClasses = 'border-indigo-500 text-gray-900'
  const inactiveClasses = 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'

  return (
    <Link href={href} className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
      {children}
    </Link>
  )
}
