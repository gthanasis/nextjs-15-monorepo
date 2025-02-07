'use client'
import { cn } from '@/lib/utils'
import useGoogleOneTap from '@/hooks/useOneTapSignIn'
import { useEffect, useRef } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginForm({ className, ...props }: React.ComponentPropsWithoutRef<'div'>) {
  const googleButtonRef = useRef<HTMLDivElement>(null)
  const { prompt, renderGoogleButton } = useGoogleOneTap({
    clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
    onSuccess: async (credential) => {
      await signIn('credentials', { idToken: credential, redirect: false })
    },
    onError: (error) => {
      console.log('OneTap error:', error)
    },
    autoSelect: false,
  })

  const googleLogin = () => {
    signIn('google', { redirect: false })
  }

  useEffect(() => {
    prompt()
    // Render the Google button if the container is available.
    if (googleButtonRef.current) {
      renderGoogleButton(googleButtonRef.current, { theme: 'outline', size: 'large' })
    }
  }, [prompt])

  return (
    <div className={cn('flex flex-col p-4 ', className)} {...props}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Login</h1>
        <p className="text-gray-600">Enter your email below to login to your account</p>
      </div>

      {/* Form */}
      <form className="space-y-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input disabled id="email" type="email" placeholder="m@example.com" required />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a href="#" className="ml-auto inline-block text-sm underline-offset-4 hover:underline">
              Forgot your password?
            </a>
          </div>
          <Input disabled id="password" type="password" required />
        </div>
        <div className="flex gap-4">
          <Button disabled type="submit" className="w-full">
            Login
          </Button>
          <div ref={googleButtonRef} id="google-signin-button" onClick={googleLogin}>
            <Button variant="outline" className="w-full">
              Login with Google
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
