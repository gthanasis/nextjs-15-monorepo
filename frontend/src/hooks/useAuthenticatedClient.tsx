import { useSession } from 'next-auth/react'
import { ApiClient, client } from 'api-client'

export function useAuthenticatedClient(): ApiClient {
  const { data } = useSession()
  const accessToken = data?.user?.accessToken || ''
  if (accessToken) client.setToken(accessToken)
  return client
}
