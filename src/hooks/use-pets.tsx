import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Pet } from "@/lib/types";

export function usePets() {
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [loading, setLoading] = useState(true);
  const { id: petId } = useParams<{ id?: string }>();
  const { toast } = useToast();

  useEffect(() => {
    const fetchPets = async () => {
      try {
        // Fetch pets
        const { data: petsData, error: petsError } = await supabase
          .from("pets")
          .select("*")
          .order("created_at", { ascending: false });

        if (petsError) {
          throw petsError;
        }

        // For each pet, fetch its allergies
        const petsWithAllergies = await Promise.all(
          (petsData || []).map(async (pet) => {
            const { data: allergiesData, error: allergiesError } = await supabase
              .from("allergies")
              .select("name")
              .eq("pet_id", pet.id);
              
            if (allergiesError) {
              console.error("Error fetching allergies:", allergiesError);
              return {
                ...pet,
                knownAllergies: [],
              } as Pet;
            }

            // Transform the pet data to match our Pet type
            return {
              id: pet.id,
              name: pet.name,
              species: pet.species as "dog" | "cat" | "other",
              breed: pet.breed || undefined,
              age: pet.age || undefined,
              weight: pet.weight || undefined,
              knownAllergies: allergiesData?.map((allergy) => allergy.name) || [],
              imageUrl: pet.image_url || undefined,
            } as Pet;
          })
        );

        setPets(petsWithAllergies);
        
        // If a pet ID is provided in the URL, set it as the selected pet
        if (petId) {
          const selectedPet = petsWithAllergies.find(pet => pet.id === petId);
          if (selectedPet) {
            setSelectedPet(selectedPet);
          } else {
            console.error("Pet not found with ID:", petId);
            toast({
              title: "Pet Not Found",
              description: "The selected pet could not be found.",
              variant: "destructive",
            });
          }
        }
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
  }, [toast, petId]);

  const clearSelectedPet = () => {
    setSelectedPet(null);
  };

  const deletePet = async (petId: string) => {
    try {
      // First delete allergies associated with the pet
      const { error: allergiesError } = await supabase
        .from("allergies")
        .delete()
        .eq("pet_id", petId);
      
      if (allergiesError) {
        throw allergiesError;
      }
      
      // Then delete the pet
      const { error: petError } = await supabase
        .from("pets")
        .delete()
        .eq("id", petId);
      
      if (petError) {
        throw petError;
      }
      
      // Update local state
      setPets(pets.filter(pet => pet.id !== petId));
      
      toast({
        title: "Success",
        description: "Pet has been deleted successfully",
      });
      
    } catch (error: any) {
      console.error("Error deleting pet:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete pet",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    pets,
    loading,
    selectedPet,
    setSelectedPet,
    clearSelectedPet,
    deletePet
  };
}
