import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyGoogleIdToken } from '@/lib/fed-cm-verify'

const handler = NextAuth({
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
      async authorize(credentials, req) {
        if (!credentials) return null
        const googleUser = await verifyGoogleIdToken(credentials.idToken)
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
  callbacks: {},
})

export { handler as GET, handler as POST }
