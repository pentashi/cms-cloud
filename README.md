# CMS Cloud Backend

A production-oriented CMS backend built with Node.js, TypeScript, Express, and Firebase Realtime Database.

This project focuses on clean architecture, API-first design, and real-world backend practices.

---

## Tech Stack

- Node.js
- TypeScript
- Express
- Firebase Realtime Database
- Nodemon / ts-node
- Environment-based configuration

---

## Current Features

- Health check endpoint
- Posts CRUD (Create, Read)
- Firebase Realtime Database integration
- Centralized type definitions
- Secure environment configuration

---

## Project Structure

```txt
src/
  ├─ server.ts        # App entry point
  ├─ firebase.ts      # Firebase initialization
  ├─ types/
  │   └─ post.ts      # Shared Post type
