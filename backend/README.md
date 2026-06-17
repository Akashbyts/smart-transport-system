# BusTrack — Real-Time Bus Tracking Backend

Production-ready backend API for the BusTrack system.
Built with Node.js, Express, PostgreSQL, Redis, and Socket.IO.

---

## Tech Stack

| Layer        | Technology              |
|-------------|-------------------------|
| Runtime      | Node.js 18+             |
| Framework    | Express.js 4.x          |
| Database     | PostgreSQL 14+          |
| Cache        | Redis 7+                |
| Real-time    | Socket.IO 4.x           |
| Auth         | JWT (Access + Refresh)  |
| Validation   | Joi                     |
| Logging      | Winston                 |
| File Upload  | Multer                  |

---

## Prerequisites

- Node.js >= 18.x
- PostgreSQL >= 14
- Redis >= 7
- npm >= 9

---

## Installation

### 1. Clone and install dependencies
```bash
git clone <repo-url>
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Open `.env` and fill in all required values:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bus_tracking
DB_USER=postgres
DB_PASSWORD=yourpassword

REDIS_HOST=localhost
REDIS_PORT=6379

JWT_ACCESS_SECRET=your_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

ADMIN_EMAIL=admin@bustracking.com
ADMIN_PASSWORD=Admin@123456
```

### 3. Create PostgreSQL database
```sql
CREATE DATABASE bus_tracking;
```

### 4. Run migrations
```bash
npm run migrate
```

### 5. Seed admin account
```bash
npm run seed
```

### 6. Start development server
```bash
npm run dev
```

Server starts at: `http://localhost:5000`

---

## API Overview

### Auth Endpoints

| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | /api/auth/otp/send          | Send OTP to phone        |
| POST   | /api/auth/otp/verify        | Verify OTP               |
| POST   | /api/auth/driver/register   | Register driver          |
| POST   | /api/auth/driver/login      | Driver login             |
| POST   | /api/auth/passenger/register| Register passenger       |
| POST   | /api/auth/passenger/login   | Passenger login          |
| POST   | /api/auth/admin/login       | Admin login              |
| POST   | /api/auth/refresh           | Refresh access token     |
| POST   | /api/auth/logout            | Logout                   |

### Driver Endpoints (requires driver JWT)

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | /api/drivers/profile  | Get driver profile   |
| PATCH  | /api/drivers/profile  | Update profile       |
| POST   | /api/drivers/kyc      | Submit KYC documents |
| GET    | /api/drivers/trips    | Get trip history     |

### Trip Endpoints (requires driver JWT)

| Method | Endpoint                  | Description          |
|--------|---------------------------|----------------------|
| POST   | /api/trips/start          | Start a trip         |
| PATCH  | /api/trips/:id/end        | End a trip           |
| POST   | /api/trips/location       | Send GPS location    |
| GET    | /api/trips/active         | Get current trip     |

### Passenger Endpoints (requires passenger JWT)

| Method | Endpoint                         | Description            |
|--------|----------------------------------|------------------------|
| GET    | /api/passengers/profile          | Get profile            |
| GET    | /api/passengers/nearby-buses     | Get buses near me      |
| GET    | /api/passengers/search-routes    | Search routes          |
| GET    | /api/passengers/bus/:id/location | Get live bus location  |
| GET    | /api/passengers/bus/:id/details  | Get bus details        |

### Admin Endpoints (requires admin JWT)

| Method | Endpoint                             | Description          |
|--------|--------------------------------------|----------------------|
| GET    | /api/admin/dashboard                 | Dashboard stats      |
| GET    | /api/admin/drivers                   | List all drivers     |
| GET    | /api/admin/drivers/pending           | Pending KYC review   |
| PATCH  | /api/admin/drivers/:id/approve       | Approve driver       |
| PATCH  | /api/admin/drivers/:id/reject        | Reject driver        |
| GET    | /api/admin/trips                     | All trips            |

---

## Socket.IO Events

### Driver emits

| Event              | Payload                                      |
|--------------------|----------------------------------------------|
| driver:join        | `{ tripId }`                                 |
| driver:location    | `{ tripId, busId, latitude, longitude, heading, speed }` |
| driver:trip:end    | `{ tripId, busId }`                          |

### Passenger emits

| Event                    | Payload                              |
|--------------------------|--------------------------------------|
| passenger:track:bus      | `{ busId, tripId }`                  |
| passenger:untrack:bus    | `{ busId }`                          |
| passenger:nearby:buses   | `{ latitude, longitude, radiusKm }`  |

### Server emits to passengers

| Event                        | Description                  |
|------------------------------|------------------------------|
| bus:location:update          | Live GPS coordinates         |
| trip:ended                   | Trip has ended               |
| passenger:nearby:buses:result| Nearby buses list            |

---

## Health Check
```
GET /health
```

Returns server uptime and status.

---

## Project Structure
```
backend/
├── src/
│   ├── config/         # DB, Redis, Socket config
│   ├── middleware/      # Auth, rate limiter, validation
│   ├── modules/         # Feature modules (auth, driver, trip...)
│   ├── services/        # Shared services (OTP, location, upload)
│   ├── socket/          # Socket.IO handlers
│   ├── utils/           # Helpers (logger, jwt, geo)
│   └── app.js
├── database/
│   ├── migrations/      # SQL schema files
│   └── seeds/           # Initial data
├── uploads/             # User uploaded documents
├── logs/                # Application logs
└── server.js
```

---

## Deployment

See `STEP 8` of the project documentation for full Docker and production
deployment instructions including Nginx, PM2, and SSL setup.

---

## License

MIT