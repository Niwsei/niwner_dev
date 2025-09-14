# Learning Platform Skeleton

This repository provides a starting point for a microservices-based learning platform.

## Structure

- `backend/` – microservices for core platform domains.
  - `user-service/` – authentication & user management (Express.js).
  - `course-service/` – course management service (Express.js).
- `frontend/` – frontend applications.
  - `web-app/` – Next.js web application skeleton.
- `infrastructure/` – infrastructure as code and deployment configs.

## Getting Started

Each service can be run independently. For example:

```bash
cd backend/user-service
npm install
npm start
```

This starts the User Service on port `3000` with a `/health` endpoint.

## Future Work

Additional services, frontends, message bus integrations, and data stores should be added following the architecture plan.
