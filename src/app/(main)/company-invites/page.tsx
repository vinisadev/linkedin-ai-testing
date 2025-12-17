"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, X, Loader2, Mail } from "lucide-react";

interface CompanyInvite {
  id: string;
  role: "ADMIN" | "EDITOR";
  expiresAt: string;
  company: {
    id: string;
    name: string;
    logo: string | null;
    headline: string | null;
  };
}

export default function CompanyInvitesPage() {
  const router = useRouter();
  const [invites, setInvites] = useState<CompanyInvite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  useEffect(() => {
    fetchInvites();
  }, []);

  const fetchInvites = async () => {
    try {
      const response = await fetch("/api/company-invites");
      if (response.ok) {
        const data = await response.json();
        setInvites(data);
      }
    } catch (error) {
      console.error("Failed to fetch invites:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRespond = async (inviteId: string, action: "accept" | "reject") => {
    setRespondingTo(inviteId);

    try {
      const response = await fetch(`/api/company-invites/${inviteId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const data = await response.json();
        setInvites((prev) => prev.filter((i) => i.id !== inviteId));

        if (action === "accept" && data.companyId) {
          router.push(`/company/${data.companyId}`);
        }
      }
    } catch (error) {
      console.error("Failed to respond to invite:", error);
    } finally {
      setRespondingTo(null);
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
    <div className="max-w-2xl mx-auto">
      <div className="card">
        <div className="p-4 border-b border-linkedin-border-gray">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-linkedin-blue" />
            <h1 className="text-xl font-semibold text-linkedin-text-dark">
              Company Page Invitations
            </h1>
          </div>
          <p className="text-sm text-linkedin-text-gray mt-1">
            Manage your pending invitations to company pages
          </p>
        </div>

        {invites.length === 0 ? (
          <div className="p-8 text-center">
            <Building2 className="w-12 h-12 text-linkedin-border-gray mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-linkedin-text-dark mb-2">
              No pending invitations
            </h2>
            <p className="text-linkedin-text-gray">
              When someone invites you to manage a company page, it will appear
              here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-linkedin-border-gray">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-white border border-linkedin-border-gray flex items-center justify-center overflow-hidden">
                    {invite.company.logo ? (
                      <img
                        src={invite.company.logo}
                        alt={invite.company.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-7 h-7 text-linkedin-text-gray" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-linkedin-text-dark">
                      {invite.company.name}
                    </h3>
                    {invite.company.headline && (
                      <p className="text-sm text-linkedin-text-gray">
                        {invite.company.headline}
                      </p>
                    )}
                    <p className="text-sm text-linkedin-text-gray">
                      Invited as{" "}
                      <span className="font-medium capitalize">
                        {invite.role.toLowerCase()}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRespond(invite.id, "reject")}
                    disabled={respondingTo === invite.id}
                    className="p-2 text-linkedin-text-gray hover:text-red-600 hover:bg-red-50 rounded-full transition-colors disabled:opacity-50"
                    title="Decline"
                  >
                    {respondingTo === invite.id ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={() => handleRespond(invite.id, "accept")}
                    disabled={respondingTo === invite.id}
                    className="flex items-center gap-2 px-4 py-2 bg-linkedin-blue text-white rounded-full hover:bg-linkedin-blue-hover disabled:opacity-50 transition-colors"
                  >
                    {respondingTo === invite.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Accept
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
