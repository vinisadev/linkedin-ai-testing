"use client";

import { useOnboardingStore } from "@/store/onboarding-store";
import { StepIndicator } from "./step-indicator";
import { BasicInfoStep } from "./steps/basic-info-step";
import { ProfilePhotoStep } from "./steps/profile-photo-step";
import { CurrentPositionStep } from "./steps/current-position-step";
import { EducationStep } from "./steps/education-step";
import { SkillsStep } from "./steps/skills-step";

interface OnboardingWizardProps {
  userName: string;
}

export function OnboardingWizard({ userName }: OnboardingWizardProps) {
  const { currentStep } = useOnboardingStore();

  const steps = [
    { number: 1, title: "Basic Info" },
    { number: 2, title: "Photo" },
    { number: 3, title: "Experience" },
    { number: 4, title: "Education" },
    { number: 5, title: "Skills" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-linkedin-border-gray">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="#0a66c2"
              className="w-8 h-8"
            >
              <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
            </svg>
            <span className="text-xl font-semibold text-linkedin-text-dark">
              Complete your profile
            </span>
          </div>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <StepIndicator steps={steps} currentStep={currentStep} />
      </div>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-4 pb-12">
        {currentStep === 1 && <BasicInfoStep userName={userName} />}
        {currentStep === 2 && <ProfilePhotoStep />}
        {currentStep === 3 && <CurrentPositionStep />}
        {currentStep === 4 && <EducationStep />}
        {currentStep === 5 && <SkillsStep />}
      </main>
    </div>
  );
}
