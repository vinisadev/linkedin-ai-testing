"use client";

import { Pencil, Plus, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface Experience {
  id: string;
  title: string;
  company: string;
  companyLogo: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  description: string | null;
}

interface ProfileExperienceProps {
  experiences: Experience[];
  isOwnProfile: boolean;
}

export function ProfileExperience({ experiences, isOwnProfile }: ProfileExperienceProps) {
  const formatDuration = (startDate: Date, endDate: Date | null, current: boolean) => {
    const start = formatDate(startDate);
    const end = current ? "Present" : endDate ? formatDate(endDate) : "";
    return `${start} - ${end}`;
  };

  return (
    <section className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-linkedin-text-dark">Experience</h2>
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
        {experiences.map((exp, index) => (
          <div
            key={exp.id}
            className={`flex gap-4 ${
              index !== experiences.length - 1
                ? "pb-6 border-b border-linkedin-border-gray"
                : ""
            }`}
          >
            {/* Company Logo */}
            <div className="w-12 h-12 flex-shrink-0 bg-linkedin-warm-gray rounded flex items-center justify-center">
              {exp.companyLogo ? (
                <img
                  src={exp.companyLogo}
                  alt={exp.company}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Briefcase className="w-6 h-6 text-linkedin-text-gray" />
              )}
            </div>

            {/* Details */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-linkedin-text-dark">{exp.title}</h3>
              <p className="text-linkedin-text-dark">{exp.company}</p>
              <p className="text-sm text-linkedin-text-gray">
                {formatDuration(exp.startDate, exp.endDate, exp.current)}
              </p>
              {exp.location && (
                <p className="text-sm text-linkedin-text-gray">{exp.location}</p>
              )}
              {exp.description && (
                <p className="mt-2 text-linkedin-text-dark text-sm whitespace-pre-wrap">
                  {exp.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
