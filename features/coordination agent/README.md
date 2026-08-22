# Orbit Scheduling + Negotiation Agent

A focused prototype for campus placement interview scheduling and AI-assisted rescheduling negotiation. It does not implement matching, eligibility, JD extraction, analytics, or candidate selection.

## Run

```bash
npm install --prefix backend
npm install --prefix frontend
npm run dev --prefix backend
npm run dev --prefix frontend
```

Frontend: `http://localhost:5173`  
API: `http://localhost:4000`

The API uses seeded in-memory data so the complete Rahul/TCS demo works without MongoDB. For persistence, copy `backend/.env.example` to `backend/.env` and set `MONGODB_URI`; [backend/models.js](backend/models.js) contains the Mongoose contracts for schedules, negotiations, events, panels, rooms, and notifications.

## Demo flow

1. Open the frontend in Officer mode and select the Rahul negotiation.
2. Review the original 10:00 AM slot, the exam conflict, ranked alternatives, score, and agent reasoning.
3. Choose 2:00 PM or another alternative, then approve it. The approval is the only action that changes the schedule.
4. Switch to Student view to see Rahul's schedule and use Request reschedule. Select a reason and submit a natural-language description.
5. The officer inbox is the approval boundary; the agent only perceives, checks, plans, ranks, and recommends.

## APIs

### Scheduling

- `POST /api/events`
- `GET /api/events`
- `POST /api/schedules`
- `GET /api/schedules`
- `GET /api/schedules/:id`
- `PUT /api/schedules/:id`
- `POST /api/schedules/:id/reschedule`
- `POST /api/schedules/:id/cancel`

### Negotiation

- `POST /api/negotiations` through `POST /api/schedules/:id/reschedule` with `{ requestedBy, reason, description }`
- `GET /api/negotiations`
- `GET /api/negotiations/:id`
- `GET /api/negotiations/:id/history`
- `POST /api/negotiations/:id/analyze`
- `POST /api/negotiations/:id/approve` with optional `{ startTime, approvedBy }`
- `POST /api/negotiations/:id/reject`

### Availability and notifications

- `GET /api/availability/candidate/:id`
- `GET /api/availability/panel/:id`
- `GET /api/availability/room/:id`
- `GET /api/notifications/:id`

## Scheduling and negotiation logic

The backend treats candidate, panel, and room schedules as resources. A slot is available only when it does not overlap another non-cancelled schedule for any of those resources. The negotiation agent searches the same event day in 30-minute increments, checks every panel-room combination, and returns up to three available slots.

Scoring follows the requested priority order: same panel, same room, same day, short waiting-time change, and no effect on other candidates. Each alternative returns a score out of 100 and a structured reason. Natural language is represented by the request description in this prototype; production integration can put an LLM behind `analyzeRequest`, while the deterministic availability and scoring logic should remain authoritative.

## Integration contract

The candidate-matching module can pass selected candidates to the scheduling module without owning schedule logic:

```json
{
  "eventId": "EVT001",
  "candidates": [
    { "studentId": "STU101", "name": "Rahul", "priority": 92 }
  ]
}
```

Create schedules with the returned `studentId` values using `POST /api/schedules`. When a student needs a change, call `POST /api/schedules/:id/reschedule`; the response is a negotiation record. Consume `POST /api/negotiations/:id/approve` as the published schedule event, and let notification or analytics modules subscribe to the resulting schedule and notification records.
