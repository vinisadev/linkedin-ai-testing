"use client";

import { useState } from "react";
import { Pencil, ChevronDown, ChevronUp } from "lucide-react";
import { SkillsModal } from "./skills-modal";

interface Skill {
  id: string;
  name: string;
  endorsements: number;
}

interface ProfileSkillsProps {
  skills: Skill[];
  isOwnProfile: boolean;
  onUpdate?: () => void;
}

export function ProfileSkills({ skills, isOwnProfile, onUpdate }: ProfileSkillsProps) {
  const [showAll, setShowAll] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const displayedSkills = showAll ? skills : skills.slice(0, 5);
  const hasMore = skills.length > 5;

  const handleSave = () => {
    if (onUpdate) {
      onUpdate();
    }
  };

  return (
    <>
      <section className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-linkedin-text-dark">Skills</h2>
          {isOwnProfile && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-2 hover:bg-linkedin-warm-gray rounded-full"
                title="Edit skills"
              >
                <Pencil className="w-5 h-5 text-linkedin-text-gray" />
              </button>
            </div>
          )}
        </div>

        {skills.length === 0 ? (
          <p className="text-linkedin-text-gray text-center py-4">
            {isOwnProfile
              ? "Add skills to highlight your expertise."
              : "No skills added yet."}
          </p>
        ) : (
          <div className="space-y-4">
            {displayedSkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between py-2 border-b border-linkedin-border-gray last:border-0"
              >
                <span className="font-medium text-linkedin-text-dark">{skill.name}</span>
                {skill.endorsements > 0 && (
                  <span className="text-sm text-linkedin-text-gray">
                    {skill.endorsements} endorsement{skill.endorsements !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {hasMore && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-linkedin-text-gray hover:text-linkedin-text-dark mt-4 font-medium w-full justify-center"
          >
            {showAll ? (
              <>
                Show less <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                Show all {skills.length} skills <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
        )}
      </section>

      <SkillsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        skills={skills}
        onSave={handleSave}
      />
    </>
  );
}
