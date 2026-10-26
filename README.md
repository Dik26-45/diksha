# SAFAR AI

> **“Your Route. Your People. Your Journey.”**

SAFAR AI is a community ride-sharing web application engineered with explainable AI heuristic route matching, verified Women-Only safe commutes, 24/7 112 SOS emergency dispatch, and interactive OpenStreetMap telemetries.

---

## 🌟 Key Features

1. **Explainable AI Matching Engine**:
   - Scores routes from 0–100% using 5 weighted criteria:
     - **30%** Pickup Proximity (Haversine geodesic distance)
     - **30%** Destination Proximity
     - **20%** Departure-Time Window Compatibility
     - **15%** Route Vector Bearing Alignment
     - **5%** Passenger Preferences (quiet ride, pets, smoking, music)
   - Excludes cancelled, completed, full, or gender-incompatible rides.
   - Provides clear, human-readable match explanations (strictly rule-based heuristics, not unverified ML black-box).

2. **Dedicated Women-Only Commutes**:
   - Separate ride category and filter.
   - Explicit verification checks (only verified female drivers can host; only female passengers can book).
   - Strict 403 Forbidden enforcement on unauthorized reservation attempts.
   - Verified driver badges and zero-tolerance safety policies.

3. **Trust & Safety Center**:
   - **One-tap 112 SOS Emergency Dispatch** transmitting live GPS coordinates.
   - Direct emergency hotline links: **112** (National Emergency), **1091** (Women Protection Helpline), **1122** (Medical Rescue).
   - Structured incident reporting (harassment, reckless driving, route deviation, vehicle mismatch).
   - Real-time trip sharing with tracking links.

4. **Booking & Simulated Payments**:
   - Seat count selection, real-time availability check, server-calculated pricing.
   - Overbooking and negative seat prevention.
   - Simulated payment modal (SAFAR Wallet, Demo Card, Instant Pay) with clear educational disclaimers.
   - Automated seat restoration upon booking cancellation.

5. **Role-Protected Admin Command Center**:
   - Superadmin metrics dashboard.
   - CNIC / National ID verification queue with approve/reject workflows.
   - Incident report management with audit notes and resolution statuses.
   - Real-time ride monitoring and emergency event logging.

---

## 🚀 Single Unified Localhost Link

The entire full-stack application (frontend SPA + backend API + interactive maps + live relative safe-tracking) runs seamlessly on a single unified URL:

> **🔗 http://localhost:5000**

### Direct Route Navigators on `http://localhost:5000`
- **Interactive Maharashtra Map Explorer**: `http://localhost:5000/rides`
- **Women-Only Live Relative Tracking Demo**: `http://localhost:5000/track/SFR-2026-8812`
- **Sample Commute Booking (Kothrud ➜ Hinjawadi)**: `http://localhost:5000/rides/ride-women-001`
- **My Bookings & Trip Telemetry**: `http://localhost:5000/my-bookings`
- **Safety Center & 112 SOS Dispatch**: `http://localhost:5000/safety`
- **Superadmin Command Center**: `http://localhost:5000/admin`
- **API Health Endpoint**: `http://localhost:5000/api/health`

---

## 🏗️ Architecture & Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router 7, Lucide Icons, Leaflet + CartoDB Voyager (English Map labels).
- **Backend**: Node.js, Express.js, TypeScript. Express serves the compiled React application statically from `client/dist` and handles `/api/*` endpoints under the single `http://localhost:5000` host.
- **ORM & Database**: Prisma ORM with PostgreSQL schema (11 relational models) and transparent fallback to an isolated Demo Mode Mock Store when PostgreSQL credentials are unavailable.
- **Auth & Security**: bcryptjs password hashing, JWT session authorization, server-side role checks (`PASSENGER`, `RIDE_PROVIDER`, `ADMIN`), sanitized user payloads.

---

## 🚀 Startup Instructions

### 1. Unified Single-Command Run
```bash
# Build frontend bundle
cd client && npm run build && cd ..

# Start unified server (serves frontend + backend on port 5000)
cd server && npm run dev
```
*Open `http://localhost:5000` in your browser.*

---

## 🧪 Verified Demo Accounts

For fast evaluation, the login page (`/login`) includes 1-click quick login presets:

| Role | Name | Email | Password | Location / Corridor |
|---|---|---|---|---|
| **Female Passenger** | Aisha Khan | `aisha.khan@safar.ai` | `Password123!` | Pune (Kothrud ➜ Hinjawadi IT Park) |
| **Female Driver (Host)** | Dr. Ananya Sharma | `ananya.sharma@safar.ai` | `Password123!` | Pune (Kia Seltos MH-12-AB-4021) |
| **Male Driver (Host)** | Rohan Mehta | `rohan.mehta@safar.ai` | `Password123!` | Pune (Wakad ➜ Magarpatta Cybercity) |
| **System Admin** | Operations Lead | `admin@safar.ai` | `Admin123!` | Maharashtra Incident Command |

---

## 🛡️ Test Suite
Run the 22 automated end-to-end API integration tests:
```bash
cd server
npx tsx src/test-api.ts
```
Results: `22 PASSED, 0 FAILED` covering authentication, duplicate email prevention, women-only restriction enforcement, seat decrement/restoration, AI matching 5-factor scoring, safety reporting, 112 SOS dispatch, and admin route protection.

