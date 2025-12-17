"use client";

import { useState, useEffect } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";

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

interface ExperienceModalProps {
  isOpen: boolean;
  onClose: () => void;
  experience?: Experience | null;
  onSave: () => void;
}

export function ExperienceModal({
  isOpen,
  onClose,
  experience,
  onSave,
}: ExperienceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    description: "",
  });

  useEffect(() => {
    if (experience) {
      setFormData({
        title: experience.title,
        company: experience.company,
        location: experience.location || "",
        startDate: new Date(experience.startDate).toISOString().split("T")[0],
        endDate: experience.endDate
          ? new Date(experience.endDate).toISOString().split("T")[0]
          : "",
        current: experience.current,
        description: experience.description || "",
      });
    } else {
      setFormData({
        title: "",
        company: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      });
    }
  }, [experience, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = experience
        ? `/api/profile/experience/${experience.id}`
        : "/api/profile/experience";
      const method = experience ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          endDate: formData.current ? undefined : formData.endDate || undefined,
        }),
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to save experience");
      }
    } catch (error) {
      console.error("Failed to save experience:", error);
      alert("Failed to save experience");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!experience || !confirm("Are you sure you want to delete this experience?")) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/profile/experience/${experience.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onSave();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || "Failed to delete experience");
      }
    } catch (error) {
      console.error("Failed to delete experience:", error);
      alert("Failed to delete experience");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={experience ? "Edit experience" : "Add experience"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-linkedin-text-dark mb-1">
            Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="input"
            placeholder="Ex: Software Engineer"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-linkedin-text-dark mb-1">
            Company *
          </label>
          <input
            type="text"
            value={formData.company}
            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
            className="input"
            placeholder="Ex: Google"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-linkedin-text-dark mb-1">
            Location
          </label>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="input"
            placeholder="Ex: San Francisco, CA"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="current"
            checked={formData.current}
            onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
            className="w-4 h-4 text-linkedin-blue rounded focus:ring-linkedin-blue"
          />
          <label htmlFor="current" className="text-sm text-linkedin-text-dark">
            I am currently working in this role
          </label>
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
              End date
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              className="input"
              disabled={formData.current}
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
            placeholder="Describe your responsibilities and achievements..."
          />
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-linkedin-border-gray">
          {experience ? (
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
