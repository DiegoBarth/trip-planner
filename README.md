# Trip Planner — Japan & South Korea

Web app to plan trips to **Japan** and **South Korea**: itinerary, budget, expenses, attractions, reservations, checklist, and a **day-by-day timeline** with routes and weather. Built to be used on the road, with **PWA** support and **offline-friendly** caching.

## Features

### Home & navigation
- **Swipe** between main sections (mobile-friendly flow).
- **Country filter** (Japan / South Korea / all) on the home header.
- **Today’s summary**: next-day attractions, checklist and reservation reminders, budget snapshot.
- **Bottom navigation** + **dark / light** theme.

### Timeline (itinerary)
- **Per-day view** of attractions in order, with accommodation context when relevant.
- **Leg distances and travel times** between stops via **OSRM** (fetched online, then **cached** in storage for reuse without hitting the API every time).
- **Weather** for trip days when `VITE_OPENWEATHER_API_KEY` is set.
- **Export timeline to PDF** (single day or full trip).

### Map
- **Leaflet** map with attraction markers and **clustering** for dense areas.
- Filtered by the same country scope as the rest of the app.

### Attractions
- Register attractions with type, location, day, period, prices, **JPY / KRW / BRL**, reservation status, links, and optional image.
- **Filters**: country, city, day, type, visited.
- **Drag-and-drop** order; **mark as visited**; **reorder whole days** (move day content).
- Optional link to a **reservation** record.

### Reservations
- Types: flights, hotels, documents, passes, activities, etc.
- **Booking status** (pending, confirmed, cancelled, completed) with **filter chips** on the list.
- Notes, dates, provider, confirmation code, **booking / document links** (with file upload flow where supported).
- **Notes icon** on cards to expand observations without opening the action sheet.

### Budget
- Multiple **budget origins** (e.g. personal, shared, food, attractions, transport).
- Create / edit / delete budget lines; summary views and charts.

### Expenses
- Log spending by category and origin; optional link to an **attraction**.
- **Currency conversion** using rates from the backend; filters by category, origin, and date.

### Checklist
- Items by **category** with icons; **packed** toggle.
- **Export checklist to PDF**.

### Dashboard
- Financial overview (spent vs budget, remaining balance).
- **Trip progress** (attractions visited vs total).

### Currency converter
- Quick **JPY / KRW / BRL** conversion page.

### Authentication & data
- **Google Sign-In** (OAuth); API calls use your backend after login.
- **React Query** with **persisted cache** (session storage for general queries, longer retention for **OSRM route** data) for a smoother experience when offline or on flaky networks.

### PWA
- **Installable** progressive web app (`vite-plugin-pwa`, Workbox).
- Static assets cached; app shell works **offline** after first load. Fresh data still requires network when cache is stale or missing.

## Tech stack

- **React 19** + **TypeScript**
- **Vite** (Rolldown build)
- **Tailwind CSS**
- **React Router** 7
- **TanStack Query** (persisted cache)
- **React Hook Form** + **Zod** (forms / validation)
- **@dnd-kit** (drag and drop)
- **Leaflet** + **React Leaflet** (map)
- **date-fns**
- **lucide-react**
- **jsPDF** (PDF exports)
- **vite-plugin-pwa**

## Project structure (overview)

```
src/
├── api/              # Backend clients (attractions, expenses, budget, …)
├── components/       # Feature UI (attractions, budget, checklist, timeline, …)
├── config/           # constants.ts (countries, categories, stale times, …)
├── contexts/         # Theme, toast, country filter, …
├── hooks/            # Data hooks, OSRM routes, scroll lock, …
├── pages/            # Route-level screens
├── schemas/          # Zod schemas
├── services/         # Timeline / weather / cache helpers
├── types/            # TypeScript models
└── utils/            # Formatters, PDF export, maps URLs, …
```

## Currency & rates

Exchange rates (**JPY** / **KRW** → **BRL**) are provided by your backend and cached in the app. Labels and categories are configured in `src/config/constants.ts`.

## Getting started

```bash
npm install
npm run dev          # dev server
npm run build        # production build → docs/ (GitHub Pages)
npm run preview      # preview production build
npm run test         # Vitest
npm run test:coverage
```

### Environment

Copy `.env.example` to `.env`:

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend base URL (e.g. Google Apps Script web app) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Web client ID |
| `VITE_OPENWEATHER_API_KEY` | Optional — enables forecast badges on the timeline |

## Deploy (GitHub Pages)

`vite.config.ts` uses `base: '/trip-planner/'` and `outDir: 'docs'`.

```bash
npm run build
git add docs
git commit -m "chore: deploy"
git push
```

Enable GitHub Pages from the **`/docs`** folder on the default branch.

> **Note:** On Windows, if `cp docs/index.html docs/404.html` fails in `npm run build`, copy the file manually or use a cross-platform script so SPA routes work on refresh.

## Possible next steps

- Broader **offline writes** (queue mutations when offline).
- **Push / local reminders** for pending reservations.
- **i18n** (PT / EN / …).

## License

MIT