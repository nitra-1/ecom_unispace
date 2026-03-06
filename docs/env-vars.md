# Environment Variables

> This document lists every environment variable consumed by each application in the Aparna platform.
> For system architecture context see [architecture.md](architecture.md).

---

## Customer storefront (`aparna-frontend-stagging`)

Variables are loaded by Next.js from a `.env.local` file (not committed to source control).

### Required

| Variable | Example value | Description |
|---|---|---|
| `NEXTAUTH_SECRET` | `a-long-random-string` | Secret used by NextAuth.js to sign session JWTs. Must be at least 32 characters. |
| `GOOGLE_CLIENT_ID` | `1234567890-abc.apps.googleusercontent.com` | Google OAuth 2.0 client ID for social sign-in. |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-...` | Google OAuth 2.0 client secret for social sign-in. |

### Optional / currently hardcoded

The following values are currently hardcoded in `src/lib/GetBaseUrl.jsx` and `src/utils/helper/AllStaticVariables/configVariables.js`. They should be moved to environment variables before deploying to a new environment.

| Hardcoded value | Where it appears | Recommended variable name |
|---|---|---|
| `https://api.aparna.hashtechy.space/api/` | `src/lib/GetBaseUrl.jsx` | `NEXT_PUBLIC_API_BASE_URL` |
| `https://aparna.hashtechy.space/` | `src/lib/GetBaseUrl.jsx`, `configVariables.js` | `NEXT_PUBLIC_SITE_URL` |

### Usage

Next.js exposes these variables to the server runtime via `next.config.mjs`:

```js
env: {
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
}
```

> **Note:** Do **not** prefix secrets with `NEXT_PUBLIC_`. Only values that are safe to expose to the browser should use that prefix.

---

## Admin panel (`aparna-admin-stagging`)

Variables are loaded by Webpack at build time via the [dotenv-webpack](https://github.com/mrsteele/dotenv-webpack) plugin from a `.env` file in the project root.

### Required

| Variable | Example value | Description |
|---|---|---|
| `REACT_APP_API_URL` | `https://api.aparna.hashtechy.space/api/` | Base URL for all REST API calls. Must end with a trailing slash. |

### Optional (runtime constants currently in source)

The following values are set as constants in `src/lib/AllStaticVariables.jsx`. They control feature flags and deployment-specific behaviour and would typically be moved to environment variables for a multi-environment setup.

| Constant | Current value | Description |
|---|---|---|
| `signalRURL` | `https://api.aparna.hashtechy.space/Hubs/uploadProgressHub` | SignalR hub for file upload progress |
| `notificationURL` | `https://api.aparna.hashtechy.space/Hubs/notificationsLiveHub` | SignalR hub for live admin notifications |
| `isMarketPlace` | `true` | Enables marketplace (multi-seller) features |
| `isAllowPriceVariant` | `true` | Enables per-variant pricing |
| `isAllowWarehouseManagement` | `true` | Enables warehouse/inventory management |
| `isSellerWithGST` | `true` | Requires GST details for sellers |
| `isMasterAdmin` | array of email addresses | Email allowlist for super-admin features |

### Usage

The Webpack build reads `.env` from the project root via:

```js
new DotenvWebpackPlugin({ systemvars: true })
```

The `systemvars: true` option means any variable already present in the process environment takes precedence over the `.env` file, which is suitable for CI/CD pipelines.

---

## Example `.env` / `.env.local` files

### `aparna-frontend-stagging/.env.local`

```dotenv
# NextAuth
NEXTAUTH_SECRET=replace-with-a-32-plus-character-secret

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### `aparna-admin-stagging/.env`

```dotenv
# API base URL (must end with /)
REACT_APP_API_URL=https://api.aparna.hashtechy.space/api/
```

---

## Security notes

- Never commit `.env`, `.env.local`, or any file containing real secrets to source control. Both files are listed in the root `.gitignore`.
- Rotate `NEXTAUTH_SECRET` if it is ever exposed; all existing NextAuth sessions will be invalidated.
- `GOOGLE_CLIENT_SECRET` and OAuth credentials should be restricted to the specific domains / redirect URIs configured in the Google Cloud Console.
