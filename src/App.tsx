import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import CarDetailPage from "./pages/CarDetailPage";
import AdminPanel from './pages/AdminPanel';

const queryClient = new QueryClient();

const urlParams = new URLSearchParams(window.location.search);
const isEmbedded = urlParams.get("source") === "notOnGHL";

const App = () => (

  
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
    <Toaster />

      <Router>
        
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/car/:carId" element={<CarDetailPage />} />
          <Route path="/admin" element={<AdminPanel />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
      <Sonner />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
