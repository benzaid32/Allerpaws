
import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading, savePetData } = useAuth();
  const location = useLocation();
  
  // Check if there's temporary pet data stored and try to save it
  useEffect(() => {
    if (user) {
      const tempPetData = localStorage.getItem('temporaryPetData');
      if (tempPetData) {
        try {
          console.log("Protected route: Found temporary pet data to process");
          const petData = JSON.parse(tempPetData);
          savePetData(petData)
            .then(success => {
              if (success) {
                console.log("Protected route: Successfully saved pet data");
                localStorage.removeItem('temporaryPetData');
              }
            })
            .catch(error => {
              console.error("Protected route: Error saving pet data:", error);
            });
        } catch (error) {
          console.error("Protected route: Error parsing pet data:", error);
          localStorage.removeItem('temporaryPetData');
        }
      }
    }
  }, [user, savePetData]);
  
  // Show minimal loading state while checking auth - much shorter
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // Immediately redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Render the protected content if authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
