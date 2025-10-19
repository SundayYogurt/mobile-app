import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./context/AuthContext.jsx";
import App from "./App.jsx";
import MobileOnly from "./components/MobileOnly.jsx";
import "sweetalert2/dist/sweetalert2.min.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
      <AuthProvider>
        <MobileOnly>
          <App />
        </MobileOnly>
      </AuthProvider>
  </StrictMode>
);
