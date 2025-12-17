"use client";

import { useState } from "react";
import { useOnboardingStore } from "@/store/onboarding-store";
import { GraduationCap } from "lucide-react";

export function EducationStep() {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();
  const [hasEducation, setHasEducation] = useState(data.education !== null);
  const [school, setSchool] = useState(data.education?.school || "");
  const [degree, setDegree] = useState(data.education?.degree || "");
  const [field, setField] = useState(data.education?.field || "");
  const [startYear, setStartYear] = useState(
    data.education?.startDate?.split("-")[0] || ""
  );
  const [endYear, setEndYear] = useState(
    data.education?.endDate?.split("-")[0] || ""
  );

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 60 }, (_, i) => currentYear + 10 - i);

  const degrees = [
    "High School",
    "Associate's Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctoral Degree",
    "Professional Degree",
    "Certificate",
    "Other",
  ];

  const handleContinue = () => {
    if (hasEducation && school) {
      updateData({
        education: {
          school,
          degree,
          field,
          startDate: startYear ? `${startYear}-09-01` : "",
          endDate: endYear ? `${endYear}-06-01` : "",
        },
      });
    } else {
      updateData({ education: null });
    }
    nextStep();
  };

  const isValid = !hasEducation || school.trim();

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-linkedin-text-dark mb-2">
          Add your education
        </h1>
        <p className="text-linkedin-text-gray">
          Tell us about your educational background
        </p>
      </div>

      <div className="space-y-6">
        {/* Toggle */}
        <div className="flex gap-4">
          <button
            onClick={() => setHasEducation(true)}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              hasEducation
                ? "border-linkedin-blue bg-linkedin-blue/5"
                : "border-linkedin-border-gray hover:border-linkedin-text-gray"
            }`}
          >
            <GraduationCap className="w-6 h-6 mx-auto mb-2 text-linkedin-blue" />
            <p className="text-sm font-medium text-linkedin-text-dark">
              Add education
            </p>
          </button>
          <button
            onClick={() => setHasEducation(false)}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              !hasEducation
                ? "border-linkedin-blue bg-linkedin-blue/5"
                : "border-linkedin-border-gray hover:border-linkedin-text-gray"
            }`}
          >
            <div className="w-6 h-6 mx-auto mb-2 rounded-full border-2 border-linkedin-text-gray" />
            <p className="text-sm font-medium text-linkedin-text-dark">
              Skip for now
            </p>
          </button>
        </div>

        {/* Education Form */}
        {hasEducation && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label
                htmlFor="school"
                className="block text-sm font-medium text-linkedin-text-dark mb-1"
              >
                School *
              </label>
              <input
                type="text"
                id="school"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                className="input"
                placeholder="e.g., Stanford University"
              />
            </div>

            <div>
              <label
                htmlFor="degree"
                className="block text-sm font-medium text-linkedin-text-dark mb-1"
              >
                Degree
              </label>
              <select
                id="degree"
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                className="input"
              >
                <option value="">Select degree</option>
                {degrees.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="field"
                className="block text-sm font-medium text-linkedin-text-dark mb-1"
              >
                Field of study
              </label>
              <input
                type="text"
                id="field"
                value={field}
                onChange={(e) => setField(e.target.value)}
                className="input"
                placeholder="e.g., Computer Science"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-linkedin-text-dark mb-1">
                Years attended
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="input"
                >
                  <option value="">Start year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <select
                  value={endYear}
                  onChange={(e) => setEndYear(e.target.value)}
                  className="input"
                >
                  <option value="">End year (or expected)</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3">
          <button onClick={prevStep} className="btn-secondary flex-1 py-3">
            Back
          </button>
          <button
            onClick={handleContinue}
            disabled={!isValid}
            className="btn-primary flex-1 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
