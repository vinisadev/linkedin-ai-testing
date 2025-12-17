"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Users,
  Settings,
  Trash2,
  UserPlus,
  ArrowLeft,
  Loader2,
  Crown,
  Shield,
  Edit3,
  MoreHorizontal,
  UserMinus,
  ArrowRightLeft,
} from "lucide-react";
import { InviteMemberModal } from "@/components/company/invite-member-modal";
import { TransferOwnershipModal } from "@/components/company/transfer-ownership-modal";

interface Member {
  id: string;
  role: "OWNER" | "ADMIN" | "EDITOR";
  user: {
    id: string;
    name: string | null;
    image: string | null;
    headline: string | null;
  };
}

interface Company {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  userRole: "OWNER" | "ADMIN" | "EDITOR" | null;
  members: Member[];
}

export default function ManageCompanyPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCompany = useCallback(async () => {
    try {
      const response = await fetch(`/api/companies/by-slug/${slug}`);
      if (!response.ok) {
        setError("Company not found");
        return;
      }
      const data = await response.json();

      if (!data.userRole || !["OWNER", "ADMIN"].includes(data.userRole)) {
        router.push(`/company/${slug}`);
        return;
      }

      setCompany(data);
    } catch (err) {
      setError("Failed to load company");
    } finally {
      setIsLoading(false);
    }
  }, [slug, router]);

  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  const handleRoleChange = async (memberId: string, newRole: "ADMIN" | "EDITOR") => {
    if (!company) return;

    try {
      const response = await fetch(
        `/api/companies/${company.id}/members/${memberId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (response.ok) {
        setCompany((prev) =>
          prev
            ? {
                ...prev,
                members: prev.members.map((m) =>
                  m.id === memberId ? { ...m, role: newRole } : m
                ),
              }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to update role:", error);
    }
    setActiveMenu(null);
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!company) return;

    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      const response = await fetch(
        `/api/companies/${company.id}/members/${memberId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setCompany((prev) =>
          prev
            ? {
                ...prev,
                members: prev.members.filter((m) => m.id !== memberId),
              }
            : null
        );
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
    setActiveMenu(null);
  };

  const handleDeleteCompany = async () => {
    if (!company) return;

    if (
      !confirm(
        `Are you sure you want to delete "${company.name}"? This action cannot be undone.`
      )
    )
      return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/companies/${company.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/feed");
      }
    } catch (error) {
      console.error("Failed to delete company:", error);
    } finally {
      setIsDeleting(false);
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

  if (error || !company) {
    return (
      <div className="card p-8 text-center">
        <Building2 className="w-12 h-12 text-linkedin-border-gray mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-linkedin-text-dark mb-2">
          {error || "Company not found"}
        </h2>
      </div>
    );
  }

  const isOwner = company.userRole === "OWNER";

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* Header */}
      <div className="card p-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/company/${company.slug}`}
            className="p-2 hover:bg-linkedin-warm-gray rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-linkedin-text-gray" />
          </Link>
          <div className="w-12 h-12 rounded-lg bg-white border border-linkedin-border-gray flex items-center justify-center overflow-hidden">
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <Building2 className="w-6 h-6 text-linkedin-text-gray" />
            )}
          </div>
          <div>
            <h1 className="text-xl font-semibold text-linkedin-text-dark">
              {company.name}
            </h1>
            <p className="text-sm text-linkedin-text-gray">Page management</p>
          </div>
        </div>
      </div>

      {/* Members Section */}
      <div className="card">
        <div className="p-4 border-b border-linkedin-border-gray flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-linkedin-text-gray" />
            <h2 className="font-semibold text-linkedin-text-dark">
              Page members ({company.members.length})
            </h2>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-3 py-1.5 bg-linkedin-blue text-white text-sm rounded-full hover:bg-linkedin-blue-hover transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
        </div>

        <div className="divide-y divide-linkedin-border-gray">
          {company.members.map((member) => (
            <div
              key={member.id}
              className="p-4 flex items-center justify-between"
            >
              <Link
                href={`/profile/${member.user.id}`}
                className="flex items-center gap-3"
              >
                <div className="w-12 h-12 rounded-full overflow-hidden bg-linkedin-blue flex items-center justify-center">
                  {member.user.image ? (
                    <img
                      src={member.user.image}
                      alt={member.user.name || "User"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white font-semibold">
                      {member.user.name?.[0]?.toUpperCase() || "U"}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium text-linkedin-text-dark hover:text-linkedin-blue hover:underline">
                    {member.user.name || "LinkedIn User"}
                  </p>
                  {member.user.headline && (
                    <p className="text-sm text-linkedin-text-gray line-clamp-1">
                      {member.user.headline}
                    </p>
                  )}
                </div>
              </Link>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm text-linkedin-text-gray">
                  {getRoleIcon(member.role)}
                  <span className="capitalize">{member.role.toLowerCase()}</span>
                </div>

                {/* Actions (only for non-owners, and only owner can manage) */}
                {member.role !== "OWNER" && isOwner && (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveMenu(activeMenu === member.id ? null : member.id)
                      }
                      className="p-2 hover:bg-linkedin-warm-gray rounded-full transition-colors"
                    >
                      <MoreHorizontal className="w-5 h-5 text-linkedin-text-gray" />
                    </button>

                    {activeMenu === member.id && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setActiveMenu(null)}
                        />
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-linkedin-border-gray z-20">
                          {member.role !== "ADMIN" && (
                            <button
                              onClick={() => handleRoleChange(member.id, "ADMIN")}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-linkedin-text-dark hover:bg-linkedin-warm-gray"
                            >
                              <Shield className="w-4 h-4" />
                              Make admin
                            </button>
                          )}
                          {member.role !== "EDITOR" && (
                            <button
                              onClick={() => handleRoleChange(member.id, "EDITOR")}
                              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-linkedin-text-dark hover:bg-linkedin-warm-gray"
                            >
                              <Edit3 className="w-4 h-4" />
                              Make editor
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveMember(member.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-linkedin-warm-gray"
                          >
                            <UserMinus className="w-4 h-4" />
                            Remove member
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Owner-only Settings */}
      {isOwner && (
        <div className="card">
          <div className="p-4 border-b border-linkedin-border-gray">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-linkedin-text-gray" />
              <h2 className="font-semibold text-linkedin-text-dark">
                Owner settings
              </h2>
            </div>
          </div>

          <div className="p-4 space-y-4">
            {/* Transfer Ownership */}
            <button
              onClick={() => setShowTransferModal(true)}
              className="w-full flex items-center gap-3 p-3 border border-linkedin-border-gray rounded-lg hover:bg-linkedin-warm-gray transition-colors text-left"
            >
              <ArrowRightLeft className="w-5 h-5 text-linkedin-text-gray" />
              <div>
                <p className="font-medium text-linkedin-text-dark">
                  Transfer ownership
                </p>
                <p className="text-sm text-linkedin-text-gray">
                  Transfer this page to another member
                </p>
              </div>
            </button>

            {/* Delete Company */}
            <button
              onClick={handleDeleteCompany}
              disabled={isDeleting}
              className="w-full flex items-center gap-3 p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left"
            >
              {isDeleting ? (
                <Loader2 className="w-5 h-5 text-red-500 animate-spin" />
              ) : (
                <Trash2 className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className="font-medium text-red-600">Delete company page</p>
                <p className="text-sm text-red-400">
                  This action cannot be undone
                </p>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteMemberModal
          companyId={company.id}
          companyName={company.name}
          onClose={() => setShowInviteModal(false)}
          onInvited={fetchCompany}
        />
      )}

      {/* Transfer Ownership Modal */}
      {showTransferModal && (
        <TransferOwnershipModal
          companyId={company.id}
          companyName={company.name}
          members={company.members.filter((m) => m.role !== "OWNER")}
          onClose={() => setShowTransferModal(false)}
          onTransferred={() => router.push(`/company/${company.slug}`)}
        />
      )}
    </div>
  );
}
