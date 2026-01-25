# ABA Therapy Tracker

A real-time data collection SaaS MVP for psychologists practicing Applied Behavior Analysis (ABA) therapy. This application provides a distraction-free, one-tap interface for recording behavioral data during therapy sessions.

## Purpose

The core problem this application solves is **real-time data collection during ABA therapy sessions**. Traditional data collection methods can be distracting and time-consuming, pulling the therapist's attention away from the patient. This MVP provides an intuitive, mobile-optimized interface that allows therapists to:

- Record **Frequency** (count) and **Duration** (timer) of behaviors simultaneously
- Track multiple behaviors in real-time without distraction
- View live session summaries and data visualizations
- Maintain patient records and behavior configurations

## Key Features

### One-Tap Data Collection
- **Single tap** on a behavior button simultaneously:
  - Increments the frequency count
  - Toggles the duration timer (start/stop)
- Large, touch-friendly buttons optimized for tablet/mobile use
- Visual feedback with pulse animations for active timers
- Optimistic UI updates for instant responsiveness

### Real-Time Session Management
- Start and manage therapy sessions per patient
- Live session timer and summary statistics
- Real-time data visualization with charts
- End session with automatic data persistence

### Patient & Behavior Management
- Create and manage patient profiles
- Configure behaviors per patient with:
  - Custom behavior names
  - Frequency tracking (count)
  - Duration tracking (timer)
  - Both simultaneously
- View patient history and session summaries

### Data Visualization
- **Frequency Chart**: Bar chart showing count per behavior
- **Duration Chart**: Bar chart showing total duration per behavior
- **Event Timeline**: Line chart showing behavior events over time
- Auto-refreshing charts for live session monitoring

## Tech Stack

### Core Framework
- **Next.js 15** (App Router, Server Actions)
- **TypeScript** (Strict mode)
- **React 19**

### State Management
- **Zustand** - Global timer state management for active behavior timers

### Database & ORM
- **Drizzle ORM** - Type-safe database queries
- **Supabase PostgreSQL** - Database backend
- **Postgres.js** - Database client

### UI & Styling
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Component library built on Radix UI
- **Lucide React** - Icon library

### Data Visualization
- **Recharts** - Chart library for session analytics

### Package Manager
- **pnpm** - Fast, disk space efficient package manager

## Project Structure

```
psi-aba/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Home/Dashboard
│   ├── patients/                 # Patient management
│   │   ├── page.tsx              # Patient list
│   │   └── [patientId]/          # Patient details
│   │       ├── page.tsx
│   │       └── behaviors/        # Behavior management
│   └── session/[sessionId]/      # Active session interface
├── components/
│   ├── behavior-button.tsx        # One-tap behavior recording
│   ├── session-charts.tsx        # Data visualization
│   └── ui/                       # shadcn/ui components
├── db/
│   ├── schema.ts                 # Drizzle schema definitions
│   └── index.ts                  # Database connection
├── lib/
│   ├── stores/
│   │   └── timer-store.ts        # Zustand timer store
│   └── utils.ts                  # Utility functions
└── app/src/actions/              # Server Actions
    ├── patient-actions.ts
    ├── behavior-actions.ts
    └── session-actions.ts
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm installed globally (`npm install -g pnpm`)
- Supabase account with PostgreSQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd psi-aba
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:password@host:port/database
   ```
   
   Get your connection string from your Supabase project settings.

4. **Run database migrations**
   ```bash
   pnpm drizzle-kit push
   ```
   
   Or generate migrations:
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Usage

### 1. Create a Patient
- Navigate to `/patients`
- Click "New Patient"
- Enter patient name and create

### 2. Configure Behaviors
- Go to patient details page
- Click "Manage Behaviors"
- Add behaviors with:
  - Behavior name (e.g., "Hand flapping", "Eye contact")
  - Select tracking types (Frequency, Duration, or both)

### 3. Start a Session
- From patient details, click "Start Session"
- You'll be redirected to the session interface

### 4. Record Behaviors
- **Single tap** on any behavior button:
  - Increments count (if frequency tracking enabled)
  - Starts/stops timer (if duration tracking enabled)
- Active timers show live elapsed time
- Visual feedback indicates active timers

### 5. View Session Data
- Real-time summary shows total events, counts, and durations
- Charts automatically update every 5 seconds
- End session when complete

## Database Schema

### Tables
- **patients** - Patient profiles
- **behaviors** - Behavior definitions per patient
- **sessions** - Therapy session records
- **session_logs** - Individual behavior recordings during sessions

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

### Database Commands

- `pnpm drizzle-kit push` - Push schema changes to database
- `pnpm drizzle-kit generate` - Generate migration files
- `pnpm drizzle-kit migrate` - Run migrations
- `pnpm drizzle-kit studio` - Open Drizzle Studio (database GUI)

## MVP Scope

This is an MVP focused on core functionality:

✅ Real-time data collection (Frequency + Duration)  
✅ One-tap interface for minimal distraction  
✅ Patient and behavior management  
✅ Session tracking and summaries  
✅ Basic data visualization  

**Not included in MVP:**
- User authentication (single-user MVP)
- Advanced reporting/export
- Multi-therapist support
- Offline mode
- WebSocket real-time updates (uses polling)

## Future Enhancements

- User authentication and multi-user support
- Advanced analytics and reporting
- Data export (CSV, PDF)
- Offline mode with sync
- Mobile app (React Native)
- Customizable behavior categories
- Session templates
- Notes and annotations per session

## License

Private project - All rights reserved

## Support

For issues or questions, please contact the development team.
