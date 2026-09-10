# Colmena API

Node.js/Express backend for document routing between teams, response tracking, and status reporting.

## Tech Stack

- **Runtime**: Node.js 22
- **Framework**: Express 5
- **Database**: MySQL (hosted on Aiven)
- **ORM**: Prisma 7 (with `@prisma/adapter-mariadb`)
- **Auth**: JWT (access + refresh tokens), bcrypt for password hashing
- **Validation**: Zod
- **File uploads**: Multer (in-memory) + `file-type` for content verification

## Getting Started

### Prerequisites

- Node.js 22+
- A MySQL database (this project uses Aiven, but any MySQL 8+ instance works)

### Installation

\`\`\`bash
npm install
\`\`\`

### Environment variables

Copy `.env.example` to `.env` and fill in the values:

\`\`\`
PORT=4000
CORS_ORIGIN=http://localhost:5173
DATABASE_URL="mysql://user:password@host:port/database?sslaccept=strict"
JWT_SECRET=<generate with crypto.randomBytes>
JWT_REFRESH_SECRET=<generate with crypto.randomBytes, different from JWT_SECRET>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
\`\`\`

Generate secrets with:
\`\`\`bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
\`\`\`

### Database setup

\`\`\`bash
npx prisma migrate dev
npx prisma generate
node prisma/seed/seed.js
\`\`\`

The seed script creates a test admin user:
- Email: `admin@colmena.local`
- Password: `Test1234!`

### Running the server

\`\`\`bash
npm run dev    # with auto-reload (nodemon)
npm start      # production mode
\`\`\`

Server runs on `http://localhost:4000` by default.

## Project Structure

\`\`\`
src/
├── config/         # Database client setup
├── controllers/    # Request validation and HTTP responses
├── middlewares/     #
