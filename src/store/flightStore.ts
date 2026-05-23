import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Flight, Seat, SearchQuery, PassengerFormData, SeatClass } from "@/types";

type BookingStep = "search" | "results" | "seat" | "passenger" | "confirm";

interface FlightState {
  // Search
  searchQuery: SearchQuery;
  setSearchQuery: (query: Partial<SearchQuery>) => void;

  // Selected flight & seat
  selectedFlight: Flight | null;
  setSelectedFlight: (flight: Flight | null) => void;

  selectedSeat: Seat | null;
  setSelectedSeat: (seat: Seat | null) => void;

  // Optimistic seat selection (before DB write confirms)
  optimisticSeatId: string | null;
  setOptimisticSeatId: (id: string | null) => void;

  // Booking step
  currentStep: BookingStep;
  setCurrentStep: (step: BookingStep) => void;

  // Passenger form data
  // NOTE: passport numbers are excluded from persistence via partialize
  passengerData: PassengerFormData;
  setPassengerData: (data: Partial<PassengerFormData>) => void;

  // Reset
  resetBookingFlow: () => void;
}

const defaultSearchQuery: SearchQuery = {
  origin: "",
  destination: "",
  date: "",
  passengers: 1,
  class: "economy" as SeatClass,
};

const defaultPassengerData: PassengerFormData = {
  full_name: "",
  passport_no: "",
  nationality: "",
  dob: "",
};

export const useFlightStore = create<FlightState>()(
  persist(
    (set) => ({
      searchQuery: defaultSearchQuery,
      setSearchQuery: (query) =>
        set((state) => ({
          searchQuery: { ...state.searchQuery, ...query },
        })),

      selectedFlight: null,
      setSelectedFlight: (flight) => set({ selectedFlight: flight }),

      selectedSeat: null,
      setSelectedSeat: (seat) => set({ selectedSeat: seat }),

      optimisticSeatId: null,
      setOptimisticSeatId: (id) => set({ optimisticSeatId: id }),

      currentStep: "search",
      setCurrentStep: (step) => set({ currentStep: step }),

      passengerData: defaultPassengerData,
      setPassengerData: (data) =>
        set((state) => ({
          passengerData: { ...state.passengerData, ...data },
        })),

      resetBookingFlow: () =>
        set({
          selectedFlight: null,
          selectedSeat: null,
          optimisticSeatId: null,
          currentStep: "search",
          passengerData: defaultPassengerData,
        }),
    }),
    {
      name: "flight-store",
      storage: createJSONStorage(() => localStorage),
      // Exclude sensitive fields: passport_no is NOT persisted
      partialize: (state) => ({
        searchQuery: state.searchQuery,
        selectedFlight: state.selectedFlight,
        selectedSeat: state.selectedSeat,
        currentStep: state.currentStep,
        // Strip passport number before saving
        passengerData: {
          full_name: state.passengerData.full_name,
          nationality: state.passengerData.nationality,
          dob: state.passengerData.dob,
          // passport_no intentionally excluded
        },
      }),
    }
  )
);
