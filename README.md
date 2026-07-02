# SERVICE SHELF — Indian Service Booking Platform

A full-stack service booking platform built for Full Stack Development Week 7,8,9. Book home services like AC repair, deep cleaning, plumbing, salon at home, pest control and more across Indian cities through **SERVICE SHELF**.

## Features

### Week 7
- Database design for services, bookings, payments, and notifications
- Dynamic service listing pages with category filters and search
- Booking form with calendar and time slot picker
- User authentication (register/login) and profile management

### Week 8
- Complete booking flow with demo payment processing
- Customer dashboard with order history and notifications
- Admin dashboard for service provider (stats, bookings, services)
- Email & SMS notifications (demo mode — logged to console)
- 13 Indian home services across 5 categories

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router, React Calendar |
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| Auth | JWT + bcrypt |
| Payments | Demo mode (simulated UPI/Card/NetBanking/Wallet) |

## Quick Start

### Prerequisites
- Node.js 18+ installed

### 1. Backend Setup

```bash
cd backend
npm install
npm run seed
npm run dev
```

Backend runs at **http://localhost:5000**

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Customer | priya@demo.com | demo123 |
| Admin | admin@sevasetu.in | admin123 |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| GET | /api/services | List services (filter by category/search) |
| GET | /api/services/:slug | Service details |
| GET | /api/services/:slug/slots?date=YYYY-MM-DD | Available time slots |
| POST | /api/bookings | Create booking (auth required) |
| GET | /api/bookings/my | User's bookings |
| POST | /api/payments/demo-pay | Demo payment |
| GET | /api/admin/stats | Admin dashboard stats |
| GET | /api/admin/bookings | All bookings (admin) |

## Database Schema

- **users** — customers and admins
- **service_categories** — Home Services, Appliance Repair, etc.
- **services** — individual bookable services with Indian pricing (₹)
- **bookings** — booking records with date, time slot, status
- **payments** — payment records (demo transactions)
- **notifications** — email, SMS, and in-app notifications

## Services Included

| Category | Services |
|----------|----------|
| Home Services | Deep Cleaning, Sofa Shampooing, House Painting |
| Appliance Repair | AC Service, Washing Machine, Refrigerator |
| Beauty & Wellness | Salon at Home, Massage Therapy |
| Electrical & Plumbing | Electrician, Plumbing, CCTV Installation |
| Pest Control | Cockroach Control, Termite Treatment |

## Project Structure

```
SevaSetu/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express server
│   │   ├── database.js        # SQLite schema
│   │   ├── seed.js            # Indian services seed data
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Auth middleware
│   │   └── services/          # Notification service
│   └── data/                  # SQLite database file
├── frontend/
│   ├── src/
│   │   ├── pages/             # Dynamic page components
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # Auth context
│   │   └── api/               # API client
│   └── index.html
└── README.md
```

## User Flow

1. Browse services on homepage or `/services`
2. View service details → Click "Book Now"
3. Login/Register if not authenticated
4. Select date (calendar) and time slot
5. Enter address and contact details
6. Complete demo payment (UPI/Card/NetBanking/Wallet)
7. Receive email & SMS notifications (demo)
8. Track booking in customer dashboard
9. Admin manages bookings and services from admin panel

## Notes

- Payments are **demo only** — no real money is charged
- Notifications are logged to the backend console (no real email/SMS sent)
- Sundays are disabled in the booking calendar
- All prices are in Indian Rupees (₹)

## Week 9: Performance, Testing & Security

```bash
# Run all tests
cd backend && npm test
cd frontend && npm test

# API benchmark (server must be running)
cd backend && npm run benchmark

# Production build
cd frontend && npm run build
```

See `docs/PERFORMANCE_REPORT.md` and `docs/SECURITY_AUDIT.md` for full details.
