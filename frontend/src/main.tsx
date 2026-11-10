import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "@/index.css";
import { App } from "@/App";
import { Toaster } from "@/components/ui/toast";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Toaster timeout={2400}>
        <App />
      </Toaster>
    </QueryClientProvider>
  </StrictMode>,
);
