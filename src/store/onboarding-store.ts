import { create } from "zustand";

export interface OnboardingData {
  // Step 1: Basic Info
  firstName: string;
  lastName: string;
  headline: string;
  location: string;

  // Step 2: Profile Photo
  image: string;

  // Step 3: Current Position
  currentPosition: {
    title: string;
    company: string;
    startDate: string;
    current: boolean;
    description: string;
  } | null;

  // Step 4: Education
  education: {
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  } | null;

  // Step 5: Skills
  skills: string[];
}

interface OnboardingStore {
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (data: Partial<OnboardingData>) => void;
  reset: () => void;
}

const initialData: OnboardingData = {
  firstName: "",
  lastName: "",
  headline: "",
  location: "",
  image: "",
  currentPosition: null,
  education: null,
  skills: [],
};

export const useOnboardingStore = create<OnboardingStore>((set) => ({
  currentStep: 1,
  totalSteps: 5,
  data: initialData,
  setStep: (step) => set({ currentStep: step }),
  nextStep: () => set((state) => ({ currentStep: Math.min(state.currentStep + 1, state.totalSteps) })),
  prevStep: () => set((state) => ({ currentStep: Math.max(state.currentStep - 1, 1) })),
  updateData: (data) => set((state) => ({ data: { ...state.data, ...data } })),
  reset: () => set({ currentStep: 1, data: initialData }),
}));
