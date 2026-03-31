# CampusCare — Frontend

CampusCare is a web platform designed to support university students with mental health resources, confidential counselling sessions, and community fundraising. This repository contains the React frontend application that interfaces with the CampusCare REST API.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Prerequisites](#prerequisites)
3. [Getting Started](#getting-started)
4. [Project Structure](#project-structure)
5. [Architecture Overview](#architecture-overview)
6. [Authentication](#authentication)
7. [API Integration](#api-integration)
8. [Routing](#routing)
9. [State Management](#state-management)
10. [Styling](#styling)
11. [Available Scripts](#available-scripts)
12. [Feature Reference by Role](#feature-reference-by-role)
13. [Adding New Pages](#adding-new-pages)
14. [Adding New API Calls](#adding-new-api-calls)
15. [Code Conventions](#code-conventions)
16. [Deployment](#deployment)
17. [Known Limitations](#known-limitations)

---

## Tech Stack

| Concern | Library / Tool |
|---|---|
| Framework | React 19 |
| Language | TypeScript 5.9 |
| Build tool | Vite 7 (SWC plugin) |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| Server state | TanStack Query v5 |
| Client state | Redux Toolkit v2 + react-redux v9 |
| Icons | lucide-react |
| Linting | ESLint 9 + typescript-eslint |

---

## Prerequisites

- **Node.js** v20 or later
- **npm** v10 or later (comes bundled with Node.js 20)
- Access to the CampusCare backend API (see [API Integration](#api-integration))

---

## Getting Started

**1. Clone the repository**

```bash
git clone <repository-url>
cd campuscare_frontend
```

**2. Install dependencies**

```bash
npm install
```

**3. Start the development server**

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

No `.env` file is required. The API base URL is defined directly in `src/api/client.ts`. If you need to point the frontend at a different backend instance (e.g., a local development server), update the `BASE_URL` constant in that file.

```ts
// src/api/client.ts
const BASE_URL = 'https://campuscare-5zm2.onrender.com';
```

---

## Project Structure

```
campuscare_frontend/
├── public/
│   └── logo.png               # Application logo (used in header and favicon)
├── src/
│   ├── api/                   # All backend API calls, organised by domain
│   │   ├── client.ts          # Base fetch wrapper (handles cookies, errors, CSV)
│   │   ├── auth.ts
│   │   ├── campaigns.ts
│   │   ├── contributions.ts
│   │   ├── bookings.ts
│   │   ├── counselors.ts
│   │   ├── chatbot.ts
│   │   └── admin.ts
│   ├── components/
│   │   ├── campaign/
│   │   │   └── CampaignCard.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── DashboardLayout.tsx   # Sidebar layout shared by all dashboards
│   │   │   └── ProtectedRoute.tsx
│   │   └── ui/                       # Primitive UI components
│   │       ├── Avatar.tsx
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Modal.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── Spinner.tsx
│   │       └── Textarea.tsx
│   ├── pages/
│   │   ├── LandingPage.tsx
│   │   ├── AllCampaignsPage.tsx
│   │   ├── CampaignDetailPage.tsx    # Includes the donation flow
│   │   ├── LoginPage.tsx
│   │   ├── StudentRegisterPage.tsx
│   │   ├── CounselorRegisterPage.tsx
│   │   ├── student/
│   │   │   ├── StudentDashboard.tsx  # Chatbot + quick stats
│   │   │   ├── MyCampaignsPage.tsx
│   │   │   ├── CreateCampaignPage.tsx
│   │   │   ├── EditCampaignPage.tsx
│   │   │   ├── MyBookingsPage.tsx
│   │   │   ├── BookCounselorPage.tsx
│   │   │   └── StudentProfilePage.tsx
│   │   ├── counselor/
│   │   │   ├── CounselorDashboard.tsx
│   │   │   └── CounselorProfilePage.tsx
│   │   └── admin/
│   │       ├── AdminDashboard.tsx
│   │       ├── AdminUsersPage.tsx
│   │       ├── AdminCampaignsPage.tsx
│   │       ├── AdminBookingsPage.tsx
│   │       └── AdminContributionsPage.tsx
│   ├── store/
│   │   ├── index.ts           # Store configuration
│   │   ├── authSlice.ts       # Auth state: user, isLoading, isInitialized
│   │   └── hooks.ts           # Typed useAppDispatch and useAppSelector
│   ├── types/
│   │   └── index.ts           # All shared TypeScript interfaces and types
│   ├── App.tsx                # Route tree, layout wrappers, session hydration
│   ├── main.tsx               # React entry point
│   └── index.css              # Tailwind import + @theme tokens + base styles
├── index.html                 # Entry HTML — Google Fonts loaded here
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Architecture Overview

### Request lifecycle

1. A page component calls `useQuery` or `useMutation` from TanStack Query, passing a function from the relevant `src/api/*.ts` module.
2. The API module calls the typed `api.get / api.post / ...` helpers from `src/api/client.ts`.
3. `client.ts` issues a `fetch` with `credentials: 'include'` so the browser automatically attaches the session cookie.
4. On a non-ok response the client throws an `Error` with the server's message, which TanStack Query surfaces as `mutation.error` or `query.error`.

### Session management

The backend uses **HTTP-only session cookies**. There are no tokens stored in `localStorage` or `sessionStorage`.

On application load, `SessionHydrator` (inside `App.tsx`) calls `GET /profile`. If the cookie is valid the response populates the Redux `auth` slice. If the server returns 401, the user is treated as a guest and `isInitialized` is set to `true` so the rest of the app can render.

```
App mount
  └── SessionHydrator.useEffect
        ├── GET /profile (success) --> dispatch(setUser(profile))
        └── GET /profile (401)    --> dispatch(setInitialized())
```

`ProtectedRoute` blocks rendering until `isInitialized` is `true`, preventing a flash of the login redirect during the hydration request.

---

## Authentication

- **Login:** `POST /login` — sets session cookie. Frontend then fetches `/profile` to get the full user object and dispatches `setUser`.
- **Logout:** `POST /logout` — clears the server-side session. Frontend dispatches `logout()` and navigates to `/`.
- **Role-based redirect after login:**

| Role | Redirect |
|---|---|
| `student` | `/student/dashboard` |
| `counselor` | `/counselor/dashboard` |
| `admin` | `/admin/dashboard` |

- **Admin credentials:** The admin account is seeded in the database. The admin logs in through the same `/login` page as all other users. Do not commit admin credentials to source control.

---

## API Integration

All API modules live in `src/api/` and are organised by domain. Each module exports a plain object of async functions that return typed promises.

**Example — adding a call to an existing module:**

```ts
// src/api/campaigns.ts
export const campaignsApi = {
  // existing calls ...

  getById: (id: string) => api.get<Campaign>(`/campaigns/${id}`),
};
```

**Example — creating a new module:**

```ts
// src/api/notifications.ts
import { api } from './client';
import type { Notification } from '../types';

export const notificationsApi = {
  list: () => api.get<Notification[]>('/notifications'),
  markRead: (id: string) => api.patch<{ message: string }>(`/notifications/${id}/read`),
};
```

Then add the corresponding type to `src/types/index.ts`.

---

## Routing

All routes are declared in `src/App.tsx`. The router uses nested routes and layout components:

| Layout wrapper | Path prefix | Role required |
|---|---|---|
| `PublicLayout` | `/`, `/campaigns` | None |
| `StudentLayout` | `/student/*` | `student` |
| `CounselorLayout` | `/counselor/*` | `counselor` |
| `AdminLayout` | `/admin/*` | `admin` |

`ProtectedRoute` accepts an optional `allowedRoles` array. If the authenticated user's role is not in that array, they are redirected to their own dashboard instead of receiving a 403.

**Adding a new protected page:**

1. Create the page component in the appropriate `src/pages/<role>/` directory.
2. Import it in `App.tsx`.
3. Add a `<Route>` inside the matching layout's `<Route>` element.
4. Add a nav entry to the relevant nav array (`studentNav`, `counselorNav`, or `adminNav`) in `App.tsx`.

---

## State Management

Redux is used exclusively for **authentication state**. It holds three fields:

```ts
interface AuthState {
  user: UserProfile | null;   // null when logged out
  isLoading: boolean;
  isInitialized: boolean;     // true once the /profile hydration call has settled
}
```

All server data (campaigns, bookings, contributions, etc.) is managed by **TanStack Query**. Do not put server data into Redux.

**Reading auth state in a component:**

```ts
import { useAppSelector } from '../../store/hooks';

const user = useAppSelector(s => s.auth.user);
```

**Dispatching an action:**

```ts
import { useAppDispatch } from '../../store/hooks';
import { setUser } from '../../store/authSlice';

const dispatch = useAppDispatch();
dispatch(setUser(profile));
```

---

## Styling

The project uses **Tailwind CSS v4**. There is no `tailwind.config.js`. Configuration is done entirely in `src/index.css` using the `@theme` block.

**Custom design tokens (defined in `src/index.css`):**

- `primary-50` through `primary-900` — the green colour scale used throughout the UI
- `font-display` — Playfair Display (applied to `h1`–`h4` and the `.font-display` utility class)
- `font-body` — Inter (default body font)

**Adding a new colour token:**

```css
/* src/index.css */
@theme {
  --color-accent-500: #your-hex-value;
}
```

This becomes available as `bg-accent-500`, `text-accent-500`, etc.

**Typography rule:** Use `font-display` (Playfair Display) for all headings and page titles. Use the default Inter for all body copy, labels, and UI text.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server with HMR |
| `npm run build` | Type-check and compile a production build into `dist/` |
| `npm run preview` | Serve the production build locally for review |
| `npm run lint` | Run ESLint across the entire codebase |

---

## Feature Reference by Role

### Guest (unauthenticated)

- Browse the landing page and view up to 6 featured campaigns
- Browse all approved campaigns at `/campaigns`
- View individual campaign detail pages
- Make a donation to any campaign (no account required)
- Register as a student or counsellor
- Sign in

### Student

- Create, edit, and delete fundraising campaigns (subject to admin approval)
- Toggle campaign and profile anonymity
- Book online or in-person counselling sessions
- View booking status (pending / accepted / declined)
- Interact with the AI mental health chatbot (with crisis detection)
- Manage profile fields: display name, bio, university, course, year, location, avatar

### Counsellor

- View all incoming session booking requests
- Accept or decline bookings
- For online sessions: coordinate Google Meet externally via the student's registered email
- Manage professional profile: name, specialisation, bio, phone

### Admin

- View platform-wide statistics (users, campaigns, bookings, total raised)
- Manage all user accounts — suspend or reactivate
- Review pending campaigns and approve or reject them
- View all bookings across the platform
- View all contributions and export a CSV report

---

## Adding New Pages

Below is the standard pattern for adding a new page. This example adds a `NotificationsPage` for students.

**1. Create the component**

```tsx
// src/pages/student/NotificationsPage.tsx
export default function NotificationsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-1">Notifications</h1>
      {/* content */}
    </div>
  );
}
```

**2. Register the route in `App.tsx`**

```tsx
import NotificationsPage from './pages/student/NotificationsPage';

// Inside the /student Route element:
<Route path="notifications" element={<NotificationsPage />} />
```

**3. Add to the sidebar**

```ts
// In App.tsx — studentNav array
{ to: '/student/notifications', label: 'Notifications', icon: <Bell size={16} /> },
```

---

## Adding New API Calls

**1. Add the TypeScript type to `src/types/index.ts`** (if the response shape is new).

**2. Add the function to the appropriate module in `src/api/`.**

**3. Use it in a component with TanStack Query:**

```tsx
// Query (read)
const { data, isLoading } = useQuery({
  queryKey: ['notifications'],
  queryFn: notificationsApi.list,
});

// Mutation (write)
const mutation = useMutation({
  mutationFn: (id: string) => notificationsApi.markRead(id),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  },
});
```

**Cache invalidation:** After any mutation that changes data visible elsewhere on the screen, call `queryClient.invalidateQueries` with the relevant query key so the UI stays in sync.

---

## Code Conventions

- **File naming:** PascalCase for all components and pages (`CampaignCard.tsx`). camelCase for all other modules (`client.ts`, `authSlice.ts`).
- **Component exports:** All components and pages use default exports.
- **Types:** All shared interfaces live in `src/types/index.ts`. Inline types are acceptable for component-local state.
- **Error handling in mutations:** Always display `mutation.error?.message` in the UI. Never `console.error` silently without user feedback.
- **Forms:** Controlled components with local `useState`. Do not install a form library unless the complexity clearly warrants it.
- **Imports:** Group imports in this order — React, third-party libraries, internal modules. No barrel (`index.ts`) re-exports for pages or components.
- **No tokens in state:** API session management is cookie-based. Never store session identifiers in Redux, `localStorage`, or `sessionStorage`.

---

## Deployment

The application is a static single-page application. The `npm run build` command produces an optimised bundle in `dist/`.

**Requirements for the host:**

- Serve `index.html` for all routes (SPA fallback). On Nginx:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

- The backend API (`campuscare-5zm2.onrender.com`) must allow the frontend origin in its CORS policy and must set `SameSite=None; Secure` on the session cookie if the frontend and backend are on different domains.

**Changing the API base URL for a different environment:**

Update the constant at the top of `src/api/client.ts` before building. If multiple environments are needed long-term, move this value into an `.env` file and reference it as `import.meta.env.VITE_API_URL`.

---

## Known Limitations

- **Donation processing is status-based.** The contribution flow calls `POST /contributions` and receives either `success` for immediately released donations or `pending` for donations held until the campaign bank account is verified by an admin. There is no real payment gateway integration yet.
- **No image upload UI.** Avatar and attachment URLs must be externally hosted (e.g., Cloudinary) and pasted in as text. The API accepts URLs, not binary uploads.
- **Online session links are external.** For online counselling bookings, the counsellor arranges the Google Meet link outside the platform and sends it directly to the student's email. The platform does not generate or store meeting links.
- **Backend cold starts.** The API is hosted on Render's free tier, which spins down after inactivity. The first request after a period of inactivity may take 30–60 seconds. This is a backend infrastructure constraint, not a frontend issue.
- **No pagination on the campaigns page.** The `GET /campaigns` endpoint currently returns all approved campaigns. If the dataset grows significantly, pagination or infinite scroll should be added to `AllCampaignsPage.tsx`.
