"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Calendar,
  Briefcase,
  Settings,
  Loader2,
} from "lucide-react";
import { CompanyPostFeed } from "@/components/company/company-post-feed";
import { CreateCompanyPost } from "@/components/company/create-company-post";

interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  banner: string | null;
  headline: string | null;
  description: string | null;
  website: string | null;
  industry: string | null;
  companySize: string | null;
  location: string | null;
  foundedYear: number | null;
  userRole: "OWNER" | "ADMIN" | "EDITOR" | null;
  isMember: boolean;
  members: {
    id: string;
    role: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
      headline: string | null;
    };
  }[];
  _count: {
    posts: number;
  };
}

export default function CompanyPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshPosts, setRefreshPosts] = useState(0);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`/api/companies/by-slug/${slug}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError("Company not found");
          } else {
            setError("Failed to load company");
          }
          return;
        }
        const data = await response.json();
        setCompany(data);
      } catch (err) {
        setError("Failed to load company");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompany();
  }, [slug]);

  const handlePostCreated = () => {
    setRefreshPosts((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-linkedin-blue" />
      </div>
    );
  }

  if (error || !company) {
    return (
      <div className="card p-8 text-center">
        <Building2 className="w-12 h-12 text-linkedin-border-gray mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-linkedin-text-dark mb-2">
          {error || "Company not found"}
        </h2>
        <p className="text-linkedin-text-gray">
          The company page you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>
    );
  }

  const canManage = company.userRole === "OWNER" || company.userRole === "ADMIN";

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <div className="card overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-linkedin-blue to-blue-400 relative">
          {company.banner && (
            <img
              src={company.banner}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Logo & Info */}
        <div className="px-6 pb-6 relative z-10">
          {/* Logo - pulled up into banner */}
          <div className="-mt-12 mb-4">
            <div className="w-24 h-24 bg-white rounded-lg border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
              {company.logo ? (
                <img
                  src={company.logo}
                  alt={company.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Building2 className="w-12 h-12 text-linkedin-text-gray" />
              )}
            </div>
          </div>

          {/* Company Name & Actions */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-linkedin-text-dark">
                {company.name}
              </h1>
              {company.headline && (
                <p className="text-linkedin-text-gray mt-1">{company.headline}</p>
              )}
            </div>

            {canManage && (
              <Link
                href={`/company/${company.slug}/manage`}
                className="inline-flex items-center gap-2 px-4 py-2 border border-linkedin-blue text-linkedin-blue rounded-full hover:bg-linkedin-blue hover:text-white transition-colors self-start"
              >
                <Settings className="w-4 h-4" />
                Manage page
              </Link>
            )}
          </div>

          {/* Quick Stats */}
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-linkedin-text-gray">
            {company.industry && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                {company.industry}
              </div>
            )}
            {company.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {company.location}
              </div>
            )}
            {company.companySize && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                {company.companySize}
              </div>
            )}
            {company.foundedYear && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                Founded {company.foundedYear}
              </div>
            )}
            {company.website && (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-linkedin-blue hover:underline"
              >
                <Globe className="w-4 h-4" />
                Website
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {/* About */}
          {company.description && (
            <div className="card p-6">
              <h2 className="text-lg font-semibold text-linkedin-text-dark mb-3">
                About
              </h2>
              <p className="text-linkedin-text-gray whitespace-pre-wrap">
                {company.description}
              </p>
            </div>
          )}

          {/* Create Post (if member) */}
          {company.isMember && (
            <CreateCompanyPost
              companyId={company.id}
              companyName={company.name}
              companyLogo={company.logo}
              onPostCreated={handlePostCreated}
            />
          )}

          {/* Posts Feed */}
          <CompanyPostFeed companyId={company.id} refreshKey={refreshPosts} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Team Members */}
          <div className="card p-4">
            <h3 className="font-semibold text-linkedin-text-dark mb-3">
              Page admins
            </h3>
            <div className="space-y-3">
              {company.members.slice(0, 5).map((member) => (
                <Link
                  key={member.id}
                  href={`/profile/${member.user.id}`}
                  className="flex items-center gap-3 hover:bg-linkedin-warm-gray p-2 rounded-md transition-colors -mx-2"
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-linkedin-blue flex items-center justify-center">
                    {member.user.image ? (
                      <img
                        src={member.user.image}
                        alt={member.user.name || "User"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-sm font-semibold">
                        {member.user.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-linkedin-text-dark text-sm truncate">
                      {member.user.name || "LinkedIn User"}
                    </p>
                    <p className="text-xs text-linkedin-text-gray capitalize">
                      {member.role.toLowerCase()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {company.members.length > 5 && (
              <Link
                href={`/company/${company.slug}/manage`}
                className="block mt-3 text-sm text-linkedin-blue hover:underline"
              >
                See all {company.members.length} members
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
