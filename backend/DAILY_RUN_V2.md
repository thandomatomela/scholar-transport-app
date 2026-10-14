# Via Nova daily-run backend iteration

Database prerequisites already applied on live Supabase:
- `trips.learner_id` nullable
- `trips.service_date date`
- unique partial index `trips_driver_service_date_direction_uidx`

## New API

### Initialize a service day (idempotent)
POST `/driver/me/initialize-day`
Body: `{ "serviceDate": "2026-10-13" }`

Creates/reuses one morning and one afternoon trip. For this MVP/test iteration the learner roster is cloned from the driver's most recent morning trip. Replace this with route assignment data before production.

### Afternoon override
POST `/driver/trips/:morningTripId/learners/:learnerId/override-afternoon`

Restores the learner's afternoon stop to `pending` after a morning absence/no-show.

## Rules added
- Driver actions require the trip to be `in_progress`.
- Morning `absent` propagates to the paired afternoon stop.
- Morning `no_show` propagates to the paired afternoon stop.
- Next service day starts with fresh `pending` stops.
- Unique DB index prevents duplicate direction/driver/service-date runs.

## Test sequence
1. POST initialize-day for 2026-10-13 twice; IDs must be identical.
2. Start morning trip with existing `/driver/trips/:tripId/start`.
3. Mark one learner absent and one no-show.
4. GET afternoon manifest; those statuses must be propagated.
5. Call override-afternoon for one learner; afternoon status becomes pending.
6. Initialize 2026-10-14; all stops must be pending again.
