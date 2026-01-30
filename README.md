# CMS Cloud Backend

A robust, scalable, and secure Content Management System (CMS) backend built with Node.js, TypeScript, Express, and Firebase Realtime Database.

## 🚀 Features

- **User Authentication**: Secure signup and login with JWT.
- **Post Management**: Full CRUD API for posts with validation and authentication.
- **API Documentation**: Interactive Swagger UI at `/docs`.
- **Validation**: Strong input validation using Zod.
- **Centralized Error Handling**: Consistent and informative error responses.
- **Security**: Helmet, CORS, and environment-based configuration.
- **Logging**: HTTP request logging with Morgan.

## 🗂️ Project Structure

```
src/
  controllers/      # Route logic (User, Post)
  docs/             # Swagger API docs
  middleware/       # Auth, validation, error handling
  routes/           # Express route definitions
  services/         # Business logic (User, Post)
  types/            # TypeScript types
  utils/            # Utility classes (AppError, etc.)
  validators/       # Zod schemas for validation
  firebase.ts       # Firebase initialization
  server.ts         # App entry point
```

## 🛠️ Tech Stack

- Node.js 18+
- TypeScript
- Express 5
- Firebase Realtime Database
- Zod (validation)
- Swagger UI
- Helmet, CORS, Morgan

## 📦 Getting Started

1. **Clone the repo**
  ```sh
  git clone https://github.com/pentashi/cms-cloud.git
  cd cms-cloud
  ```

2. **Install dependencies**
  ```sh
  npm install
  ```

3. **Configure environment**
  - Copy `.env.example` to `.env` and fill in your Firebase and JWT secrets.

4. **Run in development**
  ```sh
  npm run dev
  ```

5. **Build for production**
  ```sh
  npm run build
  npm run start:prod
  ```

## 📖 API Documentation

- Visit [http://localhost:3000/docs](http://localhost:3000/docs) for interactive Swagger UI.

## 🧪 Testing

- Run all tests:
  ```sh
  npm test
  ```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Please open an issue or submit a pull request.

## 📝 License

This project is licensed under the MIT License.

---
ection-from-the-command-line#resolving-a-blocked-push
remote:
remote:
remote:       —— Google Cloud Service Account Credentials —————————— 
remote:        locations:
remote:          - commit: abd2299884ad25a0899f99b3d54e84cc0ca41ffd  
remote:            path: cms-cloud-admin.json.json:1
remote:
remote:        (?) To push, remove secret from commit(s) or follow th  his URL to allow the secret.
remote:        https://github.com/pentashi/cms-cloud/security/secret-  -scanning/unblock-secret/38xU8cP7x17FuygmpGQwXbZixUU
remote:
remote:
remote:
To https://github.com/pentashi/cms-cloud.git
 ! [remote rejected] main -> main (push declined due to repository rule violations)       
error: failed to push some refs to 'https://github.com/pentashi/cms-cloud.git'
PS C:\Users