-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reschedules ENABLE ROW LEVEL SECURITY;

-- ---- FLIGHTS: Anyone can read flights (for searching) ----
CREATE POLICY "flights_select_all"
  ON public.flights FOR SELECT
  USING (TRUE);

-- ---- SEATS: Anyone can read seats (to see availability) ----
CREATE POLICY "seats_select_all"
  ON public.seats FOR SELECT
  USING (TRUE);

-- ---- BOOKINGS: Users can only see & manage their own bookings ----
CREATE POLICY "bookings_select_own"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "bookings_insert_own"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update_own"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ---- PASSENGERS: Users can only access their own passenger records ----
CREATE POLICY "passengers_select_own"
  ON public.passengers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "passengers_insert_own"
  ON public.passengers FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.user_id = auth.uid()
    )
  );

-- ---- RESCHEDULES: Users can only see/create their own reschedules ----
CREATE POLICY "reschedules_select_own"
  ON public.reschedules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "reschedules_insert_own"
  ON public.reschedules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.bookings b
      WHERE b.id = booking_id AND b.user_id = auth.uid()
    )
  );
