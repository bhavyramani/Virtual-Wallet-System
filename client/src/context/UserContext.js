// src/context/UserContext.js
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/router";

// Create a Context for User data
const UserContext = createContext();

// Create a custom hook to use the UserContext
export const useUser = () => {
  return useContext(UserContext);
};

// Provider component
export const UserProvider = ({ children }) => {
  const [userId, setUserId] = useState(null); // Store only the User ID
  const [loading, setLoading] = useState(true); // To track loading state (API call in progress)
  const [error, setError] = useState(null); // To handle any error from API

  const router = useRouter(); // To get the current route

  useEffect(() => {
    const fetchUserDetails = async () => {
      const token = localStorage.getItem("token"); 
      
      if (token && !["/register", "/login"].includes(router.pathname)) {
        try {
          setLoading(true);
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUserId(response.data.userId); // Assuming the response contains the user ID
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [router.pathname]); // Re-run when the route changes

  return (
    <UserContext.Provider value={{ userId, loading, error }}>
      {children}
    </UserContext.Provider>
  );
};
