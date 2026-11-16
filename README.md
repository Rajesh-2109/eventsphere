# EventSphere — MERN Event Management & Ticketing
Built from the supplied EventSphere SRS v1.0.

## Stack
React + Vite + React Router + Axios + page-level CSS; Node.js + Express + MongoDB/Mongoose; JWT + bcrypt; Socket.io; QRCode + html5-qrcode; Recharts; Multer local uploads.

## Implemented
Admin/Organizer/Attendee roles; secure registration/login; admin seed; blocked-user checks; event CRUD and approval; public search/filter/sort/pagination; 1–5 ticket types; atomic seat decrement; simulated paid booking; QR tickets; My Tickets; cancellation within 24 hours with inventory restoration; organizer attendee list/CSV; signed QR and manual check-in; persistent notifications; live seat/check-in events; organizer/admin dashboards; user blocking; profile/password update; validation, rate limiting, Helmet, CORS and responsive CSS.

## Setup
Requirements: Node 18+, MongoDB 6+.
1. `cd server && cp .env.example .env && npm install`
2. Configure server `.env`, then `npm run seed:admin && npm run dev`
3. In another terminal: `cd client && cp .env.example .env && npm install && npm run dev`
4. Open http://localhost:5173
Admin is created from `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` in server `.env`. Use a strong password (12+ chars).

## SRS boundaries
Payments are simulated and marked paid at booking confirmation. Automated refunds, mobile apps, seat maps, multi-currency, calendar sync and optional live Q&A are not implemented. Banner uploads are local for development; configure persistent storage/Cloudinary for production. All timestamps are UTC in MongoDB and shown in local browser time.

## Production checklist
Use strong secrets, HTTPS, exact CORS origin, MongoDB replica set/transactions, persistent image storage, payment webhooks before real payments, email provider if required, Redis Socket.io adapter for multiple instances, and run concurrency tests.
See `docs/API.md` and `docs/REQUIREMENTS_TRACEABILITY.md`. Run backend checks with `cd server && npm test`; create a production frontend bundle with `cd client && npm run build`.
