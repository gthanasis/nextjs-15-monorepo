'use client'

import { useState } from 'react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { MoreHorizontal } from 'lucide-react'
import { IUserPublicProfile } from 'api-client'
import { useAuthenticatedClient } from '@/hooks/useAuthenticatedClient'

export default function UsersTable(props: { users: IUserPublicProfile[] }) {
  const client = useAuthenticatedClient()
  const [users, setUsers] = useState<IUserPublicProfile[]>(props.users)

  const toggleUserStatus = async (user: IUserPublicProfile) => {
    try {
      await (user.enabled ? client.users.disable(user.id) : client.users.enable(user.id))
      const { res } = await client.users.getAll({
        pageSize: 10,
        page: 1,
      })
      setUsers(res)
    } catch (error) {
      console.error('API Error:', error)
    }
  }

  const deleteUser = (id: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== id))
  }

  return (
    <div className="border rounded-lg shadow-sm p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={user.profileImage} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {user.name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell className="capitalize">{user.role}</TableCell>
              <TableCell>
                <Switch checked={user.enabled} onCheckedChange={() => toggleUserStatus(user)} />
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => toggleUserStatus(user)}>
                      {user.enabled ? 'Disable' : 'Enable'} User
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => deleteUser(user.id)} className="text-red-500">
                      Delete User
                    </DropdownMenuItem>
                    <DropdownMenuItem>Edit User</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
