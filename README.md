# cms-cloud

REST API backend for a headless CMS — Node.js · TypeScript · Express 5 · Firebase Realtime Database · GCP Cloud Run

![Build](https://img.shields.io/github/actions/workflow/status/pentashi/cms-cloud/cloudbuild.yaml?label=build)
![Version](https://img.shields.io/github/package-json/v/pentashi/cms-cloud)
![License](https://img.shields.io/badge/license-ISC-blue)
![Coverage](https://img.shields.io/badge/coverage-jest-green)

---

## Overview

`cms-cloud` is a stateless, containerised REST API that powers a headless CMS. It handles user authentication (signup/login with JWT), full CRUD for content posts, and exposes an OpenAPI spec via Swagger UI.

The service is designed to run on **GCP Cloud Run** with a Firebase Realtime Database backend and GCP Cloud Storage for assets. It ships as a single Docker image built and pushed by **Cloud Build**.

**Target audience:** backend engineers integrating a headless CMS into a web or mobile product, or operators evaluating it for production deployment on GCP.

---

## Key Features

- **JWT authentication** — stateless Bearer-token auth; no session state in the API layer.
- **Full post CRUD** — create, read, update, and delete content posts with per-route auth guards.
- **Schema validation** — every request body is validated with Zod before hitting business logic; invalid payloads return structured 400 errors.
- **Centralised error handling** — a single Express error-handler normalises all thrown errors into consistent JSON responses.
- **OpenAPI / Swagger UI** — live interactive docs at `/docs`; spec is generated from `src/docs/swagger.json`.
- **Security hardening** — Helmet sets safe HTTP headers; CORS is configurable via env; no secrets are logged.
- **Structured request logging** — Morgan HTTP logging in all environments.
- **Container-first** — multi-stage Dockerfile produces a minimal `node:18-alpine` production image; Cloud Build automates the CI/CD pipeline.

---

## Architecture Overview

```
Client
  │
  ▼
GCP Cloud Run  (Docker container — dist/server.js)
  │   ├── POST /auth/signup · POST /auth/login
  │   ├── GET  /posts · GET /posts/:id
  │   └── POST /posts · PUT /posts/:id · DELETE /posts/:id  ← JWT required
  │
  ├── Firebase Realtime Database  (user records, post data)
  └── GCP Cloud Storage           (media assets)
```

The API is fully stateless; all persistent state lives in Firebase and Cloud Storage. Cloud Run scales to zero and horizontally with no code changes.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| npm | 9+ |
| Docker | 20+ (for container builds) |
| GCP project | with Firebase Realtime Database and Cloud Storage enabled |
| Firebase project | Realtime Database provisioned |

A GCP service-account key with **Firebase Admin SDK** access is required at runtime. Never commit this file — load it via an environment variable or GCP Secret Manager.

---

## Installation & Quick Start

```bash
git clone https://github.com/pentashi/cms-cloud.git
cd cms-cloud

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env and fill in Firebase credentials and JWT_SECRET (see Configuration below)

# Start the dev server (hot-reload via nodemon)
npm run dev
# → Server running on http://localhost:3000
# → Swagger UI at  http://localhost:3000/docs
```

**Production build:**

```bash
npm run build          # tsc + copy swagger.json → dist/
npm run start:prod     # node dist/server.js
```

**Docker (local):**

```bash
docker build -t cms-cloud .
docker run --env-file .env -p 8080:8080 cms-cloud
```

---

## Configuration

All configuration is injected via environment variables. Copy `.env.example` to `.env` for local development.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `FIREBASE_API_KEY` | string | — | Firebase Web API key (from Firebase console → Project settings) |
| `FIREBASE_AUTH_DOMAIN` | string | — | Firebase auth domain, e.g. `your-project.firebaseapp.com` |
| `FIREBASE_DATABASE_URL` | string | — | Realtime Database URL, e.g. `https://your-project-default-rtdb.firebaseio.com` |
| `FIREBASE_PROJECT_ID` | string | — | GCP project ID |
| `FIREBASE_STORAGE_BUCKET` | string | — | Cloud Storage bucket, e.g. `your-project.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | string | — | Firebase messaging sender ID |
| `FIREBASE_APP_ID` | string | — | Firebase app ID |
| `PORT` | number | `3000` | Port the HTTP server listens on. Cloud Run injects `8080`. |
| `NODE_ENV` | string | `development` | Set to `production` in deployed environments. |
| `JWT_SECRET` | string | — | Secret used to sign and verify JWT tokens. Use a strong random value (32+ chars). |

> **Production note:** Do not use `.env` files in Cloud Run. Inject secrets via [GCP Secret Manager](https://cloud.google.com/secret-manager) and reference them as environment variables in the Cloud Run service configuration.

---

## Usage Examples

### Sign up

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "s3cur3P@ss"}'
```

Response `201`:

```json
{ "token": "<jwt>", "user": { "email": "user@example.com" } }
```

### Log in

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "s3cur3P@ss"}'
```

### Create a post (authenticated)

```bash
TOKEN="<jwt from login>"

curl -X POST http://localhost:3000/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: ******" \
  -d '{"title": "Hello World", "content": "First post."}'
```

Response `201`:

```json
{ "id": "abc123", "title": "Hello World", "content": "First post.", "createdAt": "..." }
```

### Fetch all posts (public)

```bash
curl http://localhost:3000/posts
```

### Update a post

```bash
curl -X PUT http://localhost:3000/posts/abc123 \
  -H "Content-Type: application/json" \
  -H "Authorization: ******" \
  -d '{"title": "Updated Title"}'
```

### Delete a post

```bash
curl -X DELETE http://localhost:3000/posts/abc123 \
  -H "Authorization: ******"
```

---

## API Reference

Full interactive documentation is available at `GET /docs` (Swagger UI).

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/auth/signup` | — | Register a new user |
| `POST` | `/auth/login` | — | Authenticate and receive a JWT |
| `GET` | `/posts` | — | List all posts |
| `GET` | `/posts/:id` | — | Get a single post by ID |
| `POST` | `/posts` | ****** | Create a new post |
| `PUT` | `/posts/:id` | ****** | Update an existing post |
| `DELETE` | `/posts/:id` | ****** | Delete a post |
| `GET` | `/` | — | Health check — returns `{ status, timestamp }` |

All error responses follow the shape:

```json
{ "error": "Human-readable message", "details": [ ... ] }
```

Validation errors (`400`) include a `details` array of Zod field-level errors.

---

## Testing

Tests use **Jest** with **ts-jest** and run against the `src/` source directly.

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Generate coverage report (lcov + text summary)
npm run test:coverage
```

Test files live in `src/**/__tests__/**/*.test.ts`. Coverage is collected from all `src/**/*.ts` files, excluding `server.ts` and `firebase.ts`.

---

## Deployment

This service is designed for **GCP Cloud Run** and is built automatically via **Cloud Build** on push.

**Docker image:**

```bash
docker build -t gcr.io/<PROJECT_ID>/cms-cloud:latest .
docker push gcr.io/<PROJECT_ID>/cms-cloud:latest
```

**Deploy to Cloud Run:**

```bash
gcloud run deploy cms-cloud \
  --image gcr.io/<PROJECT_ID>/cms-cloud:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,PORT=8080 \
  --update-secrets FIREBASE_API_KEY=cms-cloud-firebase-api-key:latest,JWT_SECRET=cms-cloud-jwt-secret:latest
```

**Production checklist:**

- Set `NODE_ENV=production`. Morgan switches to `combined` format; Express disables stack traces in error responses.
- Inject all secrets via GCP Secret Manager — never bake credentials into the image.
- Enable [Cloud Run min-instances](https://cloud.google.com/run/docs/configuring/min-instances) if cold-start latency is unacceptable.
- Point Firebase Admin SDK to the correct project; use Workload Identity where possible instead of a JSON key file.
- Configure CORS to allow only your known frontend origins in production.

---

## Contributing

1. **Branch** off `main` using the pattern `feat/<short-description>` or `fix/<short-description>`.
2. **Commit** with [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `docs:`, `chore:`, etc.
3. **Test** — all tests must pass (`npm test`) and coverage must not regress before opening a PR.
4. **Lint** — ensure `tsc --noEmit` exits cleanly.
5. **PR** — open against `main`; fill out the PR description with the change rationale and testing notes.
6. **Review** — at least one approving review is required before merge.

Code standards:

- TypeScript strict mode; no `any` without a suppression comment explaining why.
- Zod schemas own all input validation; no ad-hoc manual checks.
- All new route handlers must go through `asyncHandler` to ensure errors propagate to the centralised error handler.

---

## Security

To report a security vulnerability, **do not open a public GitHub issue**. Email the maintainer directly or use [GitHub's private vulnerability reporting](https://github.com/pentashi/cms-cloud/security/advisories/new).

Please include:
- A description of the vulnerability and its potential impact.
- Steps to reproduce or a proof-of-concept.
- Any suggested mitigations.

Disclosures are acknowledged within 48 hours. A fix or mitigation is targeted within 14 days for critical issues.

> **Note:** Never commit GCP service-account key files or any credentials to this repository. GitHub secret scanning is enabled; pushes containing detected secrets will be rejected.

---

## License

ISC © [pentashi](https://github.com/pentashi)