# react-info-agg

A React 19 app scaffolded with [create-vite-redux](https://www.npmjs.com/package/create-vite-redux).

## Stack

| Tool                        | Role                  |
| --------------------------- | --------------------- |
| React 19 + Vite 6           | UI & bundler          |
| TypeScript 5                | Static types          |
| Redux Toolkit 2 + RTK Query | State & data fetching |
| React Router v7             | Routing               |
| Tailwind CSS v4 + shadcn/ui | Styling & components  |
| Zod + React Hook Form       | Validation & forms    |

## Getting started

```bash
npm install
npm run dev
```

## Project structure

```
src/
├── components/
│   ├── ui/           ← shadcn/ui components (button, card, form, dialog, sonner…)
│   └── layout/       ← Header, Footer
├── features/
│   ├── counter/      ← Redux slice demo — start here
│   └── auth/         ← Auth feature (if included at scaffold time)
├── hooks/
│   └── redux.ts      ← useAppDispatch, useAppSelector
├── router/
│   └── index.tsx     ← Add new routes here
├── services/
│   └── api.ts        ← RTK Query base API — inject endpoints into this
├── store/
│   └── index.ts      ← Redux store
├── lib/
│   └── utils.ts      ← cn() helper
├── App.tsx           ← Root layout (Header + Footer + <Outlet />)
├── main.tsx          ← Entry point
└── index.css         ← Tailwind v4 + OKLCH design tokens
```

## Environment variables

```bash
cp .env.example .env
```

| Variable       | Description                                |
| -------------- | ------------------------------------------ |
| `VITE_API_URL` | Base URL for RTK Query (`/api` by default) |

## Adding a new feature

1. Create `src/features/my-feature/mySlice.ts` — define your slice
2. Register the reducer in `src/store/index.ts`
3. Create `src/features/my-feature/myApi.ts` — inject RTK Query endpoints into `api`
4. Add a route in `src/router/index.tsx`

## Adding shadcn components

Although components are pre-baked, you can add more via the shadcn CLI:

```bash
npx shadcn@latest add <component>
```

## Scripts

| Script            | Description              |
| ----------------- | ------------------------ |
| `npm run dev`     | Start dev server         |
| `npm run build`   | Production build         |
| `npm run lint`    | Run ESLint               |
| `npm run format`  | Run Prettier             |
| `npm run preview` | Preview production build |
