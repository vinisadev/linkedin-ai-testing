"use client";

import { useEffect, useState } from "react";
import { useOnboardingStore } from "@/store/onboarding-store";
import { MapPin } from "lucide-react";

interface BasicInfoStepProps {
  userName: string;
}

export function BasicInfoStep({ userName }: BasicInfoStepProps) {
  const { data, updateData, nextStep } = useOnboardingStore();
  const [firstName, setFirstName] = useState(data.firstName);
  const [lastName, setLastName] = useState(data.lastName);
  const [headline, setHeadline] = useState(data.headline);
  const [location, setLocation] = useState(data.location);

  // Pre-fill from session name if available
  useEffect(() => {
    if (userName && !firstName && !lastName) {
      const parts = userName.split(" ");
      if (parts.length >= 2) {
        setFirstName(parts[0]);
        setLastName(parts.slice(1).join(" "));
      } else if (parts.length === 1) {
        setFirstName(parts[0]);
      }
    }
  }, [userName, firstName, lastName]);

  const handleContinue = () => {
    updateData({
      firstName,
      lastName,
      headline,
      location,
    });
    nextStep();
  };

  const isValid = firstName.trim() && lastName.trim();

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-linkedin-text-dark mb-2">
          Let's start with the basics
        </h1>
        <p className="text-linkedin-text-gray">
          Help others get to know you better
        </p>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-linkedin-text-dark mb-1"
            >
              First name *
            </label>
            <input
              type="text"
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="input"
              placeholder="John"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-linkedin-text-dark mb-1"
            >
              Last name *
            </label>
            <input
              type="text"
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="input"
              placeholder="Doe"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="headline"
            className="block text-sm font-medium text-linkedin-text-dark mb-1"
          >
            Headline
          </label>
          <input
            type="text"
            id="headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            className="input"
            placeholder="Software Engineer at Company"
          />
          <p className="mt-1 text-xs text-linkedin-text-gray">
            Describe what you do in a few words
          </p>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-linkedin-text-dark mb-1"
          >
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-linkedin-text-gray" />
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="input pl-10"
              placeholder="San Francisco, CA"
            />
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!isValid}
          className="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
