
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pet } from "@/lib/types";
import { LogOut } from "lucide-react";

const Dashboard = () => {
  const { user, signOut } = useAuth();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        const { data, error } = await supabase
          .from("pets")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throw error;
        }

        setPets(data || []);
      } catch (error: any) {
        console.error("Error fetching pets:", error.message);
        toast({
          title: "Error",
          description: "Failed to load your pets",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPets();
  }, [toast]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth");
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddPet = () => {
    // This will navigate to the onboarding flow for adding a new pet
    navigate("/");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" size="icon" onClick={handleSignOut}>
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Welcome, {user?.user_metadata.full_name || "Pet Parent"}!</h2>
        <p className="text-muted-foreground">
          Track and manage your pet's food allergies with AllerPaws.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : pets.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pets.map((pet) => (
            <div 
              key={pet.id}
              className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/pet/${pet.id}`)}
            >
              <h3 className="font-semibold text-lg">{pet.name}</h3>
              <p className="text-muted-foreground capitalize">{pet.species}</p>
              {pet.knownAllergies && pet.knownAllergies.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">Allergies: </span>
                  <span className="text-sm">{pet.knownAllergies.join(", ")}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-muted/30">
          <h3 className="text-lg font-medium mb-2">No pets yet</h3>
          <p className="text-muted-foreground mb-6">
            Start by adding your first pet to AllerPaws.
          </p>
          <Button onClick={handleAddPet}>Add Your Pet</Button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
