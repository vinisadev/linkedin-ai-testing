"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

interface AuthGuardProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export function AuthGuard({ children, requireOnboarding = true }: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "loading") return;

    // Not authenticated - redirect to login
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return;
    }

    // Authenticated but onboarding not complete
    if (requireOnboarding && session?.user && !session.user.onboardingComplete) {
      router.push("/onboarding");
      return;
    }
  }, [status, session, router, pathname, requireOnboarding]);

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linkedin-warm-gray">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-linkedin-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-linkedin-text-gray">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated or onboarding not complete - show nothing while redirecting
  if (status === "unauthenticated") {
    return null;
  }

  if (requireOnboarding && session?.user && !session.user.onboardingComplete) {
    return null;
  }

  return <>{children}</>;
}
