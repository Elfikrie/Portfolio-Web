# Admin login and password changes

Open `/login` to sign in or choose **Ubah password**. A password change requires the current username and password, a new password of at least 12 characters (at most 72 UTF-8 bytes), and confirmation. Successful changes store a bcrypt hash and invalidate previous sessions. Sign in again with the new password.

No database migration is required: this uses the existing `users.id`, `users.username`, and `users.password_hash` columns. The form is not a forgotten-password reset; account recovery requires the database owner.

## Deployment configuration

Configure `JWT_SECRET` in Netlify environment variables before building. Use a cryptographically random value with at least 32 bytes, never a value committed to the repository or prefixed with `NEXT_PUBLIC_`. Signing and verification use the same variable. Changing it invalidates existing sessions and requires a new deployment.

Enable Netlify's secret protection and restrict scopes to Builds and Functions where supported by the plan. Production deployments need a Production-context value. Give preview deployments a separate secret if admin access is needed there. Without a configured secret, login fails closed with a configuration message.

The existing `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` variables provide the database connection. Passwords and database values must never be printed in diagnostics or committed to source control.

## Verification

- `npm test`: route/session regressions using an in-memory database double, real bcrypt and JWT cryptography; no production database writes.
- `npm run build`: production build and TypeScript checking.
- Browser smoke check: sign in once, confirm `/admin` loads, reload, log out, and confirm `/admin` redirects to `/login`.

The application throttle is per server instance and best effort. Use a gateway or shared limiter if a global rate limit is required.
