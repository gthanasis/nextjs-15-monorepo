import { useCallback, useEffect } from 'react'

// extend window in ts to include google.accounts.id
declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string
            callback: (response: { credential: string }) => void
            auto_select: boolean
            context: string
          }) => void
          prompt: () => void
          renderButton: (element: HTMLElement, options: { theme: string; size: string }) => void
        }
      }
    }
  }
}

type Props = {
  clientId: string
  onSuccess?: (credential: string) => void
  onError?: (error: string) => void
  autoSelect?: boolean
  context?: string
}

const useGoogleOneTap = (props: Props) => {
  const { clientId, onSuccess, onError, autoSelect = true, context = 'signin' } = props
  useEffect(() => {
    if (typeof window === 'undefined' || !window.google) {
      console.warn('Google Identity Services script is not loaded.')
      return
    }
    // Initialize Google One Tap
    const initializeGoogleOneTap = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
        auto_select: autoSelect,
        context,
      })

      // Display One Tap prompt
      // window.google.accounts.id.prompt()
    }
    const handleGoogleCallback = (response: any) => {
      if (response?.credential) {
        return onSuccess?.(response.credential)
      } else {
        return onError?.('Google One Tap authentication failed.')
      }
    }
    initializeGoogleOneTap()
  }, [clientId, onSuccess, onError, autoSelect, context])

  // Return a manual prompt function
  const prompt = useCallback(() => {
    const scriptExists = typeof window !== 'undefined' && window.google?.accounts?.id
    if (!scriptExists) return
    window.google.accounts.id.prompt()
  }, [])

  return { prompt }
}

export default useGoogleOneTap
