
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PetProfile from "./pages/PetProfile";
import SymptomDiary from "./pages/SymptomDiary";
import NewSymptomEntry from "./pages/NewSymptomEntry";
import EliminationDiet from "./pages/EliminationDiet";
import FoodDatabase from "./pages/FoodDatabase";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pet/:id"
              element={
                <ProtectedRoute>
                  <PetProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/symptom-diary"
              element={
                <ProtectedRoute>
                  <SymptomDiary />
                </ProtectedRoute>
              }
            />
            <Route
              path="/symptom-diary/new"
              element={
                <ProtectedRoute>
                  <NewSymptomEntry />
                </ProtectedRoute>
              }
            />
            <Route
              path="/elimination-diet"
              element={
                <ProtectedRoute>
                  <EliminationDiet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/food-database"
              element={
                <ProtectedRoute>
                  <FoodDatabase />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
