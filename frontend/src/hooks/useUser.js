import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
// 1. We must now import useAuth from the hook file, not the context file
import { useAuth } from "../hooks/useAuth"; 

const authErrorMessages = [
        'Not authorized, token failed',
        'Failed to authenticate token.',
        'No user found with this token'
      ];

const fetchUserData = async (token) => {
  // If there's no token, don't even try to fetch
  if (!token) return null;

  try {
    const res = await fetch(`${import.meta.env.VITE_BE_URL}/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization : `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ message: res.statusText }));
      // We will check for this specific error message
      throw new Error(errorData.message || "Failed to authenticate token.");
    }

    const response = await res.json();
    return response.data; // Return the user data object  

  } catch (error) {
    console.error(error.message);
    // Re-throw the error for TanStack Query to handle
    throw error;
  }
};

export function useUser() {
  const { token, logout } = useAuth(); 

  const query = useQuery({
    queryKey: ["user"],
    
    queryFn: () => fetchUserData(token),
    enabled: !!token,
    
    retry: (failureCount, error) => {     
      if (authErrorMessages.includes(error.message)) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // 4. NEW: Use useEffect to handle errors (React Query v5 pattern)
  useEffect(() => {
    if (query.error) {
      console.log("Error detected:", query.error.message);
            
      if (authErrorMessages.includes(query.error.message)) {
        console.error("Invalid token detected. Logging out...");
        logout();
      }
    }
  }, [query.error, logout]);

  return query;
}