"use client";

import { useState } from "react";
import { useOnboardingStore } from "@/store/onboarding-store";
import { Briefcase } from "lucide-react";

export function CurrentPositionStep() {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();
  const [hasPosition, setHasPosition] = useState(data.currentPosition !== null);
  const [title, setTitle] = useState(data.currentPosition?.title || "");
  const [company, setCompany] = useState(data.currentPosition?.company || "");
  const [startMonth, setStartMonth] = useState(
    data.currentPosition?.startDate?.split("-")[1] || ""
  );
  const [startYear, setStartYear] = useState(
    data.currentPosition?.startDate?.split("-")[0] || ""
  );
  const [description, setDescription] = useState(
    data.currentPosition?.description || ""
  );

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  const handleContinue = () => {
    if (hasPosition && title && company) {
      updateData({
        currentPosition: {
          title,
          company,
          startDate: startYear && startMonth ? `${startYear}-${startMonth}-01` : "",
          current: true,
          description,
        },
      });
    } else {
      updateData({ currentPosition: null });
    }
    nextStep();
  };

  const isValid = !hasPosition || (title.trim() && company.trim());

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-linkedin-text-dark mb-2">
          Add your most recent position
        </h1>
        <p className="text-linkedin-text-gray">
          Showcase your experience to help recruiters find you
        </p>
      </div>

      <div className="space-y-6">
        {/* Toggle */}
        <div className="flex gap-4">
          <button
            onClick={() => setHasPosition(true)}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              hasPosition
                ? "border-linkedin-blue bg-linkedin-blue/5"
                : "border-linkedin-border-gray hover:border-linkedin-text-gray"
            }`}
          >
            <Briefcase className="w-6 h-6 mx-auto mb-2 text-linkedin-blue" />
            <p className="text-sm font-medium text-linkedin-text-dark">
              I'm currently working
            </p>
          </button>
          <button
            onClick={() => setHasPosition(false)}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              !hasPosition
                ? "border-linkedin-blue bg-linkedin-blue/5"
                : "border-linkedin-border-gray hover:border-linkedin-text-gray"
            }`}
          >
            <div className="w-6 h-6 mx-auto mb-2 rounded-full border-2 border-linkedin-text-gray" />
            <p className="text-sm font-medium text-linkedin-text-dark">
              I'm not working right now
            </p>
          </button>
        </div>

        {/* Position Form */}
        {hasPosition && (
          <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-linkedin-text-dark mb-1"
              >
                Job title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input"
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div>
              <label
                htmlFor="company"
                className="block text-sm font-medium text-linkedin-text-dark mb-1"
              >
                Company *
              </label>
              <input
                type="text"
                id="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="input"
                placeholder="e.g., Google"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-linkedin-text-dark mb-1">
                Start date
              </label>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={startMonth}
                  onChange={(e) => setStartMonth(e.target.value)}
                  className="input"
                >
                  <option value="">Month</option>
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(e.target.value)}
                  className="input"
                >
                  <option value="">Year</option>
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-linkedin-text-dark mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="input resize-none"
                placeholder="Describe your role and key achievements..."
              />
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
