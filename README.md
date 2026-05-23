# ✈️ SourceAir — Flight Management Web App

A production-grade **Flight Management PWA** built with Next.js 14, Supabase, Zustand, and Tailwind CSS. Passengers can search flights, select seats on a live seat map, book, reschedule, and cancel — all with real-time updates.

---

## 🚀 Live Demo

> Deploy to Vercel: [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Database & Auth | Supabase (PostgreSQL + Auth + Realtime) |
| State Management | Zustand with `persist` middleware |
| Styling | Tailwind CSS |
| PWA | next-pwa |
| Language | TypeScript (strict, no `any`) |

---

## ⚙️ Local Setup

### 1. Clone & Install

```bash
git clone https://github.com/your-username/sourceair.git
cd sourceair
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to **SQL Editor** and run migrations **in order**:
   ```
   supabase/migrations/001_create_schema.sql
   supabase/migrations/002_rls_policies.sql
   supabase/migrations/003_functions_triggers.sql
   supabase/migrations/004_seed_data.sql
   ```
3. In **Authentication → Providers**, ensure Email provider is enabled
4. In **Authentication → URL Configuration**, set:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Fill in `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://lwnzmqogytbrjoolpkaq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3bnptcW9neXRicmpvb2xwa2FxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk1MDA4MzAsImV4cCI6MjA5NTA3NjgzMH0.gaEUkVw0xlDchT33r3-2bN2rp-eZH1YIE8nXUKcveMw
NEXT_PUBLIC_SITE_URL=https://source-air-flight.vercel.app
```

Find these values at: **Supabase Dashboard → Project Settings → API**

### 4. Create Test User

In Supabase Dashboard → **Authentication → Users → Add User**:
- Email: `test@flightapp.dev`
- Password: `Test@12345`

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🧪 Test Account

| Field | Value |
|---|---|
| Email | `test@flightapp.dev` |
| Password | `Test@12345` |

---

## 🏗 Project Structure

```
src/
├── app/                         # Next.js App Router pages
│   ├── page.tsx                 # Home / Search
│   ├── flights/                 # Flight results
│   ├── seat-selection/[id]/     # Interactive seat map
│   ├── booking/passenger/       # Passenger details form
│   ├── confirmation/[id]/       # Booking confirmation
│   ├── my-bookings/             # Booking management
│   ├── auth/                    # Login / Signup / Callback
│   └── offline/                 # PWA offline fallback
├── components/
│   ├── ui/                      # Button, Navbar, Toast, ConfirmDialog, PWABanner
│   ├── flight/                  # FlightSearchForm, FlightCard
│   ├── seat/                    # SeatMap (with Realtime)
│   └── booking/                 # BookingCard, StatusBadge
├── lib/
│   ├── supabase/                # client.ts, server.ts, middleware.ts
│   └── utils.ts                 # formatters, helpers
├── store/
│   ├── flightStore.ts           # Booking flow state (persisted)
│   └── userStore.ts             # Auth session + cached bookings
└── types/
    └── index.ts                 # All TypeScript interfaces
```

---

## 🗃 Database Schema

```
flights      — id, flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price
seats        — id, flight_id, seat_number, class, is_available, extra_fee
bookings     — id, user_id, flight_id, seat_id, status, booked_at, total_price, pnr_code
passengers   — id, booking_id, full_name, passport_no, nationality, dob
reschedules  — id, booking_id, old_flight_id, new_flight_id, requested_at, fee_charged
```

All tables have **Row Level Security (RLS)** — users can only access their own data.

---

## 🧠 Zustand Store Architecture

### `useFlightStore` — Booking Flow
Persisted to `localStorage` via `persist` middleware.

```ts
{
  searchQuery,        // Active search parameters
  selectedFlight,     // Flight chosen by user
  selectedSeat,       // Seat chosen on map
  optimisticSeatId,   // Seat marked selected before DB confirms
  currentStep,        // 'search' | 'results' | 'seat' | 'passenger' | 'confirm'
  passengerData,      // Passenger form fields
}
```

**`partialize` config** — excludes `passport_no` from `localStorage` persistence. Sensitive PII is kept in memory only and cleared on unmount.

### `useUserStore` — Auth & Cache
```ts
{
  user,            // Supabase User object (in-memory only)
  session,         // Only access_token persisted (not full session)
  cachedBookings,  // Cached for offline access in My Bookings
}
```

### Reset
`resetBookingFlow()` is called on booking cancellation and logout, clearing all in-progress booking state.

---

## 🔒 Security Features

- **Row Level Security** on all 5 tables — policies enforce user isolation at DB level
- **`reserve_seat` RPC** uses `pg_advisory_xact_lock` to prevent race conditions / double-booking
- **`cancel_booking` RPC** handles cancellation + seat release atomically in a single transaction
- **DB trigger** `enforce_cancellation_window` blocks cancellations within 2 hours of departure at the database level (belt-and-suspenders alongside the RPC check)
- **Optimistic seat selection** — UI marks seat instantly; Realtime reverts if another user books it concurrently
- **`passport_no` excluded** from `localStorage` via Zustand `partialize`

---

## 📱 PWA Features

- `manifest.json` with 192×192 and 512×512 icons, `display: standalone`
- **StaleWhileRevalidate** for Supabase REST API calls (flight search)
- **CacheFirst** for static assets and images
- **Offline fallback page** at `/offline`
- **My Bookings** loads from cached Zustand store when offline
- **Install banner** shown to first-time mobile visitors

---

## 🛤 Routes

| Route | Description |
|---|---|
| `/` | Home + flight search |
| `/flights` | Search results |
| `/seat-selection/[flightId]` | Seat map (with Realtime) |
| `/booking/passenger` | Passenger details |
| `/confirmation/[bookingId]` | Booking confirmation + PNR |
| `/my-bookings` | All bookings, cancel/reschedule |
| `/auth/login` | Sign in |
| `/auth/signup` | Create account |
| `/auth/callback` | OAuth/magic-link callback |
| `/offline` | PWA offline fallback |

---

## 🚢 Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# NEXT_PUBLIC_SITE_URL  ← set to your production URL
```

Update Supabase Auth redirect URLs to include your Vercel production URL.

---

## ⚖️ Architecture Decisions & Trade-offs

### What I'd improve with more time

1. **Multi-passenger booking** — current flow handles 1 passenger; would extend `passengers` table and loop insertions
2. **Payment integration** — Stripe checkout before `reserve_seat` RPC; currently price is computed and stored but no real payment
3. **Flight search date range** — currently exact-date match; would add ±1 day flexible search
4. **Email notifications** — Supabase Edge Functions to send booking confirmation / reschedule emails via Resend
5. **Admin panel** — flight CRUD, booking overview, manifest
6. **Seat map image assets** — replace CSS grid with actual aircraft SVG diagrams per aircraft type
7. **i18n** — currently English only

### Key design decisions

- **Server Components for data fetching** — all initial data loads happen in RSC (`createClient` from `server.ts`), no API routes needed
- **RPC functions for mutations** — all writes go through Supabase RPCs with advisory locks, never raw client-side inserts for bookings
- **Optimistic UI** — seat selection is instant in the store; Realtime subscription reverts it if the DB write fails or another user beats the race
- **Zustand partialize** — deliberately strips `passport_no` from persistence; it lives only in memory during the session

---

## 📝 Submission Checklist

- [x] Public GitHub repository with descriptive commit history
- [x] `.env.example` with all variables
- [x] Supabase migration SQL files in `/supabase/migrations`
- [x] Seed script with 8 flights across 4 routes
- [x] README with setup, architecture, Zustand explanation
- [x] Vercel deployment config (`vercel.json`)
- [x] PWA manifest + icons
- [x] Offline fallback page

---

*Built for the Source Asia Frontend Internship Assignment.*
