import { OAuth2Client } from 'google-auth-library'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function verifyGoogleIdToken(idToken: string) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    const payload = ticket.getPayload()
    // payload is an object containing { sub, email, email_verified, name, picture, ... }
    if (!payload) return null
    return payload
  } catch (error) {
    console.error('FedCM verify error:', error)
    return null
  }
}
