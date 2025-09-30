# Social AI MVP - Backend Skeleton

This repository contains a minimal backend skeleton for a multi-agent social media automation MVP.

## What is included
- `backend/` - Node.js service with:
  - `src/api.js` - minimal API to enqueue jobs
  - `src/worker.js` - worker that processes 'generate' jobs with stubbed agents
  - `src/agents/*` - placeholders for agent implementations
  - `.env.example` - example environment variables
  - `package.json` - dependencies and scripts
- `infra/docker-compose.yml` - Postgres, Redis, and backend service skeleton to run locally via Docker Compose

## Quickstart (local)
1. Copy `.env.example` to `backend/.env` and edit if needed.
2. Start services with Docker Compose:
   ```
   docker compose -f infra/docker-compose.yml up --build
   ```
3. Install Node dependencies (if not using Docker for backend):
   ```
   cd backend
   npm install
   npm run start
   ```
4. Enqueue a job:
   ```
   curl -X POST http://localhost:3000/enqueue -H "Content-Type: application/json" -d '{"brandId":1,"platform":"instagram"}'
   ```

## Notes
- The code includes stubs for agents; replace with real integrations to LLMs, Stable Diffusion, compliance checks, and posting APIs.
- For production, secure environment variables, use managed Postgres, and add authentication to the API.
