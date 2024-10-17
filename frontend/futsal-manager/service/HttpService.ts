import { Stadium, User, Reservation, AddReservation } from "@/lib/types";
import axios from "axios";

const API_BASE_URL = "https://cristhianrichard94.pythonanywhere.com"; // Adjust this to your backend URL

export const HttpService = {
  // Stadium operations
  getStadiums: async (): Promise<Stadium[]> => {
    const response = await axios.get(`${API_BASE_URL}/stadiums`);
    return response.data;
  },

  addStadium: async (stadium: Omit<Stadium, "stadiumId">): Promise<Stadium> => {
    const response = await axios.post(`${API_BASE_URL}/stadiums`, stadium);
    return response.data;
  },

  updateStadium: async (stadium: Stadium): Promise<Stadium> => {
    const response = await axios.put(`${API_BASE_URL}/stadiums`, stadium);
    return response.data;
  },

  deleteStadium: async (stadiumId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/stadiums/${stadiumId}`);
  },

  // User operations
  getUsers: async (): Promise<User[]> => {
    const response = await axios.get(`${API_BASE_URL}/users`);
    return response.data;
  },

  addUser: async (user: Omit<User, "userId">): Promise<User> => {
    const response = await axios.post(`${API_BASE_URL}/register`, user);
    return response.data;
  },

  updateUser: async (user: User): Promise<User> => {
    const response = await axios.put(`${API_BASE_URL}/users`, user);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/users/${userId}`);
  },

  // Reservation operations
  getReservations: async (): Promise<Reservation[]> => {
    const response = await axios.get(`${API_BASE_URL}/reservations`);
    return response.data;
  },

  addReservation: async (reservation: AddReservation): Promise<Reservation> => {
    const response = await axios.post(
      `${API_BASE_URL}/reservations`,
      reservation
    );
    return response.data;
  },

  updateReservation: async (reservation: Reservation): Promise<Reservation> => {
    const response = await axios.put(
      `${API_BASE_URL}/reservations`,
      reservation
    );
    return response.data;
  },

  deleteReservation: async (reservationId: number): Promise<void> => {
    await axios.delete(`${API_BASE_URL}/reservations/${reservationId}`);
  },
};
