import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { User, Session } from "@supabase/supabase-js";
import type { Booking } from "@/types";

interface UserState {
  user: User | null;
  session: Session | null;
  cachedBookings: Booking[];

  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setCachedBookings: (bookings: Booking[]) => void;
  addCachedBooking: (booking: Booking) => void;
  updateCachedBooking: (id: string, updates: Partial<Booking>) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      cachedBookings: [],

      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setCachedBookings: (bookings) => set({ cachedBookings: bookings }),

      addCachedBooking: (booking) =>
        set((state) => ({
          cachedBookings: [booking, ...state.cachedBookings],
        })),

      updateCachedBooking: (id, updates) =>
        set((state) => ({
          cachedBookings: state.cachedBookings.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),

      reset: () =>
        set({
          user: null,
          session: null,
          cachedBookings: [],
        }),
    }),
    {
      name: "user-store",
      storage: createJSONStorage(() => localStorage),
      // Only persist session token, not full user object or booking details
      partialize: (state) => ({
        session: state.session
          ? { access_token: state.session.access_token }
          : null,
        cachedBookings: state.cachedBookings,
      }),
    }
  )
);
