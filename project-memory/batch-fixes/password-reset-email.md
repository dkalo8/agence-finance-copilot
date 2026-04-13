# 9F Password Reset + Email Delivery

_Session: 2026-04-13 (continued)_

## What Was Built

### 9F Password Reset (complete)
- `POST /api/v1/auth/forgot-password` — signs JWT reset token (1h, separate secret), calls sendResetEmail, always returns 200 (no email-exists leak)
- `POST /api/v1/auth/reset-password` — verifies token type + expiry, bcrypt hashes new password, calls `queries.updatePasswordHash`
- `queries.updatePasswordHash(userId, passwordHash)` added to queries.js
- `client/src/pages/ForgotPassword.js` — email form, success state, "Back to sign in" link
- `client/src/pages/ResetPassword.js` — reads `?token=` via useSearchParams, password form, auto-redirects to /login on success
- `client/src/pages/Login.js` — "Forgot password?" link added
- `client/src/App.js` — `/forgot-password` and `/reset-password` routes added
- 9 new tests (400/401/200 cases, expired token, wrong type); 223/223 total passing

### Email Delivery Chain (final state)
Priority order in `server/routes/auth.js`:
1. **SendGrid** (`SENDGRID_API_KEY`) — HTTPS API, 100/day free, works on Render free tier
2. **Resend** (`RESEND_API_KEY`) — HTTPS API, 3K/month free with verified domain
3. **console.log** — dev fallback, logs reset URL to server logs

**Why SendGrid over SMTP**: Render free tier blocks all outbound SMTP (ports 25, 465, 587). Gmail SMTP via nodemailer always times out or gets ENETUNREACH. Both Resend and SendGrid use HTTPS (port 443) which is never blocked.

**Render env vars needed**: `SENDGRID_API_KEY=SG.xxx`, `SENDGRID_FROM=dkalo97@gmail.com`

### Debugging trail (what was tried)
1. `RESEND_API_KEY` with `onboarding@resend.dev` — only delivers to Resend account owner's email
2. Gmail SMTP via nodemailer — `ENETUNREACH 2607:...` (IPv6) on port 465
3. Switched to port 587 + `family: 4` — port 587 also blocked; `family:4` option silently ignored by nodemailer
4. Pre-resolved hostname with `dns.resolve4` to get IPv4 IP — port itself still blocked by Render firewall
5. Switched to SendGrid HTTPS API — works

### Long-term email strategy
- For production: verify a sending domain in Resend or SendGrid (any cheap domain ~$10/yr)
- Render paid plan ($7/mo Starter) removes SMTP port blocks if SMTP ever needed
- Firebase Auth is overkill just for email delivery — not recommended unless doing full auth rewrite

### Google button width warning fix
- `GoogleLogin width="100%"` (string) → `width={340}` (number) in Login.js + Register.js
- Fixes console warning: `[GSI_LOGGER]: Provided button width is invalid: NaN`
- Fix is in commit 633c5cd but Vercel deploy may need manual trigger to rebuild
