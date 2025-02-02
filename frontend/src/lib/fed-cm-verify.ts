import { jwtVerify, importJWK } from 'jose'

// Google's public JWKS endpoint
const GOOGLE_JWKS_URI = 'https://www.googleapis.com/oauth2/v3/certs'

export async function verifyGoogleIdToken(idToken: string) {
  try {
    // Fetch Google's public keys
    const response = await fetch(GOOGLE_JWKS_URI)
    const jwks = await response.json()

    // Decode the header to extract the key ID (kid)
    const [header] = idToken.split('.')
    const decodedHeader = JSON.parse(Buffer.from(header, 'base64').toString('utf-8'))

    if (!decodedHeader.kid) {
      throw new Error("Invalid token: 'kid' not found in header.")
    }

    const { kid } = decodedHeader

    // Find the matching key in Google's JWKS
    const key = jwks.keys.find((key: any) => key.kid === kid)
    if (!key) {
      throw new Error('Invalid token: matching key not found.')
    }

    // Convert the JWK key to a usable format
    const publicKey = await importJWK(key, 'RS256')

    // Verify the token
    const { payload } = await jwtVerify(idToken, publicKey, {
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    // Return the payload if verification succeeds
    return payload as {
      sub: string
      email: string
      email_verified: boolean
      name: string
      picture: string
    }
  } catch (error) {
    console.error('Google ID token verification failed:', error)
    return null
  }
}
