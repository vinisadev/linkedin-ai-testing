"use client";

import { useState } from "react";
import Link from "next/link";
import { Pencil, Plus, Briefcase } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ExperienceModal } from "./experience-modal";

interface Experience {
  id: string;
  title: string;
  company: string;
  companyId: string | null;
  companyLogo: string | null;
  location: string | null;
  startDate: Date;
  endDate: Date | null;
  current: boolean;
  description: string | null;
  linkedCompany?: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  } | null;
}

interface ProfileExperienceProps {
  experiences: Experience[];
  isOwnProfile: boolean;
  onUpdate?: () => void;
}

export function ProfileExperience({ experiences, isOwnProfile, onUpdate }: ProfileExperienceProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExperience, setEditingExperience] = useState<Experience | null>(null);

  const formatDuration = (startDate: Date, endDate: Date | null, current: boolean) => {
    const start = formatDate(startDate);
    const end = current ? "Present" : endDate ? formatDate(endDate) : "";
    return `${start} - ${end}`;
  };

  const handleAddNew = () => {
    setEditingExperience(null);
    setIsModalOpen(true);
  };

  const handleEdit = (experience: Experience) => {
    setEditingExperience(experience);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      <section className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-linkedin-text-dark">Experience</h2>
          {isOwnProfile && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddNew}
                className="p-2 hover:bg-linkedin-warm-gray rounded-full"
                title="Add experience"
              >
                <Plus className="w-5 h-5 text-linkedin-text-gray" />
              </button>
            </div>
          )}
        </div>

        {experiences.length === 0 ? (
          <p className="text-linkedin-text-gray text-center py-4">
            {isOwnProfile
              ? "Add your work experience to showcase your career journey."
              : "No experience added yet."}
          </p>
        ) : (
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
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-linkedin-text-dark">{exp.title}</h3>
                      {exp.linkedCompany ? (
                        <Link
                          href={`/company/${exp.linkedCompany.slug}`}
                          className="text-linkedin-text-dark hover:text-linkedin-blue hover:underline"
                        >
                          {exp.company}
                        </Link>
                      ) : (
                        <p className="text-linkedin-text-dark">{exp.company}</p>
                      )}
                      <p className="text-sm text-linkedin-text-gray">
                        {formatDuration(exp.startDate, exp.endDate, exp.current)}
                      </p>
                      {exp.location && (
                        <p className="text-sm text-linkedin-text-gray">{exp.location}</p>
                      )}
                    </div>
                    {isOwnProfile && (
                      <button
                        onClick={() => handleEdit(exp)}
                        className="p-2 hover:bg-linkedin-warm-gray rounded-full"
                        title="Edit experience"
                      >
                        <Pencil className="w-4 h-4 text-linkedin-text-gray" />
                      </button>
                    )}
                  </div>
                  {exp.description && (
                    <p className="mt-2 text-linkedin-text-dark text-sm whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ExperienceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        experience={editingExperience}
        onSave={handleSave}
      />
    </>
  );
}
