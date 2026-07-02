import axios from "axios";

import {
  Availability,
  Field,
  FieldInput,
  Reservation,
  ReservationInput,
  ReservationWithCheckout,
  User,
  UserSyncInput,
  Venue,
  VenueInput,
} from "@/lib/types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Attaches the short-lived backend JWT (minted by /api/token) to every
// outgoing request, when running in the browser and a NextAuth session
// exists. Server components/route handlers that need auth should call
// HttpService methods with an explicit token via the `token` param instead.
apiClient.interceptors.request.use(async (config) => {
  if (typeof window !== "undefined") {
    try {
      const res = await fetch("/api/token");
      if (res.ok) {
        const { token } = await res.json();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    } catch {
      // No session / not authenticated — request proceeds unauthenticated.
    }
  }
  return config;
});

function authHeaders(token?: string) {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : undefined;
}

export const HttpService = {
  // Auth
  syncUser: async (payload: UserSyncInput): Promise<User> => {
    const response = await apiClient.post(`/auth/sync`, payload);
    return response.data;
  },

  // Venues
  getVenues: async (adminUserId?: number): Promise<Venue[]> => {
    const response = await apiClient.get(`/venues`, {
      params: adminUserId ? { admin_user_id: adminUserId } : undefined,
    });
    return response.data;
  },

  getVenue: async (venueId: number | string): Promise<Venue> => {
    const response = await apiClient.get(`/venues/${venueId}`);
    return response.data;
  },

  createVenue: async (payload: VenueInput): Promise<Venue> => {
    const response = await apiClient.post(`/venues`, payload);
    return response.data;
  },

  updateVenue: async (venueId: number | string, payload: VenueInput): Promise<Venue> => {
    const response = await apiClient.put(`/venues/${venueId}`, payload);
    return response.data;
  },

  deleteVenue: async (venueId: number | string): Promise<void> => {
    await apiClient.delete(`/venues/${venueId}`);
  },

  // Fields
  getVenueFields: async (venueId: number | string): Promise<Field[]> => {
    const response = await apiClient.get(`/venues/${venueId}/fields`);
    return response.data;
  },

  createVenueField: async (venueId: number | string, payload: FieldInput): Promise<Field> => {
    const response = await apiClient.post(`/venues/${venueId}/fields`, payload);
    return response.data;
  },

  getField: async (fieldId: number | string): Promise<Field> => {
    const response = await apiClient.get(`/fields/${fieldId}`);
    return response.data;
  },

  updateField: async (fieldId: number | string, payload: FieldInput): Promise<Field> => {
    const response = await apiClient.put(`/fields/${fieldId}`, payload);
    return response.data;
  },

  deleteField: async (fieldId: number | string): Promise<void> => {
    await apiClient.delete(`/fields/${fieldId}`);
  },

  getFieldAvailability: async (fieldId: number | string, date: string): Promise<Availability[]> => {
    const response = await apiClient.get(`/fields/${fieldId}/availability`, {
      params: { date },
    });
    return response.data;
  },

  // Reservations
  getReservations: async (venueId?: number | string): Promise<Reservation[]> => {
    const response = await apiClient.get(`/reservations`, {
      params: venueId ? { venue_id: venueId } : undefined,
    });
    return response.data;
  },

  createReservation: async (payload: ReservationInput): Promise<ReservationWithCheckout> => {
    const response = await apiClient.post(`/reservations`, payload);
    return response.data;
  },

  getReservation: async (reservationId: number | string): Promise<Reservation> => {
    const response = await apiClient.get(`/reservations/${reservationId}`);
    return response.data;
  },

  cancelReservation: async (reservationId: number | string): Promise<Reservation> => {
    const response = await apiClient.delete(`/reservations/${reservationId}`);
    return response.data;
  },
};
