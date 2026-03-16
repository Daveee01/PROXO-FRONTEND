This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Team Setup (Important)

Use **npm only** for this repository.

1. Install Node.js 20 LTS.
2. Clone the repository.
3. Run a clean install:

```bash
npm ci
```

4. Start dev server:

```bash
npm run dev
```

If you still get runtime errors after pulling new changes, remove cache and reinstall:

```bash
rm -rf node_modules .next
npm ci
npm run dev
```

On Windows PowerShell:

```powershell
Remove-Item -Recurse -Force node_modules,.next
npm ci
npm run dev
```

## Connect To PROXO Backend (Separate Deploy)

This frontend now calls a Next.js server route at /api/proxo/recommend.
That route forwards requests to your Go backend and attaches X-API-Key,
matching backend middleware behavior in internal/middleware/auth.go.

1. Create frontend env file:

```bash
cp .env.example .env.local
```

Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

2. Set frontend server env vars in .env.local:

```env
PROXO_BACKEND_URL=http://localhost:8080
PROXO_API_KEY=
```

3. If backend PROXO_API_KEY is set, use the same value in frontend PROXO_API_KEY.

4. Run both apps on different ports:

```bash
# backend (port 8080)
cd ../proxo-backend
go run main.go

# frontend (port 3000)
cd ../PROXO-FRONTEND
npm run dev
```

5. Ensure backend CORS allows your frontend origin, for example:

```env
ALLOWED_ORIGINS=http://localhost:3000
```

For production, set:
- PROXO_BACKEND_URL=https://your-backend-domain
- PROXO_API_KEY=<same backend key>
- backend FRONTEND_URL and ALLOWED_ORIGINS to your deployed frontend domain

## Getting Started

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
