/**
 * App.tsx
 * Main application component with routing and providers.
 * Sets up wallet context, routing, and UI providers.
 */

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WalletProvider } from "@/context/WalletContext";

// Page imports
import { Landing } from "@/pages/Landing";
import { Dashboard } from "@/pages/Dashboard";
import { PropertyRegistry } from "@/pages/PropertyRegistry";
import { TransferProperty } from "@/pages/TransferProperty";
import { ReceiptPage } from "@/pages/ReceiptPage";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            
            {/* Protected routes (require wallet connection) */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/register" element={<PropertyRegistry />} />
            <Route path="/transfer" element={<TransferProperty />} />
            <Route path="/receipt" element={<ReceiptPage />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
