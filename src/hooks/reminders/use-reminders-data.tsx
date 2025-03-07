
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Pet, Reminder } from "@/lib/types";

// Define a simplified Pet type for what we need in this component
interface SimplePet {
  id: string;
  name: string;
}

export const useRemindersData = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [pets, setPets] = useState<SimplePet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch pets
      const { data: petsData, error: petsError } = await supabase
        .from("pets")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");
        
      if (petsError) throw petsError;
      
      setPets(petsData || []);
      
      // Fetch reminders with pet names
      const { data: remindersData, error: remindersError } = await supabase
        .from("reminders")
        .select(`
          id,
          title,
          description,
          time,
          days,
          pet_id,
          active,
          pets:pet_id (name)
        `)
        .eq("user_id", user.id)
        .order("time");
        
      if (remindersError) throw remindersError;
      
      // Map the database fields to our Reminder type
      const formattedReminders: Reminder[] = remindersData.map(reminder => ({
        id: reminder.id,
        title: reminder.title,
        description: reminder.description,
        time: reminder.time,
        days: reminder.days,
        petId: reminder.pet_id,
        petName: reminder.pets?.name,
        active: reminder.active,
      }));
      
      setReminders(formattedReminders);
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      toast({
        title: "Error",
        description: "Failed to load reminders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  return {
    reminders,
    pets,
    loading,
    fetchData,
    setReminders
  };
};
