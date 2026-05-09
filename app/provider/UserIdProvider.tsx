"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/database/supabase";
import { Logout } from "../api/auth/verification/authUtils";

const userContext = createContext({ userId: "test", email: "test" });

export function useUserContext() {
  return useContext(userContext);
}

export default function UserIdProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const token = localStorage.getItem("supabase.auth.token");
      if (!token) {
        setUserId("");
        setEmail("");
        return;
      }

      try {
        // Validate token with server
        const validateResponse = await fetch("/api/auth/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!validateResponse.ok) {
          // Token is invalid or expired, logout user
          console.warn("Session invalid or expired, logging out...");
          await Logout();
          return;
        }

        // Token is valid, get user data
        const { data } = await supabase.auth.getUser();
        const userId = data.user?.id;
        const email = data.user?.email;
        setUserId(userId ?? "");
        setEmail(email ?? "");

        // Initialize activity tracking
        if (!localStorage.getItem("lastActivityTime")) {
          localStorage.setItem("lastActivityTime", String(Date.now()));
        }
      } catch (error) {
        console.error("Error validating user session:", error);
        // On network error, try to get user anyway
        const { data } = await supabase.auth.getUser();
        const userId = data.user?.id;
        const email = data.user?.email;
        setUserId(userId ?? "");
        setEmail(email ?? "");
      }
    };
    getUser();
  }, []);

  return (
    <userContext.Provider value={{ userId, email }}>
      {children}
    </userContext.Provider>
  );
}
