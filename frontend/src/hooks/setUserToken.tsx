import { useSession } from 'next-auth/react'
import { ApiClient } from 'api-client'

export function useAuthenticatedClient(client: ApiClient): ApiClient {
  const { data } = useSession()
  const accessToken = data?.user?.accessToken || ''
  if (accessToken) client.setToken(accessToken)
  return client
}
