"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center flex-1">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                step.number < currentStep
                  ? "bg-linkedin-green text-white"
                  : step.number === currentStep
                    ? "bg-linkedin-blue text-white"
                    : "bg-linkedin-border-gray text-linkedin-text-gray"
              )}
            >
              {step.number < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-xs font-medium hidden sm:block",
                step.number <= currentStep
                  ? "text-linkedin-text-dark"
                  : "text-linkedin-text-gray"
              )}
            >
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-1 mx-2",
                step.number < currentStep
                  ? "bg-linkedin-green"
                  : "bg-linkedin-border-gray"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
