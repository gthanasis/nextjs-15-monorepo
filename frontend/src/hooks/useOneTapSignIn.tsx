import { useCallback, useEffect, useRef } from 'react'

// Extend window in TS to include google.accounts.id with a prompt callback signature.
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
          prompt: (
            callback?: (notification: {
              isNotDisplayed: () => boolean
              isSkippedMoment: () => boolean
              isDismissedMoment: () => boolean
            }) => void
          ) => void
          renderButton: (element: HTMLElement, options: { theme: string; size?: string; width?: number }) => void
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

  // Ref to track if the prompt is currently active.
  const isPrompting = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined' || !window.google) {
      console.warn('Google Identity Services script is not loaded.')
      return
    }

    // Define the callback before using it.
    const handleGoogleCallback = (response: any) => {
      if (response?.credential) {
        onSuccess?.(response.credential)
      } else {
        onError?.('Google One Tap authentication failed.')
      }
    }

    const initializeGoogleOneTap = () => {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCallback,
        auto_select: autoSelect,
        context,
      })
      // We leave out auto prompting here to avoid potential conflicts.
      // window.google.accounts.id.prompt()
    }

    initializeGoogleOneTap()
  }, [clientId, onSuccess, onError, autoSelect, context])

  // Create a prompt function that ensures only one prompt is outstanding.
  const prompt = useCallback(() => {
    if (typeof window === 'undefined' || !window.google?.accounts?.id) return
    if (isPrompting.current) return // Exit if a prompt is already in progress.

    isPrompting.current = true
    window.google.accounts.id.prompt((notification) => {
      // When the prompt is not displayed or has been skipped/dismissed,
      // reset our flag so that the prompt can be triggered again.
      if (notification.isNotDisplayed() || notification.isSkippedMoment() || notification.isDismissedMoment()) {
        isPrompting.current = false
      }
    })
  }, [])

  // Create a function that renders the Google button into a given element.
  const renderGoogleButton = useCallback(
    (element: HTMLElement, options: { theme: string; size?: string; width?: number }) => {
      if (typeof window === 'undefined' || !window.google?.accounts?.id) return
      window.google.accounts.id.renderButton(element, options)
    },
    []
  )

  return { prompt, renderGoogleButton }
}

export default useGoogleOneTap
