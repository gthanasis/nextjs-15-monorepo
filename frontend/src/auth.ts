import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyGoogleIdToken } from '@/lib/fed-cm-verify'
import GoogleProvider from 'next-auth/providers/google'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'FedCM',
      credentials: {
        idToken: { label: 'ID Token', type: 'text' },
      },
      async authorize(credentials) {
        const { idToken } = credentials
        if (typeof idToken !== 'string') return null
        const googleUser = await verifyGoogleIdToken(idToken)
        if (!googleUser) return null

        return {
          id: googleUser.sub,
          name: googleUser.name,
          email: googleUser.email,
          image: googleUser.picture,
        }
      },
    }),
  ],
})
