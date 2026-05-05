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
```

## Important

The old values from `server/.env` were committed before this cleanup. Treat those secrets as compromised and rotate them before using the production deployment.
