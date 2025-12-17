"use client";

import { Pencil, Plus, GraduationCap } from "lucide-react";

interface Education {
  id: string;
  school: string;
  schoolLogo: string | null;
  degree: string | null;
  field: string | null;
  startDate: Date;
  endDate: Date | null;
  description: string | null;
}

interface ProfileEducationProps {
  educations: Education[];
  isOwnProfile: boolean;
}

export function ProfileEducation({ educations, isOwnProfile }: ProfileEducationProps) {
  const formatDuration = (startDate: Date, endDate: Date | null) => {
    const startYear = new Date(startDate).getFullYear();
    const endYear = endDate ? new Date(endDate).getFullYear() : "Present";
    return `${startYear} - ${endYear}`;
  };

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-linkedin-text-dark">Education</h2>
        {isOwnProfile && (
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-linkedin-warm-gray rounded-full">
              <Plus className="w-5 h-5 text-linkedin-text-gray" />
            </button>
            <button className="p-2 hover:bg-linkedin-warm-gray rounded-full">
              <Pencil className="w-5 h-5 text-linkedin-text-gray" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {educations.map((edu, index) => (
          <div
            key={edu.id}
            className={`flex gap-4 ${
              index !== educations.length - 1
                ? "pb-6 border-b border-linkedin-border-gray"
                : ""
            }`}
          >
            {/* School Logo */}
            <div className="w-12 h-12 flex-shrink-0 bg-linkedin-warm-gray rounded flex items-center justify-center">
              {edu.schoolLogo ? (
                <img
                  src={edu.schoolLogo}
                  alt={edu.school}
                  className="w-full h-full object-contain"
                />
              ) : (
                <GraduationCap className="w-6 h-6 text-linkedin-text-gray" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-linkedin-text-dark">{edu.school}</h3>
              {(edu.degree || edu.field) && (
                <p className="text-linkedin-text-dark">
                  {[edu.degree, edu.field].filter(Boolean).join(", ")}
                </p>
              )}
              <p className="text-sm text-linkedin-text-gray">
                {formatDuration(edu.startDate, edu.endDate)}
              </p>
              {edu.description && (
                <p className="mt-2 text-linkedin-text-dark text-sm whitespace-pre-wrap">
                  {edu.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
