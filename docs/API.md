# EventSphere API
Base URL: `/api/v1`; protected requests use `Authorization: Bearer <JWT>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/auth/register`, `/auth/login` | Public | Register / login |
| GET | `/auth/me` | Any | Current user |
| PUT | `/users/me`, `/users/me/password` | Any | Profile / password |
| GET | `/events`, `/events/:id` | Public | Discovery / details |
| POST | `/events` | Organizer | Create pending event |
| PUT | `/events/:id` | Owner Organizer | Update |
| PATCH | `/events/:id/cancel` | Owner Organizer | Cancel event/bookings |
| DELETE | `/events/:id` | Owner Organizer | Delete only with no bookings |
| GET | `/events/mine` | Organizer | Own events |
| POST | `/bookings` | Logged in | Atomic reservation |
| GET | `/bookings/mine`, `/bookings/:id` | Owner | My tickets / detail |
| PATCH | `/bookings/:id/cancel` | Owner | Cancel and restore inventory |
| GET | `/events/:id/bookings`, `/export` | Owner Organizer/Admin | Attendees / CSV |
| POST | `/checkin/scan`, `/checkin/manual` | Organizer/Admin | QR/manual check-in |
| GET | `/notifications`; PATCH `/notifications/read-all` | Any | Notifications |
| GET | `/organizer/stats` | Organizer | Organizer analytics |
| GET | `/admin/stats`, `/admin/users` | Admin | Admin analytics/users |
| GET | `/admin/events`, `/admin/events/pending` | Admin | Moderation queue |
| PATCH | `/admin/events/:id/approve`, `/reject` | Admin | Moderate event |
| PATCH | `/admin/users/:id/block` | Admin | Block/unblock |
| DELETE | `/admin/events/:id` | Admin | Remove event with no bookings |

Socket events: client `event:join`, `event:leave`; server `seats:update`, `checkin:update`, `notification:new`, `event:status`, `event:published`. Rooms: `event:<id>`, `user:<id>`.
