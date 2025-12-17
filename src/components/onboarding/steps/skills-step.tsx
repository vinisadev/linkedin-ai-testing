"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useOnboardingStore } from "@/store/onboarding-store";
import { X, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const SUGGESTED_SKILLS = [
  "JavaScript",
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Java",
  "SQL",
  "Git",
  "AWS",
  "Docker",
  "Kubernetes",
  "Machine Learning",
  "Data Analysis",
  "Project Management",
  "Agile",
  "Communication",
  "Leadership",
  "Problem Solving",
  "Team Collaboration",
  "Strategic Planning",
];

export function SkillsStep() {
  const router = useRouter();
  const { update: updateSession } = useSession();
  const { data, updateData, prevStep } = useOnboardingStore();
  const [skills, setSkills] = useState<string[]>(data.skills);
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const addSkill = (skill: string) => {
    const normalizedSkill = skill.trim();
    if (normalizedSkill && !skills.includes(normalizedSkill) && skills.length < 20) {
      setSkills([...skills, normalizedSkill]);
      setInputValue("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && inputValue.trim()) {
      e.preventDefault();
      addSkill(inputValue);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError("");

    // Update store with final skills
    updateData({ skills });

    // Get all the data
    const finalData = {
      ...data,
      skills,
    };

    try {
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalData),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || "Failed to save profile");
      }

      // Update session to reflect onboarding completion
      await updateSession();

      // Redirect to feed on success
      router.push("/feed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setIsSubmitting(false);
    }
  };

  const availableSuggestions = SUGGESTED_SKILLS.filter(
    (skill) => !skills.includes(skill)
  );

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-linkedin-text-dark mb-2">
          Add your skills
        </h1>
        <p className="text-linkedin-text-gray">
          Highlight your expertise to stand out to recruiters
        </p>
      </div>

      <div className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}

        {/* Selected Skills */}
        {skills.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-linkedin-text-dark">
              Your skills ({skills.length}/20)
            </label>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-linkedin-blue/10 text-linkedin-blue rounded-full text-sm font-medium"
                >
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="hover:bg-linkedin-blue/20 rounded-full p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div>
          <label
            htmlFor="skill"
            className="block text-sm font-medium text-linkedin-text-dark mb-1"
          >
            Add a skill
          </label>
          <div className="relative">
            <input
              type="text"
              id="skill"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input pr-12"
              placeholder="Type a skill and press Enter"
              disabled={skills.length >= 20}
            />
            <button
              onClick={() => addSkill(inputValue)}
              disabled={!inputValue.trim() || skills.length >= 20}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-linkedin-blue hover:bg-linkedin-blue/10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {availableSuggestions.length > 0 && (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-linkedin-text-dark">
              Suggested skills
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSuggestions.slice(0, 10).map((skill) => (
                <button
                  key={skill}
                  onClick={() => addSkill(skill)}
                  disabled={skills.length >= 20}
                  className={cn(
                    "inline-flex items-center gap-1 px-3 py-1.5 border border-linkedin-border-gray rounded-full text-sm",
                    "hover:border-linkedin-blue hover:text-linkedin-blue transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 pt-4">
          <button
            onClick={prevStep}
            disabled={isSubmitting}
            className="btn-secondary flex-1 py-3 disabled:opacity-50"
          >
            Back
          </button>
          <button
            onClick={handleComplete}
            disabled={isSubmitting}
            className="btn-primary flex-1 py-3 disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Complete Profile"
            )}
          </button>
        </div>

        {skills.length === 0 && (
          <p className="text-center text-sm text-linkedin-text-gray">
            You can skip this step and add skills later
          </p>
        )}
      </div>
    </div>
  );
}
