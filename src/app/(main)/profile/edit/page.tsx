"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface ProfileData {
  name: string;
  headline: string;
  location: string;
  website: string;
  about: string;
}

export default function EditProfilePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    headline: "",
    location: "",
    website: "",
    about: "",
  });

  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch("/api/users/me");
        if (response.ok) {
          const data = await response.json();
          setFormData({
            name: data.name || "",
            headline: data.headline || "",
            location: data.location || "",
            website: data.website || "",
            about: data.profile?.about || "",
          });
        }
      } catch (err) {
        setError("Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update profile");
      }

      router.push("/profile");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="card p-8 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-linkedin-blue" />
      </div>
    );
  }

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-linkedin-border-gray">
        <Link
          href="/profile"
          className="p-2 hover:bg-linkedin-warm-gray rounded-full"
        >
          <ArrowLeft className="w-5 h-5 text-linkedin-text-gray" />
        </Link>
        <h1 className="text-xl font-semibold text-linkedin-text-dark">
          Edit profile
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-linkedin-text-dark mb-1"
          >
            Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="input"
            required
          />
        </div>

        <div>
          <label
            htmlFor="headline"
            className="block text-sm font-medium text-linkedin-text-dark mb-1"
          >
            Headline
          </label>
          <input
            type="text"
            id="headline"
            name="headline"
            value={formData.headline}
            onChange={handleChange}
            className="input"
            placeholder="e.g., Software Engineer at Company"
          />
          <p className="mt-1 text-xs text-linkedin-text-gray">
            Describe what you do in a few words
          </p>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-linkedin-text-dark mb-1"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="input"
            placeholder="e.g., San Francisco, CA"
          />
        </div>

        <div>
          <label
            htmlFor="website"
            className="block text-sm font-medium text-linkedin-text-dark mb-1"
          >
            Website
          </label>
          <input
            type="url"
            id="website"
            name="website"
            value={formData.website}
            onChange={handleChange}
            className="input"
            placeholder="https://yourwebsite.com"
          />
        </div>

        <div>
          <label
            htmlFor="about"
            className="block text-sm font-medium text-linkedin-text-dark mb-1"
          >
            About
          </label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows={6}
            className="input resize-none"
            placeholder="Tell people about yourself, your experience, and what you're passionate about..."
          />
          <p className="mt-1 text-xs text-linkedin-text-gray">
            {formData.about.length}/2600 characters
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-linkedin-border-gray">
          <Link href="/profile" className="btn-secondary">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSaving}
            className="btn-primary disabled:opacity-50"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              "Save"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
