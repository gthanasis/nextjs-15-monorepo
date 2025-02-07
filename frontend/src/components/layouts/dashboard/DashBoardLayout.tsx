import Menu from '@/components/layouts/dashboard/Menu'

export function DashBoardLayout(props: { children: React.ReactNode }) {
  return (
    <div className="h-screen flex flex-col">
      <Menu />
      <main className="flex-1 min-h-0 overflow-auto">{props.children}</main>
    </div>
  )
}
