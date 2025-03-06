
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import ManagePets from './pages/ManagePets';
import AddPet from './pages/AddPet';
import EditPet from './pages/EditPet';
import FoodDatabase from './pages/FoodDatabase';
import SymptomDiary from './pages/SymptomDiary';
import AddSymptomEntry from './pages/AddSymptomEntry';
import EditSymptomEntry from './pages/EditSymptomEntry';
import EliminationDiet from './pages/EliminationDiet';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import Pricing from './pages/Pricing';
import Reminders from './pages/Reminders';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { useToast } from './hooks/use-toast';
import { APP_NAME } from './lib/constants';
import HeroSection from './components/home/welcome/HeroSection';
import FeaturesSection from './components/home/welcome/FeaturesSection';
import TestimonialsSection from './components/home/welcome/TestimonialsSection';
import LandingFooter from './components/home/welcome/LandingFooter';
import EnhancedDashboard from './components/dashboard/EnhancedDashboard';

// Create a stylish, mobile-friendly landing page using the components
const OriginalLanding = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/auth');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-background to-background/95 overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none z-0"></div>
      
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/ac2e5c6c-4c6f-43e5-826f-709eba1f1a9d.png" 
              alt={APP_NAME} 
              className="w-8 h-8 md:w-10 md:h-10"
            />
            <span className="font-bold text-lg md:text-xl">{APP_NAME}</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => navigate('/auth')} 
              variant="ghost" 
              size="sm" 
              className="hidden sm:inline-flex"
            >
              Sign In
            </Button>
            <Button 
              onClick={handleGetStarted} 
              size="sm" 
              className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 transition-all"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 overflow-auto">
        <div className="relative">
          <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-primary/5 to-transparent -z-10"></div>
          <div className="absolute bottom-0 right-0 w-72 h-72 bg-accent/10 rounded-full filter blur-3xl -z-10"></div>
          <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full filter blur-3xl -z-10"></div>
          
          <HeroSection onGetStarted={handleGetStarted} />
          <FeaturesSection />
          <TestimonialsSection />
        </div>
      </main>
      
      <LandingFooter />
    </div>
  );
};

// Need to add the import for useNavigate and Button
import { useNavigate } from 'react-router-dom';
import { Button } from './components/ui/button';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Unregister any existing service workers to prevent caching issues
  useEffect(() => {
    const cleanupServiceWorker = async () => {
      try {
        // Unregister any existing service workers to prevent caching issues
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.log('Service worker unregistered to prevent caching issues');
          }
        }
      } catch (error) {
        console.error('Service worker cleanup error:', error);
      } finally {
        console.log("App initialized, service worker cleanup complete");
        setIsLoading(false);
      }
    };

    cleanupServiceWorker();

    // Add error handling for uncaught errors
    const handleUnhandledError = (event) => {
      console.error('Unhandled error:', event.error || event.message);
      toast({
        title: "Something went wrong",
        description: "The application encountered an error. Please refresh the page.",
        variant: "destructive",
      });
    };

    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledError);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledError);
    };
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <LoadingSpinner className="h-12 w-12" />
          <p className="text-lg font-medium">Starting AllerPaws...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <ThemeProvider defaultTheme="light" storageKey="allerpaws-theme">
        <BrowserRouter>
          <AuthProvider>
            <SubscriptionProvider>
              <Toaster />
              <Routes>
                <Route path="/" element={<ProtectedRoute><EnhancedDashboard /></ProtectedRoute>} />
                <Route path="/landing" element={<OriginalLanding />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/dashboard" element={<Navigate to="/" replace />} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/pets" element={<ProtectedRoute><ManagePets /></ProtectedRoute>} />
                <Route path="/add-pet" element={<ProtectedRoute><AddPet /></ProtectedRoute>} />
                <Route path="/edit-pet/:id" element={<ProtectedRoute><EditPet /></ProtectedRoute>} />
                <Route path="/pet/:id" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/food-database" element={<ProtectedRoute><FoodDatabase /></ProtectedRoute>} />
                <Route path="/symptom-diary" element={<ProtectedRoute><SymptomDiary /></ProtectedRoute>} />
                <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
                <Route path="/add-symptom" element={<ProtectedRoute><AddSymptomEntry /></ProtectedRoute>} />
                <Route path="/edit-symptom/:id" element={<ProtectedRoute><EditSymptomEntry /></ProtectedRoute>} />
                <Route path="/elimination-diet" element={<ProtectedRoute><EliminationDiet /></ProtectedRoute>} />
                <Route path="/pricing" element={<Pricing />} />
              </Routes>
            </SubscriptionProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </main>
  );
}

export default App;
