node -p "require('jsonwebtoken').sign(
  {
    role: 'next',
    id: 'internal',
    exp: Math.floor(Date.now() / 1000) + (100 * 365 * 24 * 60 * 60), // 100 years
    impersonate: true,
    impersonatorID: null,
    iss: 'internal',
    iat: Math.floor(Date.now() / 1000)
  },
  'super-secert-token'
)"
