BEGIN;

-- Support the explicit driver pickup workflow:
-- pending -> en_route -> arrived -> picked_up/no_show

ALTER TABLE public.trip_stops
DROP CONSTRAINT IF EXISTS trip_stops_status_check;

ALTER TABLE public.trip_stops
ADD CONSTRAINT trip_stops_status_check
CHECK (
  status = ANY (
    ARRAY[
      'pending'::text,
      'en_route'::text,
      'arrived'::text,
      'picked_up'::text,
      'absent'::text,
      'no_show'::text,
      'dropped_off'::text
    ]
  )
);

-- A driver may only be actively travelling
-- to one learner within a trip at a time.
CREATE UNIQUE INDEX IF NOT EXISTS
trip_stops_one_en_route_per_trip_uidx
ON public.trip_stops (trip_id)
WHERE status = 'en_route';

COMMIT;