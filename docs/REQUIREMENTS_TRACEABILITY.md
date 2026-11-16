# Requirements traceability — EventSphere SRS v1.0
| SRS area | Implementation |
|---|---|
| AUTH-01..07 | `server/controllers/auth.controller.js`, auth middleware/routes, Login/Register/Profile pages |
| EVT-01..09 | event controller/model/routes, EventForm and AdminEvents pages |
| DIS-01..06 | listEvents/getEvent, Home, FilterBar, EventCard, EventDetails |
| BKG-01..08 | booking controller/model, EventDetails, MyTickets |
| QR-01..06 | QR signing utility, check-in controller, Scanner, QRModal |
| NTF-01..04 | Notification model/controller/utility, NotificationBell |
| DSH-01..05 | admin/organizer stats controllers and dashboards, AdminUsers/AdminEvents |
| Real-time | Socket config, booking/check-in/event controllers, SocketContext |
| Data/API/UI | models, docs/API.md, client pages/components and matching CSS |
| Testing/deployment | server/tests, README |

## Implementation notes
- Payment is simulated and marked paid on booking confirmation, per SRS v1.0.
- Ticket stock decrement is atomic. If booking creation fails, inventory is incremented back. For strict multi-document guarantees use MongoDB transactions on a replica set and idempotency keys.
- Editing an approved event notifies current bookers and moves it to pending re-approval to avoid unreviewed changes remaining public.
- Cancellation marks bookings cancelled and restores availability. Monetary refunds are out of scope.
- In-app notifications persist; email provider is optional and not configured.
- Local uploads are for development; use Cloudinary or durable object storage in deployment.
- The SRS optional live Q&A chat is not included because its authorization/moderation rules are unspecified.
