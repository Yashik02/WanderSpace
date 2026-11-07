# WanderSpace
**🚀 Live Demo:** [Visit WanderSpace here]([https://your-vercel-url.vercel.app](https://wander-space.vercel.app/))

WanderSpace is a full-stack vacation-rental marketplace built for a 3rd
Semester B.Tech CSE academic project. Travelers can browse stays, search
and filter listings, view ratings and reviews, and save favorites. Authenticated
hosts can create, edit, and delete their own listings.

## Features

- Responsive React single-page application with client-side routing.
- Search by title, location, country, or category.
- Category filtering and sorting by price or rating.
- Listing detail pages with SQL-calculated average ratings and review counts.
- User registration, login, and logout through Supabase Auth.
- Authenticated hosts can create, update, and delete their own listings.
- Wishlist persistence in browser `localStorage`.
- Reviews with 1-to-5 star ratings.
- Light/dark theme, language selection, currency display, notifications, and
  responsive navigation.
- Interactive listing map using Leaflet and React Leaflet.
- Supabase PostgreSQL schema with foreign keys, validation checks, and cascading review
  deletion.
- Development mode through Vite middleware and production static serving from
  the Express server.

## Technology Stack

### Frontend

- React 19 and TypeScript
- Vite 6
- React Router 7
- Leaflet and React Leaflet
- Lucide React
- Tailwind CSS Vite integration and custom CSS

### Backend

- Node.js 18+ (20+ recommended)
- Express 4
- TypeScript executed with `tsx`
- Supabase Auth authentication
- `@supabase/supabase-js`

### Database

- Supabase PostgreSQL accessed through the server using `pg`
- `schema.sql` for table definitions and constraints
- `seeds.sql` for sample listings and reviews

## Prerequisites

Install the following before running the project:

- [Node.js](https://nodejs.org/) 18 or newer (20+ recommended)
- npm
- A Supabase project

## Local Setup

### 1. Install dependencies

From the project directory:

```bash
npm install
```

### 2. Create the Supabase database

Create a Supabase project, then open **SQL Editor** and run [schema.sql](./schema.sql).
The schema references `auth.users`, so it must be run inside the Supabase project.
Run [seeds.sql](./seeds.sql) afterward if you want the sample listings and reviews.

### 3. Configure environment variables

Copy `.env.example` to `.env` and fill in the values from Supabase:

```env
DATABASE_URL=postgresql://postgres:<password>@db.<project-ref>.supabase.co:5432/postgres
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=
CORS_ORIGIN=
NODE_ENV=development
AUTO_INIT_DB=false
```

Use the Supabase direct database connection string for local development, or
the transaction pooler connection string for hosted deployment. Copy the
service-role key from **Project Settings → API**. It must remain server-side
and must never be exposed as a `VITE_` variable or committed to source control.
The anonymous key is safe for browser use when Supabase Row Level Security is
configured correctly.
Leave `VITE_API_URL` empty when the frontend and Express API share the same
origin. Set it to the deployed API origin when hosting them separately. When
the frontend and API are hosted separately, set the backend's `CORS_ORIGIN` to
the exact Vercel deployment URL.
Set `AUTO_INIT_DB=true` only if the server should execute `schema.sql` during
startup; running the schema manually in Supabase SQL Editor is safer.

### 4. Start the application

```bash
npm run dev
```

For deployment, set the same server environment variables in your hosting
provider and run `npm run build` followed by `npm start`.

### Existing data migration

The old `data/wanderspace.sqlite` file and the previous MySQL-style `users`
table are not read by the new application. Export the listing and review rows
to CSV, import those rows into the Supabase `listings` and `reviews` tables,
and leave `user_id` empty unless the corresponding Supabase Auth user already
exists. Existing password hashes cannot be imported into Supabase Auth; users
must register again (or be created through the Supabase Auth dashboard).

Never commit `.env` or real database credentials.

Open [http://localhost:3000](http://localhost:3000). With
`AUTO_INIT_DB=false`, create the schema manually first; the server loads
`seeds.sql` automatically only when the `listings` table is empty.

## Available Scripts

| Script            | Description                                         |
| :---------------- | :-------------------------------------------------- |
| `npm run dev`     | Start Express with Vite middleware for development  |
| `npm run build`   | Build the Vite client and bundle the Express server |
| `npm run start`   | Start the production server from `dist/server.cjs`  |
| `npm run preview` | Preview the Vite client build                       |
| `npm run lint`    | Run the TypeScript compiler without emitting files  |
| `npm run clean`   | Remove generated build output                       |

For a production-style local run:

```bash
npm run build
npm run start
```

## Application Routes

| Path                 | Access              | Description                            |
| :------------------- | :------------------ | :------------------------------------- |
| `/`                  | Public              | Browse, search, filter, and sort stays |
| `/auth`              | Public              | Register or sign in                    |
| `/listings/:id`      | Public              | View listing details and reviews       |
| `/wishlist`          | Public              | View saved listings                    |
| `/listings/new`      | Authenticated       | Create a listing                       |
| `/listings/:id/edit` | Authenticated owner | Edit a listing                         |
| `*`                  | Public              | Not-found page                         |

## API Endpoints

### Authentication
Authentication is handled directly by Supabase Auth in the browser. The server
does not create sessions; protected API requests send the Supabase access token
as a bearer token, which the server verifies before applying ownership checks.
Registration requires a username of at least 3 characters and a password of at
least 8 characters.
This project uses usernames mapped to an internal Supabase email address, so
disable Supabase email confirmation unless the authentication UI is changed to
collect real email addresses.

### Listings and reviews

| Method   | Endpoint                    | Access        | Description                   |
| :------- | :-------------------------- | :------------ | :---------------------------- |
| `GET`    | `/api/listings`             | Public        | List stays                    |
| `GET`    | `/api/listings/:id`         | Public        | Get a stay and its reviews    |
| `POST`   | `/api/listings`             | Authenticated | Create a stay                 |
| `PUT`    | `/api/listings/:id`         | Owner         | Update a stay                 |
| `DELETE` | `/api/listings/:id`         | Owner         | Delete a stay and its reviews |
| `POST`   | `/api/listings/:id/reviews` | Authenticated | Add a review                  |
| `DELETE` | `/api/reviews/:id`          | Authenticated | Delete a review               |
| `GET`    | `/api/health`               | Public        | Check server health           |

`GET /api/listings` accepts these optional query parameters:

- `search`: matches title, location, country, or category.
- `category`: filters by category; `All` disables the category filter.
- `sort`: accepts `price_asc`, `price_desc`, or `rating`.

Example:

```bash
curl "http://localhost:3000/api/listings?search=beach&sort=rating"
```

## Database Design

The schema is defined in [`schema.sql`](./schema.sql) and contains:

- `profiles`: usernames linked to Supabase Auth users.
- `listings`: property details and optional host ownership.
- `reviews`: listing reviews, star ratings, and optional reviewer ownership.

Foreign keys use `ON DELETE CASCADE` for reviews when a listing is removed and
`ON DELETE SET NULL` when an associated user is removed. Listing ratings are
calculated with `AVG()` and review counts with `COUNT()` in the listing
queries.

## Project Structure

```text
wanderspace/
├── package.json              # Scripts and dependencies
├── schema.sql                # Supabase PostgreSQL tables and constraints
├── seeds.sql                 # Sample listings and reviews
├── server.ts                 # Express and Vite server entry point
├── server/
│   ├── db.ts                 # PostgreSQL pool and database initialization
│   ├── express.d.ts          # Express request user types
│   ├── middleware/
│   │   └── auth.ts            # Supabase access-token verification
│   └── routes/
│       ├── listings.ts        # Listing CRUD endpoints
│       ├── reviews.ts         # Review endpoints
│       └── wishlist.ts        # Wishlist route module
└── src/
    ├── App.tsx               # Application routes and layout
    ├── main.tsx              # React providers and entry point
    ├── components/           # Shared UI components
    ├── hooks/                # Auth, theme, language, currency, and UI hooks
    └── pages/                # Route-level screens
```

## Academic Scope

This project demonstrates full-stack application development, REST API design,
session authentication, relational database modeling, referential integrity,
SQL aggregation, TypeScript type checking, and responsive frontend design.
