# Deployment

## Backend

Use `server` as the service root directory.

Install command:

```bash
npm install
```

Start command:

```bash
npm start
```

Environment variables are listed in `server/.env.example`.

Set `CLIENT_URL` to the deployed frontend URL, for example:

```bash
CLIENT_URL=https://your-frontend.example.com
```

If you want to allow several frontend domains, use `CLIENT_URLS`:

```bash
CLIENT_URLS=https://your-frontend.example.com,https://your-preview.vercel.app
```

For Vercel preview deployments you can also enable:

```bash
ALLOW_VERCEL_PREVIEW_ORIGINS=true
```

Use a hosted MongoDB connection string for `MONGO_URI`.

## Frontend

Use `client` as the static site root directory.

Install command:

```bash
npm install
```

Build command:

```bash
npm run build
```

Publish/output directory:

```bash
dist
```

Environment variables are listed in `client/.env.example`.

Set these to the deployed backend URL:

```bash
VITE_API_URL=https://your-backend.example.com/api
VITE_SOCKET_URL=https://your-backend.example.com
VITE_ENABLE_REALTIME=false
```

Realtime Socket.IO is optional. Keep `VITE_ENABLE_REALTIME=false` on Render/Vercel if Socket.IO polling causes `502` or `400` noise in the browser console.

## Important

The old values from `server/.env` were committed before this cleanup. Treat those secrets as compromised and rotate them before using the production deployment. Email verification was removed, so email/Resend/Nodemailer credentials are no longer needed.
