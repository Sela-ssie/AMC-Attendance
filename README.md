# AMC Attendance

Church member attendance tracker built with **Next.js**, **Supabase**, and **Recharts**.

---

## Setup

### 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account.
2. Create a new project (pick any region, save your database password).
3. Once the project is ready, go to **SQL Editor → New Query**, paste the contents of `supabase/schema.sql`, and click **Run**.

### 2. Get your Supabase credentials

In your Supabase dashboard go to **Project Settings → API**:

- Copy **Project URL**
- Copy **anon / public** key (for the app)
- Copy **service_role** key (for the one-time import script only — keep it secret)

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

For the import script only, also add:
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

> **Never commit `.env.local` to git.** It is already in `.gitignore`.

### 4. Create the admin user

1. In Supabase dashboard go to **Authentication → Users → Add user**.
2. Enter the email and password for your shared admin account.
3. That's the login your attendance taker will use.

### 5. Import existing members from Excel

```bash
node scripts/import-members.mjs "/Users/selassie/Downloads/SAMPLE CHURCH DATA.xlsx"
```

This reads the `Name` column and inserts all 140 members into the database.

### 6. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Features

| Page | Route | Description |
|---|---|---|
| Dashboard | `/` | Stats + recent Sundays table |
| Take Attendance | `/attendance` | Mark members present/absent |
| Members | `/members` | Full member list |
| Member Detail | `/members/[id]` | Attendance chart + edit form |
| Register Member | `/members/new` | Add a new member |

### Attendance entry — two modes

On the **Take Attendance** page, use the toggle in the top-right to switch between:

- **Buttons mode** — every member is a pill button. Green = present, gray = absent. Click to toggle.
- **List mode** — scrollable checklist with checkboxes and a "Present" badge.

Both modes share the same state; you can switch freely before saving.

---

## Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add your two `NEXT_PUBLIC_SUPABASE_*` environment variables in the Vercel dashboard under **Settings → Environment Variables**.

---

## Project structure

```
src/
  app/
    page.tsx                    # Dashboard
    login/
      page.tsx                  # Login page
      actions.ts                # Auth server actions
    attendance/
      page.tsx                  # Attendance server component
      AttendanceClient.tsx      # Interactive attendance UI
    members/
      page.tsx                  # Members list
      new/
        page.tsx                # Register member page
        RegisterForm.tsx        # Registration form
      [id]/
        page.tsx                # Member detail + chart
        AttendanceChart.tsx     # Recharts bar chart
        EditMemberForm.tsx      # Edit member form
  components/
    Nav.tsx                     # Top navigation bar
  lib/
    supabase/
      client.ts                 # Browser Supabase client
      server.ts                 # Server Supabase client
  middleware.ts                 # Auth protection for all routes
supabase/
  schema.sql                    # Database schema (run once in Supabase)
scripts/
  import-members.mjs            # One-time Excel import script
```
# AMC-Attendance
