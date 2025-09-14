# User Service

A minimal Express.js service written in TypeScript. Uses **Prisma** for database access and **Zod** for request validation.

## Scripts

- `npm run dev` – start the service with auto-reload
- `npm run build` – compile TypeScript to `dist/`
- `npm start` – run the compiled service
- `npm run prisma` – generate Prisma client
- `npm test` – run placeholder tests

## Endpoints

- `GET /health` – health check
- `POST /users` – create a user (expects `{ email, password }`)

## Environment

Set `DATABASE_URL` to a PostgreSQL connection string.

## Docker

```
docker build -t user-service .
docker run -p 3000:3000 -e DATABASE_URL=postgres://... user-service
```
