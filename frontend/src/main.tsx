import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { Toaster } from "@/components/ui/toast";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Toaster timeout={2400}>
      <App />
    </Toaster>
  </StrictMode>,
);
