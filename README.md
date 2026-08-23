# Car Dealership Inventory System

A full-stack car dealership inventory application built with React, Express,TypeScript, Prisma, and SQLite. Users can register, sign in, browse inventory,
search and filter vehicles, compare prices with category averages, purchase available vehicles, save favorites, and review recently viewed vehicles.

The backend also provides protected admin endpoints for creating, updating,deleting, and restocking vehicles. The frontend admin screen is currently a UI placeholder for those workflows.

## Features

- User registration and login with hashed passwords and JWT authentication
- Role-based access control for admin inventory operations
- Vehicle inventory listing and detail views
- Search by make, model, category, and price range
- Sorting by featured inventory, price, year, and mileage
- Favorite vehicles and recently viewed vehicles
- Purchase flow with inventory quantity updates
- Prisma database migrations and demo vehicle seed data
- Automated backend tests with Jest and Supertest

## Project Structure

```text
backend/   Express API, Prisma schema, migrations, seed script, and tests
frontend/  React/Vite client application
```

## Requirements

- Node.js 
- npm

## Local Setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Configure the backend

Create `backend/.env` from `backend/.env.example`:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="replace-with-a-long-random-secret"
PORT=4000
```

Use a long, unique value for `JWT_SECRET`. Do not commit `.env` or the local
SQLite database.

### 3. Create and seed the database

```bash
cd backend
npm run prisma:generate
npm run prisma:migrate:dev
npm run db:seed
```

### 4. Start the applications

In one terminal:

```bash
cd backend
npm run dev
```

In another terminal:

```bash
cd frontend
npm run dev
```

Open `http://localhost:5173`. The Vite development server proxies `/api`
requests to the backend at `http://localhost:4000`.

For a different API URL, set `VITE_API_BASE_URL` in the frontend environment.

## API Endpoints

Authentication:

- `POST /api/auth/register`
- `POST /api/auth/login`

Authenticated vehicle operations:

- `GET /api/vehicles`
- `GET /api/vehicles/search`
- `GET /api/vehicles/favorites`
- `POST /api/vehicles/:id/favorite`
- `GET /api/vehicles/recent`
- `POST /api/vehicles/:id/view`
- `POST /api/vehicles/:id/purchase`

Admin-only inventory operations:

- `POST /api/vehicles`
- `PUT /api/vehicles/:id`
- `DELETE /api/vehicles/:id`
- `POST /api/vehicles/:id/restock`

Health checks are available at `GET /health` and `GET /`.

## Tests and Quality Checks

Run backend tests:

```bash
cd backend
npm test
```

Run builds:

```bash
cd backend
npm run build

cd ../frontend
npm run build
```

Lint and formatting checks are available through `npm run lint` and
`npm run format` in each package.





