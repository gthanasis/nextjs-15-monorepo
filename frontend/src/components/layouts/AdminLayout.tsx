import React from 'react'
import NavLink from '@/components/Menu/NavLink'
import Menu from '@/components/Menu/Menu'

export function AdminLayout(props: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <Menu>
        <NavLink href="/public">Back to app</NavLink>
      </Menu>
      <main className="flex-1 min-h-0 overflow-auto">{props.children}</main>
    </div>
  )
}
