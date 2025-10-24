import { useContext } from "react";
import { AuthContext } from "../context/AuthContextDefinition";

export const useAuthContext = () => useContext(AuthContext);
