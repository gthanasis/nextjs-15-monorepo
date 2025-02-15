import React from 'react'
import NavLink from '@/components/Menu/NavLink'
import Menu from '@/components/Menu/Menu'

export function DashBoardLayout(props: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <Menu>
        <NavLink href="/public">🌍 Public</NavLink>
        <NavLink href="/dashboard">📊 Dashboard</NavLink>
        <NavLink href="/semi-restricted">🔒 Semi Restricted</NavLink>
        <NavLink href="/admin">🛠️ Admin Panel</NavLink>
      </Menu>
      <main className="flex-1 min-h-0 overflow-auto">{props.children}</main>
    </div>
  )
}
