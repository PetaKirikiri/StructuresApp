# Te Reo

Vite + React + TypeScript + Tailwind CSS 4 + Supabase + Capacitor (same stack as Success Padel).

## Setup

```bash
cp .env.example .env.local
# fill VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local dev server |
| `npm run dev:phone` | Dev server on LAN (`0.0.0.0:5173`) |
| `npm run build` | Production build |
| `npm run cap:sync` | Build + sync to native projects |

## Native (optional)

After first `npm install`:

```bash
npx cap add ios
npx cap add android
```
