import React from "react";
import { useAuthContext } from "../context/AuthContext";

export default function RequireAuth({ children, Fallback = null }) {
  const { user } = useAuthContext();
  if (!user) {
    return Fallback ? <Fallback /> : null;
  }
  return children;
}

