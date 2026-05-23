-- ============================================================
-- SEED DATA — 8 flights across 4 routes
-- ============================================================

-- Clean slate for seed runs
TRUNCATE public.seats, public.flights RESTART IDENTITY CASCADE;

-- Helper function to generate seat maps
CREATE OR REPLACE FUNCTION seed_seats_for_flight(p_flight_id UUID)
RETURNS VOID AS $$
DECLARE
  row_num INT;
  col CHAR;
  seat_class TEXT;
  extra_fee NUMERIC;
BEGIN
  -- First class: rows 1-3 (A-D, 4 seats per row)
  FOR row_num IN 1..3 LOOP
    FOREACH col IN ARRAY ARRAY['A','B','C','D'] LOOP
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, row_num || col, 'first', TRUE, 150.00);
    END LOOP;
  END LOOP;

  -- Business class: rows 4-8 (A-F, 6 seats per row)
  FOR row_num IN 4..8 LOOP
    FOREACH col IN ARRAY ARRAY['A','B','C','D','E','F'] LOOP
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (p_flight_id, row_num || col, 'business', TRUE, 75.00);
    END LOOP;
  END LOOP;

  -- Economy class: rows 9-33 (A-F, 6 seats per row)
  FOR row_num IN 9..33 LOOP
    FOREACH col IN ARRAY ARRAY['A','B','C','D','E','F'] LOOP
      INSERT INTO public.seats (flight_id, seat_number, class, is_available, extra_fee)
      VALUES (
        p_flight_id,
        row_num || col,
        'economy',
        TRUE,
        CASE WHEN col IN ('A','F') THEN 15.00 ELSE 0.00 END  -- window seats cost more
      );
    END LOOP;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- INSERT FLIGHTS (8 flights, 4 routes)
-- ============================================================

-- Route 1: DEL → BOM (Delhi → Mumbai) — 2 flights
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  ('SA101', 'Delhi (DEL)', 'Mumbai (BOM)',
   NOW() + INTERVAL '2 days 08:00',
   NOW() + INTERVAL '2 days 10:00',
   'Airbus A320', 'scheduled', 4999.00),

  ('SA102', 'Delhi (DEL)', 'Mumbai (BOM)',
   NOW() + INTERVAL '3 days 14:30',
   NOW() + INTERVAL '3 days 16:30',
   'Boeing 737', 'scheduled', 5499.00);

-- Route 2: BOM → BLR (Mumbai → Bangalore) — 2 flights
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  ('SA201', 'Mumbai (BOM)', 'Bangalore (BLR)',
   NOW() + INTERVAL '2 days 11:00',
   NOW() + INTERVAL '2 days 12:30',
   'Airbus A320', 'scheduled', 3499.00),

  ('SA202', 'Mumbai (BOM)', 'Bangalore (BLR)',
   NOW() + INTERVAL '4 days 07:45',
   NOW() + INTERVAL '4 days 09:15',
   'Boeing 737', 'scheduled', 3999.00);

-- Route 3: BLR → HYD (Bangalore → Hyderabad) — 2 flights
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  ('SA301', 'Bangalore (BLR)', 'Hyderabad (HYD)',
   NOW() + INTERVAL '1 day 09:00',
   NOW() + INTERVAL '1 day 10:10',
   'ATR 72', 'scheduled', 2299.00),

  ('SA302', 'Bangalore (BLR)', 'Hyderabad (HYD)',
   NOW() + INTERVAL '5 days 16:00',
   NOW() + INTERVAL '5 days 17:10',
   'Airbus A320', 'scheduled', 2799.00);

-- Route 4: HYD → DEL (Hyderabad → Delhi) — 2 flights
INSERT INTO public.flights (flight_no, origin, destination, departs_at, arrives_at, aircraft_type, status, base_price)
VALUES
  ('SA401', 'Hyderabad (HYD)', 'Delhi (DEL)',
   NOW() + INTERVAL '2 days 06:30',
   NOW() + INTERVAL '2 days 09:00',
   'Boeing 737', 'scheduled', 5999.00),

  ('SA402', 'Hyderabad (HYD)', 'Delhi (DEL)',
   NOW() + INTERVAL '6 days 19:00',
   NOW() + INTERVAL '6 days 21:30',
   'Airbus A321', 'scheduled', 6499.00);

-- ============================================================
-- GENERATE SEAT MAPS for all 8 flights
-- ============================================================
DO $$
DECLARE
  f public.flights%ROWTYPE;
BEGIN
  FOR f IN SELECT * FROM public.flights LOOP
    PERFORM seed_seats_for_flight(f.id);
  END LOOP;
END;
$$;

-- Mark a few seats as unavailable to simulate existing bookings
UPDATE public.seats
SET is_available = FALSE
WHERE seat_number IN ('12A','12C','15F','21B','7A','7B')
  AND flight_id IN (SELECT id FROM public.flights WHERE flight_no IN ('SA101','SA201','SA301'));

-- Clean up helper function
DROP FUNCTION IF EXISTS seed_seats_for_flight(UUID);

-- ============================================================
-- TEST USER (credentials to share in README)
-- NOTE: Run this AFTER setting up Supabase Auth in the dashboard
-- or use the Supabase CLI: supabase auth create-user
-- Test email: test@flightapp.dev | Password: Test@12345
-- ============================================================
