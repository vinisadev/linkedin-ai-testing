"use client";

import { useState, useEffect } from "react";
import { Loader2, X, Plus } from "lucide-react";
import { Modal } from "@/components/ui/modal";

interface Skill {
  id: string;
  name: string;
  endorsements: number;
}

interface SkillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  skills: Skill[];
  onSave: () => void;
}

export function SkillsModal({
  isOpen,
  onClose,
  skills,
  onSave,
}: SkillsModalProps) {
  const [localSkills, setLocalSkills] = useState<Skill[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLocalSkills(skills);
  }, [skills, isOpen]);

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    setIsAdding(true);

    try {
      const response = await fetch("/api/profile/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newSkill.trim() }),
      });

      if (response.ok) {
        const skill = await response.json();
        setLocalSkills([...localSkills, skill]);
        setNewSkill("");
        onSave();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to add skill");
      }
    } catch (error) {
      console.error("Failed to add skill:", error);
      alert("Failed to add skill");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    setDeletingId(skillId);

    try {
      const response = await fetch(`/api/profile/skills/${skillId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setLocalSkills(localSkills.filter((s) => s.id !== skillId));
        onSave();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete skill");
      }
    } catch (error) {
      console.error("Failed to delete skill:", error);
      alert("Failed to delete skill");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit skills">
      <div className="space-y-4">
        {/* Add new skill */}
        <form onSubmit={handleAddSkill} className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            className="input flex-1"
            placeholder="Add a skill (e.g., JavaScript)"
          />
          <button
            type="submit"
            disabled={isAdding || !newSkill.trim()}
            className="btn-primary flex items-center gap-2 whitespace-nowrap"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Add
          </button>
        </form>

        {/* Skills list */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {localSkills.length === 0 ? (
            <p className="text-center text-linkedin-text-gray py-4">
              No skills added yet. Add your first skill above.
            </p>
          ) : (
            localSkills.map((skill) => (
              <div
                key={skill.id}
                className="flex items-center justify-between p-3 bg-linkedin-warm-gray rounded-lg"
              >
                <div>
                  <span className="font-medium text-linkedin-text-dark">
                    {skill.name}
                  </span>
                  {skill.endorsements > 0 && (
                    <span className="text-sm text-linkedin-text-gray ml-2">
                      ({skill.endorsements} endorsement{skill.endorsements !== 1 ? "s" : ""})
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteSkill(skill.id)}
                  disabled={deletingId === skill.id}
                  className="p-1 text-linkedin-text-gray hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  {deletingId === skill.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-linkedin-border-gray">
          <button
            type="button"
            onClick={onClose}
            className="btn-primary"
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
