"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboarding-store";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const reset = useOnboardingStore((state) => state.reset);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // Reset onboarding state when page loads
    reset();
  }, [reset]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-linkedin-text-gray">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <OnboardingWizard userName={session.user?.name || ""} />;
}
