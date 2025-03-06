
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { generateId } from "@/lib/helpers";
import { Pet } from "@/lib/types";
import { cn, storeTemporaryPetData, clearTemporaryPetData } from "@/lib/utils";
import { ONBOARDING_STEPS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Import Onboarding components
import OnboardingLayout from "./onboarding/OnboardingLayout";
import OnboardingHeader from "./onboarding/OnboardingHeader";
import OnboardingStepIndicator from "./onboarding/OnboardingStepIndicator";
import OnboardingFooter from "./onboarding/OnboardingFooter";

// Import Step components
import WelcomeStep from "./onboarding/steps/WelcomeStep";
import PetInfoStep from "./onboarding/steps/PetInfoStep";
import AllergiesStep from "./onboarding/steps/AllergiesStep";
import SymptomsStep from "./onboarding/steps/SymptomsStep";
import FoodDatabaseStep from "./onboarding/steps/FoodDatabaseStep";
import RegisterStep from "./onboarding/steps/RegisterStep";

// Extend the ONBOARDING_STEPS array to include Register step
const EXTENDED_STEPS = [...ONBOARDING_STEPS, "Register"];

const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signUp } = useAuth();
  const [step, setStep] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const [pet, setPet] = useState<Pet>({
    id: generateId(),
    name: "",
    species: "dog",
    knownAllergies: [],
  });
  
  // Registration form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Update pet data
  const updatePet = (updates: Partial<Pet>) => {
    setPet(prev => ({ ...prev, ...updates }));
  };

  // Clear any registration errors when switching to the register step
  useEffect(() => {
    if (step === EXTENDED_STEPS.length - 1) {
      setRegistrationError(null);
    }
  }, [step]);

  // Handle user registration and pet data saving
  const handleRegisterAndSavePet = async () => {
    if (!email || !password || !fullName) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return false;
    }
    
    try {
      setIsSubmitting(true);
      setRegistrationError(null);
      
      // Store pet data temporarily
      storeTemporaryPetData(pet);
      
      // Register the user
      const { error, needsEmailConfirmation } = await signUp(email, password, {
        full_name: fullName,
      });
      
      if (error) {
        setRegistrationError(error.message || "Failed to create user account");
        return false;
      }
      
      // If email confirmation is needed, navigate to auth page with a flag
      if (needsEmailConfirmation) {
        navigate("/auth?verifyEmail=true");
        return true;
      }
      
      // If no email confirmation is needed, we can try to save the pet directly
      // (this will likely not happen with Supabase's default settings)
      
      toast({
        title: "Account created successfully",
        description: `${pet.name} has been added to your account.`,
      });
      
      // Navigate to dashboard
      navigate("/dashboard");
      
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      setRegistrationError(error.message || "An error occurred during registration");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle the completion of the onboarding process
  const completePetOnboarding = async () => {
    // If we're at the registration step
    if (step === EXTENDED_STEPS.length - 1) {
      return await handleRegisterAndSavePet();
    }
    
    // For users who are already logged in
    if (user) {
      try {
        setIsSubmitting(true);

        // Insert pet data into Supabase
        const { data, error } = await supabase.from("pets").insert({
          name: pet.name,
          species: pet.species,
          breed: pet.breed,
          age: pet.age,
          weight: pet.weight,
          user_id: user.id,
        }).select().single();

        if (error) {
          throw error;
        }

        console.log("Pet saved successfully:", data);

        // Save pet allergies if any
        if (pet.knownAllergies.length > 0) {
          const allergiesData = pet.knownAllergies.map(allergen => ({
            pet_id: data.id,
            name: allergen,
          }));

          const { error: allergiesError } = await supabase
            .from("allergies")
            .insert(allergiesData);

          if (allergiesError) {
            console.error("Error saving allergies:", allergiesError);
          }
        }

        toast({
          title: "Pet added successfully",
          description: `${pet.name} has been added to your account.`,
        });

        // Navigate to dashboard after successful save
        navigate("/dashboard");
        return true;
      } catch (error: any) {
        toast({
          title: "Error saving pet information",
          description: error.message,
          variant: "destructive",
        });
        return false;
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Move to registration step if user is not logged in
      setStep(EXTENDED_STEPS.length - 1);
      return true;
    }
  };

  // Move to the next step with animation
  const nextStep = async () => {
    if (step < EXTENDED_STEPS.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep((prev) => prev + 1);
        setAnimating(false);
      }, 300);
    } else {
      // Complete onboarding
      await completePetOnboarding();
    }
  };

  // Validation for current step
  const canProceed = () => {
    switch (step) {
      case 0: // Welcome
        return true;
      case 1: // Pet Info
        return pet.name.trim() !== "";
      case 2: // Allergies
        return true; // Can proceed even without allergies
      case 3: // Symptoms
        return true;
      case 4: // Food Database
        return true;
      case 5: // Register
        return (
          email.trim() !== "" && 
          password.trim() !== "" && 
          fullName.trim() !== "" &&
          password.length >= 6
        );
      default:
        return true;
    }
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (step) {
      case 0:
        return <WelcomeStep />;
      case 1:
        return <PetInfoStep pet={pet} updatePet={updatePet} />;
      case 2:
        return <AllergiesStep pet={pet} updatePet={updatePet} />;
      case 3:
        return <SymptomsStep />;
      case 4:
        return <FoodDatabaseStep />;
      case 5:
        return (
          <RegisterStep 
            fullName={fullName}
            setFullName={setFullName}
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            isSubmitting={isSubmitting}
            registrationError={registrationError}
          />
        );
      default:
        return <WelcomeStep />;
    }
  };

  return (
    <OnboardingLayout animating={animating}>
      {/* Logo and App Name */}
      <OnboardingHeader />
      
      {/* Onboarding Steps */}
      <OnboardingStepIndicator currentStep={step} totalSteps={EXTENDED_STEPS.length} />

      {/* Step Content */}
      <Card className={cn(
        "border border-border shadow-elegant overflow-hidden transition-all",
        animating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0",
      )}>
        <CardContent className="pt-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <OnboardingFooter 
        currentStep={step} 
        totalSteps={EXTENDED_STEPS.length}
        canProceed={canProceed()} 
        onNext={nextStep}
        isLoading={isSubmitting}
      />
    </OnboardingLayout>
  );
};

export default Onboarding;
