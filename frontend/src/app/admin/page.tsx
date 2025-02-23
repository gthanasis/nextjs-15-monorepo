import Admin from '@/guards/admin'
import UsersTable from '@/app/admin/_components/UsersTable'
import { client, IUser } from 'api-client'

export default async function AdminPage() {
  const session = await Admin()
  if (session.user.accessToken) client.users.setToken(session.user.accessToken)
  const { res } = await client.users.getAll({
    pageSize: 10,
    page: 1,
  })
  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <UsersTable users={res} />
    </div>
  )
}
