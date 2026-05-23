export type FlightStatus =
  | "scheduled"
  | "boarding"
  | "departed"
  | "arrived"
  | "cancelled"
  | "delayed";

export type SeatClass = "economy" | "business" | "first";
export type BookingStatus = "confirmed" | "rescheduled" | "cancelled";

export interface Flight {
  id: string;
  flight_no: string;
  origin: string;
  destination: string;
  departs_at: string;
  arrives_at: string;
  aircraft_type: string;
  status: FlightStatus;
  base_price: number;
  created_at?: string;
}

export interface Seat {
  id: string;
  flight_id: string;
  seat_number: string;
  class: SeatClass;
  is_available: boolean;
  extra_fee: number;
  created_at?: string;
}

export interface Booking {
  id: string;
  user_id: string;
  flight_id: string;
  seat_id: string | null;
  status: BookingStatus;
  booked_at: string;
  total_price: number;
  pnr_code: string;
  created_at?: string;
  // Joined fields
  flight?: Flight;
  seat?: Seat;
  passengers?: Passenger[];
}

export interface Passenger {
  id: string;
  booking_id: string;
  full_name: string;
  passport_no: string;
  nationality: string;
  dob: string;
  created_at?: string;
}

export interface Reschedule {
  id: string;
  booking_id: string;
  old_flight_id: string;
  new_flight_id: string;
  requested_at: string;
  fee_charged: number;
  created_at?: string;
}

// Form types
export interface SearchQuery {
  origin: string;
  destination: string;
  date: string;
  passengers: number;
  class: SeatClass;
}

export interface PassengerFormData {
  full_name: string;
  passport_no: string;
  nationality: string;
  dob: string;
}

// RPC result types
export interface ReserveSeatResult {
  success: boolean;
  booking_id?: string;
  pnr_code?: string;
  error?: string;
}

export interface CancelBookingResult {
  success: boolean;
  error?: string;
}

export interface RescheduleBookingResult {
  success: boolean;
  fee_charged?: number;
  error?: string;
}

// Database type helper
export type Database = {
  public: {
    Tables: {
      flights: { Row: Flight };
      seats: { Row: Seat };
      bookings: { Row: Booking };
      passengers: { Row: Passenger };
      reschedules: { Row: Reschedule };
    };
  };
};
