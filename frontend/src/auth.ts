import NextAuth, { DefaultSession } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { verifyGoogleIdToken } from '@/lib/fed-cm-verify'
import GoogleProvider from 'next-auth/providers/google'
import { client, IUser } from 'api-client'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: Partial<IUser> & DefaultSession['user'] & { accessToken: string }
  }
}

declare module '@auth/core/jwt' {
  interface JWT {
    dbUser: Partial<IUser>
    accessToken: string
  }
}

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
  callbacks: {
    /**
     * signIn
     *
     * - Triggered every time a user signs in (Credentials, OAuth, etc.).
     * - Return `true` to allow the sign-in, or `false` (or throw an error) to deny.
     * - Useful for checks like email domain restrictions, analytics/logging, etc.
     */
    async signIn({ user, account, profile, email, credentials }) {
      // // Debug/logging example:
      // console.log('signIn callback triggered:', {
      //   user,
      //   account,
      //   profile,
      //   email,
      //   credentials,
      // })

      // For example, if you want to only allow verified emails for Google:
      // if (account.provider === "google" && !profile.email_verified) {
      //   return false;
      // }

      return true // Allow sign in by default
    },

    /**
     * jwt
     *
     * - Called whenever a new JWT is created (on initial sign-in)
     *   and subsequently whenever a session is checked/extended (if using JWT sessions).
     * - `user` and `account` are only available on the first call (sign-in).
     * - Use this to store custom data in the token (e.g. user ID, roles, etc.).
     */
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user && account && user.id && user.email) {
        try {
          const response = await client.users.createFromGoogle({
            id: user.id,
            name: user.name || '',
            profileImage: user.image || '',
            email: user.email,
          })
          return {
            ...token,
            accessToken: response.token,
            dbUser: response.user,
          }
        } catch (error) {
          console.error('Failed to create user from Google:', error)
          throw error
        }
      }

      return token
    },

    /**
     * session
     *
     * - Called whenever the session is checked (client or server).
     * - Receives the decoded JWT (via `token`).
     * - Useful for attaching additional data to the `session.user` object
     *   that is accessible in `useSession()` or `getSession()`.
     */
    async session({ session, token, user }) {
      session.user = {
        ...session.user,
        ...token.dbUser,
        accessToken: token.accessToken,
        role: token.dbUser.role,
      }

      return session
    },

    /**
     * redirect
     *
     * - Called before performing a redirect (e.g., after sign-in, sign-out, or certain errors).
     * - You can return a custom URL or simply return `baseUrl` to keep defaults.
     * - Commonly used to preserve or restore a user's intended path.
     */
    async redirect({ url, baseUrl }) {
      // Example: if url starts with '/', you can merge it with baseUrl:
      if (url.startsWith('/')) return `${baseUrl}${url}`
      // Otherwise, default to baseUrl:
      return baseUrl
    },
  },
})
