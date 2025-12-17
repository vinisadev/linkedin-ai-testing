"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";

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

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  education?: Education | null;
  onSave: () => void;
}

export function EducationModal({
  isOpen,
  onClose,
  education,
  onSave,
}: EducationModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    school: "",
    degree: "",
    field: "",
    startDate: "",
    endDate: "",
    description: "",
  });

  useEffect(() => {
    if (education) {
      setFormData({
        school: education.school,
        degree: education.degree || "",
        field: education.field || "",
        startDate: new Date(education.startDate).toISOString().split("T")[0],
        endDate: education.endDate
          ? new Date(education.endDate).toISOString().split("T")[0]
          : "",
        description: education.description || "",
      });
    } else {
      setFormData({
        school: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        description: "",
      });
    }
  }, [education, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = education
        ? `/api/profile/education/${education.id}`
        : "/api/profile/education";
      const method = education ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          endDate: formData.endDate || undefined,
        }),
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save education");
      }
    } catch (error) {
      console.error("Failed to save education:", error);
      alert("Failed to save education");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!education || !confirm("Are you sure you want to delete this education?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/profile/education/${education.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete education");
      }
    } catch (error) {
      console.error("Failed to delete education:", error);
      alert("Failed to delete education");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={education ? "Edit education" : "Add education"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-linkedin-text-dark mb-1">
            School *
          </label>
          <input
            type="text"
            value={formData.school}
            onChange={(e) => setFormData({ ...formData, school: e.target.value })}
            className="input"
            placeholder="Ex: Stanford University"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-linkedin-text-dark mb-1">
            Degree
          </label>
          <input
            type="text"
            value={formData.degree}
            onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
            className="input"
            placeholder="Ex: Bachelor's"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-linkedin-text-dark mb-1">
            Field of study
          </label>
          <input
            type="text"
            value={formData.field}
            onChange={(e) => setFormData({ ...formData, field: e.target.value })}
            className="input"
            placeholder="Ex: Computer Science"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-linkedin-text-dark mb-1">
              Start date *
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-linkedin-text-dark mb-1">
              End date (or expected)
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="input"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-linkedin-text-dark mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input min-h-[100px]"
            placeholder="Activities, societies, achievements..."
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-linkedin-border-gray">
          {education ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-2 text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              Delete
            </button>
          ) : (
            <div />
          )}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-linkedin-text-gray hover:text-linkedin-text-dark"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Save
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
