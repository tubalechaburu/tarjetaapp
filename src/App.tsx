
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import CreateCard from "./pages/CreateCard";
import ViewCard from "./pages/ViewCard";
import EditCard from "./pages/EditCard";
import ShareCard from "./pages/ShareCard";
import Auth from "./pages/Auth";
import AuthConfirm from "./pages/AuthConfirm";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import DemoCard from "./pages/DemoCard";
import AuthProviderSecure from "./providers/AuthProviderSecure";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('permission denied') || error?.message?.includes('unauthorized')) {
          return false;
        }
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProviderSecure>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/landing" element={<Landing />} />
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/create" element={<CreateCard />} />
            <Route path="/card/:id" element={<ViewCard />} />
            <Route path="/edit/:id" element={<EditCard />} />
            <Route path="/share/:id" element={<ShareCard />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/confirm" element={<AuthConfirm />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/demo" element={<DemoCard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProviderSecure>
  </QueryClientProvider>
);

export default App;
