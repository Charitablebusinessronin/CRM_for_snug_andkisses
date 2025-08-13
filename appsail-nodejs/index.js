import Express from 'express'
import cookie from 'cookie'
import crypto from 'crypto'
import * as jose from 'jose'

const app = Express()
const port = process.env.X_ZOHO_CATALYST_LISTEN_PORT || 9000

// Util: region-aware accounts base
function getAccountsBase() {
  return process.env.ZOHO_ACCOUNTS_BASE || 'https://accounts.zoho.com'
}

// Util: required envs guard
function requireEnv(name) {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

// Util: create state/nonce
function randomUrlSafe(len = 32) {
  return crypto.randomBytes(len).toString('base64url')
}

// Util: sign session cookie JWT
async function signSession(payload) {
  const secret = new TextEncoder().encode(requireEnv('APPSAIL_SESSION_SECRET'))
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secret)
}

app.get('/', (_req, res) => {
  res.send('AppSail auth service online')
})

// Step 1: redirect to Zoho OAuth
app.get('/auth/zoho/login', (req, res) => {
  const clientId = requireEnv('ZOHO_CLIENT_ID')
  const redirectUri = requireEnv('ZOHO_REDIRECT_URI')
  const scopes = process.env.APP_SSO_SCOPES || 'AaaServer.profile.READ'
  const state = randomUrlSafe(24)
  const nonce = randomUrlSafe(24)

  // set short-lived state cookie for CSRF protection
  res.setHeader('Set-Cookie', [
    cookie.serialize('sso_state', state, { httpOnly: true, sameSite: 'lax', secure: true, maxAge: 600, path: '/' }),
    cookie.serialize('sso_nonce', nonce, { httpOnly: true, sameSite: 'lax', secure: true, maxAge: 600, path: '/' })
  ])

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: scopes,
    access_type: 'offline',
    state,
    prompt: 'consent'
  })

  const url = `${getAccountsBase()}/oauth/v2/auth?${params.toString()}`
  res.redirect(url)
})

// Step 2: handle Zoho callback, exchange code for tokens, create session
app.get('/auth/zoho/callback', async (req, res) => {
  try {
    const { code, state } = req.query
    const cookies = cookie.parse(req.headers.cookie || '')
    if (!code || !state || state !== cookies.sso_state) {
      return res.status(400).send('Invalid OAuth state')
    }

    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      code: String(code),
      client_id: requireEnv('ZOHO_CLIENT_ID'),
      client_secret: requireEnv('ZOHO_CLIENT_SECRET'),
      redirect_uri: requireEnv('ZOHO_REDIRECT_URI')
    })

    const tokenRes = await fetch(`${getAccountsBase()}/oauth/v2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body
    })
    if (!tokenRes.ok) {
      const t = await tokenRes.text()
      return res.status(401).send(`Token exchange failed: ${t}`)
    }
    const tokens = await tokenRes.json()
    const accessToken = tokens.access_token
    const refreshToken = tokens.refresh_token

    // Fetch user info (Zoho accounts user info)
    const infoRes = await fetch(`${getAccountsBase()}/oauth/user/info`, {
      headers: { Authorization: `Zoho-oauthtoken ${accessToken}` }
    })
    if (!infoRes.ok) {
      const t = await infoRes.text()
      return res.status(401).send(`User info failed: ${t}`)
    }
    const info = await infoRes.json()

    const email = info.Email || info.email || 'unknown@unknown'
    const userId = info.ZUID || info.id || `zoho-${crypto.randomUUID()}`

    // Map role (basic default to CLIENT; extend with directory group membership later)
    const role = 'CLIENT'

    // TODO: persist refreshToken in Catalyst Data Store (omitted for brevity)
    // NOTE: never log tokens

    // Issue short-lived session cookie for the Next.js app
    const jwt = await signSession({ userId, email, role })
    const cookieStr = cookie.serialize('sk.session', jwt, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 15
    })
    // clear state cookies
    const clearState = cookie.serialize('sso_state', '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 })
    const clearNonce = cookie.serialize('sso_nonce', '', { httpOnly: true, sameSite: 'lax', secure: true, path: '/', maxAge: 0 })
    res.setHeader('Set-Cookie', [cookieStr, clearState, clearNonce])

    const frontendUrl = requireEnv('FRONTEND_URL')
    res.redirect(`${frontendUrl}/client/dashboard`)
  } catch (err) {
    console.error('OAuth callback error:', err)
    res.status(500).send('Authentication error')
  }
})

app.listen(port, () => {
  console.log(`AppSail listening on port ${port}`)
  console.log(`http://localhost:${port}/`)
})
