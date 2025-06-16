
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import AuthProviderSecure from "./providers/AuthProviderSecure";
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy loading de componentes para optimizar el rendimiento
const Landing = lazy(() => import("./pages/Landing"));
const Index = lazy(() => import("./pages/Index"));
const CreateCard = lazy(() => import("./pages/CreateCard"));
const ViewCard = lazy(() => import("./pages/ViewCard"));
const EditCard = lazy(() => import("./pages/EditCard"));
const ShareCard = lazy(() => import("./pages/ShareCard"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthConfirm = lazy(() => import("./pages/AuthConfirm"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Admin = lazy(() => import("./pages/Admin"));
const Profile = lazy(() => import("./pages/Profile"));
const DemoCard = lazy(() => import("./pages/DemoCard"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));

/**
 * Configuración del cliente de React Query con políticas de reintentos mejoradas
 * y gestión de errores optimizada según las mejores prácticas
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: any) => {
        // No reintentar en errores de autenticación
        if (error?.message?.includes('permission denied') || 
            error?.message?.includes('unauthorized') ||
            error?.status === 401 ||
            error?.status === 403) {
          return false;
        }
        // Reintentar hasta 3 veces para otros errores
        return failureCount < 3;
      },
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (anteriormente cacheTime)
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // No reintentar mutaciones con errores de autenticación
        if (error?.message?.includes('permission denied') || 
            error?.message?.includes('unauthorized')) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

/**
 * Componente de carga para el lazy loading
 */
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen" role="status" aria-label="Cargando">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="sr-only">Cargando...</span>
  </div>
);

/**
 * Componente principal de la aplicación
 * Configura los proveedores principales y el sistema de rutas con lazy loading
 * Incluye Error Boundary para manejo robusto de errores
 */
const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProviderSecure>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
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
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProviderSecure>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
