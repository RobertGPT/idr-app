# Ideal Day Roadmap App

This repository contains the scaffold for the **Ideal Day Roadmap (IDR) App**, a minimal proof‑of‑concept built using Next.js API routes and Prisma.  The app exposes a handful of JSON endpoints that serve modules and badges seeded into a PostgreSQL database.  It is designed to provide a starting point for building out the Ideal Day Roadmap experience.

## Project Structure

```
idr-app/
  prisma/               # Prisma schema and database seed script
    schema.prisma
    seed.ts
  seed/                 # JSON and SQL seed sources
    source_to_module_map.json
    badges.config.json
    seeseed_badges.sql
  pages/api/            # Next.js API routes
    modules.ts          # GET endpoint returning all modules
    badges.ts           # GET endpoint returning all badges
    roadmap.ts          # Placeholder endpoint for future roadmap logic
  package.json          # Defines scripts and dependencies
  tsconfig.json         # TypeScript compiler configuration
  README.md             # This file
```

## Getting Started

1. **Install dependencies**: make sure you have Node.js and npm installed.  Run:

   ```bash
   npm install
   ```

2. **Configure your database**: create a PostgreSQL database and set the `DATABASE_URL` environment variable in a `.env` file at the project root.  For example:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/idr_db"
   ```

3. **Run database migrations**: generate the Prisma client and create your tables.

   ```bash
   npx prisma migrate dev --name init
   ```

4. **Seed the database**: run the seed script to populate modules and badges using the source JSON files.

   ```bash
   npm run seed
   ```

5. **Start the development server**: spin up the Next.js server and access your API routes at `http://localhost:3000/api/*`.

   ```bash
   npm run dev
   ```

## API Endpoints

These endpoints are implemented as [Next.js API routes](https://nextjs.org/docs/pages/api-routes/introduction) and return JSON.

| Path           | Method | Description                         |
|----------------|--------|-------------------------------------|
| `/api/modules` | GET    | Returns an array of all modules      |
| `/api/badges`  | GET    | Returns an array of all badges       |
| `/api/roadmap` | GET    | Placeholder response for future work |

## Seeding Data

The seeding logic lives in [`prisma/seed.ts`](./prisma/seed.ts) and uses JSON definitions from the [`seed/`](./seed) folder to populate the database.  Running `npm run seed` will read `source_to_module_map.json` and `badges.config.json` and insert their contents into the `Module` and `Badge` tables respectively.

For convenience, an equivalent SQL script is provided in [`seed/seeseed_badges.sql`](./seed/seeseed_badges.sql) showing how badges might be inserted directly with SQL.

## Extending

This scaffold is intentionally minimal.  To build out the Ideal Day Roadmap experience, you might:

* Flesh out the `/api/roadmap` endpoint to generate personalized roadmaps based on completed modules or user input.
* Add authentication and user tracking to record progress through modules and award badges.
* Create a front‑end that consumes these endpoints and presents the roadmap to end users.

Feel free to explore and adapt the structure to suit your needs!
