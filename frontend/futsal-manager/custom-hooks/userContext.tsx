// UserContext.tsx
"use client";

import { User } from "@/lib/types";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
// Define the shape of the context value
interface UserContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
}

// Create the context
const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
  initialUser?: User | null;
}

export const UserProvider = ({ children, initialUser }: UserProviderProps) => {
  const [user, setUser] = useState<User | null>(initialUser || null);
  const [loading, setLoading] = useState<boolean>(!initialUser);

  useEffect(() => {
    // If the initial user was provided, we don't need to load from local storage
    if (initialUser) {
      setLoading(false);
      return;
    }

    // This effect runs once to check for a stored user session
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, [initialUser]);

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
