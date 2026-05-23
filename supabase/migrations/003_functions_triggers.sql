-- ============================================================
-- RPC: SEAT RESERVATION (prevents double-booking race conditions)
-- Uses advisory lock + transaction to ensure atomicity
-- ============================================================
CREATE OR REPLACE FUNCTION public.reserve_seat(
  p_flight_id   UUID,
  p_seat_id     UUID,
  p_user_id     UUID,
  p_total_price NUMERIC,
  p_pnr_code    TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_seat         public.seats%ROWTYPE;
  v_booking_id   UUID;
  v_result       JSON;
BEGIN
  -- Acquire advisory lock on the seat to prevent race conditions
  PERFORM pg_advisory_xact_lock(hashtext(p_seat_id::TEXT));

  -- Check the seat still belongs to the right flight and is available
  SELECT * INTO v_seat
  FROM public.seats
  WHERE id = p_seat_id
    AND flight_id = p_flight_id
    AND is_available = TRUE
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Seat is no longer available. Please select another seat.'
    );
  END IF;

  -- Mark seat as unavailable
  UPDATE public.seats
  SET is_available = FALSE
  WHERE id = p_seat_id;

  -- Create the booking
  INSERT INTO public.bookings (user_id, flight_id, seat_id, status, total_price, pnr_code)
  VALUES (p_user_id, p_flight_id, p_seat_id, 'confirmed', p_total_price, p_pnr_code)
  RETURNING id INTO v_booking_id;

  RETURN json_build_object(
    'success', TRUE,
    'booking_id', v_booking_id,
    'pnr_code', p_pnr_code
  );
END;
$$;

-- ============================================================
-- RPC: CANCEL BOOKING (atomic cancellation + seat release)
-- ============================================================
CREATE OR REPLACE FUNCTION public.cancel_booking(
  p_booking_id UUID,
  p_user_id    UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking     public.bookings%ROWTYPE;
  v_flight      public.flights%ROWTYPE;
  v_depart_time TIMESTAMPTZ;
BEGIN
  -- Fetch booking (verify ownership)
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id AND user_id = p_user_id AND status != 'cancelled'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'error', 'Booking not found or already cancelled.');
  END IF;

  -- Fetch associated flight departure time
  SELECT departs_at INTO v_depart_time
  FROM public.flights
  WHERE id = v_booking.flight_id;

  -- Enforce: cannot cancel within 2 hours of departure
  IF v_depart_time - NOW() < INTERVAL '2 hours' THEN
    RETURN json_build_object(
      'success', FALSE,
      'error', 'Cancellations are not allowed within 2 hours of departure.'
    );
  END IF;

  -- Cancel the booking
  UPDATE public.bookings
  SET status = 'cancelled'
  WHERE id = p_booking_id;

  -- Release the seat
  IF v_booking.seat_id IS NOT NULL THEN
    UPDATE public.seats
    SET is_available = TRUE
    WHERE id = v_booking.seat_id;
  END IF;

  RETURN json_build_object('success', TRUE);
END;
$$;

-- ============================================================
-- RPC: RESCHEDULE BOOKING
-- ============================================================
CREATE OR REPLACE FUNCTION public.reschedule_booking(
  p_booking_id     UUID,
  p_user_id        UUID,
  p_new_flight_id  UUID,
  p_new_seat_id    UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_booking       public.bookings%ROWTYPE;
  v_old_flight    public.flights%ROWTYPE;
  v_new_flight    public.flights%ROWTYPE;
  v_new_seat      public.seats%ROWTYPE;
  v_fee           NUMERIC := 0;
BEGIN
  -- Lock booking
  SELECT * INTO v_booking
  FROM public.bookings
  WHERE id = p_booking_id AND user_id = p_user_id AND status = 'confirmed'
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'error', 'Booking not found or not reschedulable.');
  END IF;

  -- Fetch old and new flights
  SELECT * INTO v_old_flight FROM public.flights WHERE id = v_booking.flight_id;
  SELECT * INTO v_new_flight FROM public.flights WHERE id = p_new_flight_id;

  -- Compute fee if new flight is more expensive
  IF v_new_flight.base_price > v_old_flight.base_price THEN
    v_fee := v_new_flight.base_price - v_old_flight.base_price;
  END IF;

  -- Lock and verify new seat
  PERFORM pg_advisory_xact_lock(hashtext(p_new_seat_id::TEXT));
  SELECT * INTO v_new_seat
  FROM public.seats
  WHERE id = p_new_seat_id AND flight_id = p_new_flight_id AND is_available = TRUE
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('success', FALSE, 'error', 'Selected seat is no longer available.');
  END IF;

  -- Release old seat
  IF v_booking.seat_id IS NOT NULL THEN
    UPDATE public.seats SET is_available = TRUE WHERE id = v_booking.seat_id;
  END IF;

  -- Reserve new seat
  UPDATE public.seats SET is_available = FALSE WHERE id = p_new_seat_id;

  -- Update booking
  UPDATE public.bookings
  SET flight_id = p_new_flight_id,
      seat_id   = p_new_seat_id,
      status    = 'rescheduled',
      total_price = v_booking.total_price + v_fee
  WHERE id = p_booking_id;

  -- Record reschedule
  INSERT INTO public.reschedules (booking_id, old_flight_id, new_flight_id, fee_charged)
  VALUES (p_booking_id, v_booking.flight_id, p_new_flight_id, v_fee);

  RETURN json_build_object('success', TRUE, 'fee_charged', v_fee);
END;
$$;

-- ============================================================
-- DB-LEVEL TRIGGER: Block cancellations within 2 hours of departure
-- (Belt-and-suspenders enforcement alongside the RPC)
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_cancellation_window()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_departs_at TIMESTAMPTZ;
BEGIN
  -- Only enforce when status is being set to 'cancelled'
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    SELECT departs_at INTO v_departs_at
    FROM public.flights
    WHERE id = NEW.flight_id;

    IF v_departs_at - NOW() < INTERVAL '2 hours' THEN
      RAISE EXCEPTION 'Cannot cancel booking within 2 hours of departure (flight departs at %)', v_departs_at;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER enforce_cancellation_window
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.check_cancellation_window();

-- Grant execute on RPCs to authenticated users
GRANT EXECUTE ON FUNCTION public.reserve_seat TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_booking TO authenticated;
GRANT EXECUTE ON FUNCTION public.reschedule_booking TO authenticated;
