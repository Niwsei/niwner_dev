# Learning Platform Skeleton

This repository provides a starting point for a microservices-based learning platform.

## Structure

- `backend/` – microservices for core platform domains (TypeScript).
  - `user-service/` – authentication & user management (Express.js + TypeScript + Prisma).
  - `course-service/` – course management service (Express.js).
  - `payment-service/` – payment processing (Express.js).
  - `logic-service/` – logic training features (Express.js).
  - `flow-service/` – workflow and process tools (Express.js).
  - `project-service/` – project management (Express.js).
  - `gamification-service/` – achievements and leaderboards (Express.js).
  - `community-service/` – chat and community forums (Express.js).
  - `shop-service/` – e-commerce operations (Express.js).
  - `analytics-service/` – reporting and metrics (Express.js).
  - `ai-service/` – AI and recommendation engine (Express.js).
- `frontend/` – frontend applications.
  - `web-app/` – Next.js web application skeleton.
- `infrastructure/` – infrastructure as code and deployment configs.

## Getting Started (TypeScript)

Each service can be run independently. For example:

```bash
cd backend/user-service
npm install
npm run prisma
npm run dev
```

All services now run TypeScript in dev via `ts-node-dev` and build to `dist/` for production. The User Service runs on port `3000` with `/health` and `/users` endpoints.

## Future Work

Additional services, frontends, message bus integrations, and data stores should be added following the architecture plan.

## MVP Feature Slice Implemented

- Course Management: In-memory CRUD for courses, modules, lessons with preview in `backend/course-service` (port 3001).
- Gamification: XP and achievements endpoints in `backend/gamification-service` (port 3002).
- Logic Training: Random puzzle generator and simple code analyzer in `backend/logic-service` (port 3003).
- Flow Design: Workflow CRUD with basic validation in `backend/flow-service` (port 3004).
- Frontend wiring: Course list/detail and XP points page now call the above APIs.

### Run (local dev)

1. Option A — Use Mock Data (no backends needed):
   - In `frontend/web-app`, create `.env.local` with `NEXT_PUBLIC_USE_MOCK=1`
   - Then run frontend only: `cd frontend/web-app && npm run dev`
   - All features on the web app will use in-memory mock data.

2. Option B — Run real services (separate terminals) in dev mode:
   - `cd backend/course-service && npm run dev`
   - `cd backend/gamification-service && npm run dev`
   - `cd backend/logic-service && npm run dev`
   - `cd backend/flow-service && npm run dev`
   - Optional others: `cd backend/{project-service|payment-service|analytics-service|ai-service|community-service|shop-service} && npm run dev`
3. Start frontend:
   - `cd frontend/web-app && npm run dev`
3. Visit:
   - Courses: `http://localhost:3000/courses`
   - Course detail: `http://localhost:3000/courses/1` (after creating a course via API)
   - Points: `http://localhost:3000/gamification/points`

### Sample API Usage

- Create a course:
  `POST http://localhost:3001/courses` with `{ "title": "Intro to Logic" }`
- Add a module:
  `POST http://localhost:3001/courses/1/modules` with `{ "title": "Basics" }`
- Add a lesson:
  `POST http://localhost:3001/modules/1/lessons` with `{ "title": "What is a proposition?" }`
- Get random logic puzzle:
  `GET http://localhost:3003/puzzles/random`
- Analyze code logic:
  `POST http://localhost:3003/analyze` with `{ "code": "if (a) { for(...) {} }" }`
- Add XP:
  `POST http://localhost:3002/users/demo-user-1/points` with `{ "delta": 200 }`

Note: These are in-memory stores for rapid prototyping. Persist to DB and secure endpoints before production.
