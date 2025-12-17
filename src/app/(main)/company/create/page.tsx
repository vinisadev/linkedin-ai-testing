"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";

const COMPANY_SIZES = [
  "1-10 employees",
  "11-50 employees",
  "51-200 employees",
  "201-500 employees",
  "501-1000 employees",
  "1001-5000 employees",
  "5001-10000 employees",
  "10000+ employees",
];

const INDUSTRIES = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Manufacturing",
  "Retail",
  "Consulting",
  "Marketing",
  "Real Estate",
  "Legal",
  "Non-profit",
  "Government",
  "Other",
];

export default function CreateCompanyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    headline: "",
    description: "",
    website: "",
    industry: "",
    companySize: "",
    location: "",
    foundedYear: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          foundedYear: formData.foundedYear
            ? parseInt(formData.foundedYear)
            : undefined,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create company");
      }

      const company = await response.json();
      router.push(`/company/${company.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="p-6 border-b border-linkedin-border-gray">
          <div className="flex items-center gap-3">
            <Building2 className="w-8 h-8 text-linkedin-blue" />
            <div>
              <h1 className="text-xl font-semibold text-linkedin-text-dark">
                Create a Company Page
              </h1>
              <p className="text-sm text-linkedin-text-gray">
                Build your company&apos;s presence on LinkedIn
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {/* Company Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-linkedin-text-dark mb-1"
            >
              Company name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              maxLength={100}
              className="w-full px-3 py-2 border border-linkedin-border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
              placeholder="Enter your company name"
            />
          </div>

          {/* Headline */}
          <div>
            <label
              htmlFor="headline"
              className="block text-sm font-medium text-linkedin-text-dark mb-1"
            >
              Tagline
            </label>
            <input
              type="text"
              id="headline"
              name="headline"
              value={formData.headline}
              onChange={handleChange}
              maxLength={200}
              className="w-full px-3 py-2 border border-linkedin-border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
              placeholder="A brief description of your company"
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-linkedin-text-dark mb-1"
            >
              About
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-3 py-2 border border-linkedin-border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent resize-none"
              placeholder="Tell people about your company..."
            />
          </div>

          {/* Website */}
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
              className="w-full px-3 py-2 border border-linkedin-border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
              placeholder="https://www.example.com"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Industry */}
            <div>
              <label
                htmlFor="industry"
                className="block text-sm font-medium text-linkedin-text-dark mb-1"
              >
                Industry
              </label>
              <select
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-linkedin-border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
              >
                <option value="">Select industry</option>
                {INDUSTRIES.map((industry) => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            </div>

            {/* Company Size */}
            <div>
              <label
                htmlFor="companySize"
                className="block text-sm font-medium text-linkedin-text-dark mb-1"
              >
                Company size
              </label>
              <select
                id="companySize"
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-linkedin-border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
              >
                <option value="">Select size</option>
                {COMPANY_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-linkedin-text-dark mb-1"
              >
                Headquarters
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-linkedin-border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
                placeholder="City, Country"
              />
            </div>

            {/* Founded Year */}
            <div>
              <label
                htmlFor="foundedYear"
                className="block text-sm font-medium text-linkedin-text-dark mb-1"
              >
                Year founded
              </label>
              <input
                type="number"
                id="foundedYear"
                name="foundedYear"
                value={formData.foundedYear}
                onChange={handleChange}
                min="1800"
                max={new Date().getFullYear()}
                className="w-full px-3 py-2 border border-linkedin-border-gray rounded-md focus:outline-none focus:ring-2 focus:ring-linkedin-blue focus:border-transparent"
                placeholder={new Date().getFullYear().toString()}
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-linkedin-text-gray hover:text-linkedin-text-dark transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="px-6 py-2 bg-linkedin-blue text-white rounded-full hover:bg-linkedin-blue-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create page
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
