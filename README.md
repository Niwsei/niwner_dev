# Learning Platform Skeleton

This repository provides a starting point for a microservices-based learning platform.

## Structure

- `backend/` – microservices for core platform domains.
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

## Getting Started

Each service can be run independently. For example:

```bash
cd backend/user-service
npm install
npm run prisma
npm run dev
```

This starts the User Service on port `3000` with `/health` and `/users` endpoints.

## Future Work

Additional services, frontends, message bus integrations, and data stores should be added following the architecture plan.
