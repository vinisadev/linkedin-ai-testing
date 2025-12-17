"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Building2, Plus, Loader2, Crown, Shield, Edit3, Mail } from "lucide-react";

interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  headline: string | null;
  memberCount: number;
  postCount: number;
  userRole: "OWNER" | "ADMIN" | "EDITOR";
}

interface Invite {
  id: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
  };
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [inviteCount, setInviteCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanies();
    fetchInviteCount();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/companies");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error("Failed to fetch companies:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInviteCount = async () => {
    try {
      const response = await fetch("/api/company-invites");
      if (response.ok) {
        const data: Invite[] = await response.json();
        setInviteCount(data.length);
      }
    } catch (error) {
      console.error("Failed to fetch invites:", error);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case "ADMIN":
        return <Shield className="w-4 h-4 text-linkedin-blue" />;
      default:
        return <Edit3 className="w-4 h-4 text-linkedin-text-gray" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-linkedin-blue" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-linkedin-blue" />
            <h1 className="text-xl font-semibold text-linkedin-text-dark">
              Company Pages
            </h1>
          </div>
          <Link
            href="/company/create"
            className="flex items-center gap-2 px-4 py-2 bg-linkedin-blue text-white rounded-full hover:bg-linkedin-blue-hover transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create company
          </Link>
        </div>
      </div>

      {/* Pending Invites */}
      {inviteCount > 0 && (
        <Link href="/company-invites" className="card p-4 block hover:bg-linkedin-warm-gray transition-colors">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-linkedin-blue/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-linkedin-blue" />
              </div>
              <div>
                <p className="font-medium text-linkedin-text-dark">
                  Pending invitations
                </p>
                <p className="text-sm text-linkedin-text-gray">
                  You have {inviteCount} pending invite{inviteCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <span className="px-3 py-1 bg-linkedin-blue text-white text-sm rounded-full">
              {inviteCount}
            </span>
          </div>
        </Link>
      )}

      {/* My Companies */}
      <div className="card">
        <div className="p-4 border-b border-linkedin-border-gray">
          <h2 className="font-semibold text-linkedin-text-dark">
            My company pages ({companies.length})
          </h2>
        </div>

        {companies.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-12 h-12 text-linkedin-border-gray mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-linkedin-text-dark mb-2">
              No company pages yet
            </h3>
            <p className="text-linkedin-text-gray mb-4">
              Create a company page to build your brand&apos;s presence
            </p>
            <Link
              href="/company/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-linkedin-blue text-white rounded-full hover:bg-linkedin-blue-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create your first company page
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-linkedin-border-gray">
            {companies.map((company) => (
              <Link
                key={company.id}
                href={`/company/${company.slug}`}
                className="flex items-center gap-4 p-4 hover:bg-linkedin-warm-gray transition-colors"
              >
                <div className="w-14 h-14 rounded-lg bg-white border border-linkedin-border-gray flex items-center justify-center overflow-hidden flex-shrink-0">
                  {company.logo ? (
                    <img
                      src={company.logo}
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-7 h-7 text-linkedin-text-gray" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-linkedin-text-dark truncate">
                      {company.name}
                    </h3>
                    <div className="flex items-center gap-1" title={company.userRole}>
                      {getRoleIcon(company.userRole)}
                    </div>
                  </div>
                  {company.headline && (
                    <p className="text-sm text-linkedin-text-gray truncate">
                      {company.headline}
                    </p>
                  )}
                  <p className="text-xs text-linkedin-text-gray mt-1">
                    {company.memberCount} member{company.memberCount !== 1 ? "s" : ""} •{" "}
                    {company.postCount} post{company.postCount !== 1 ? "s" : ""}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
