import { Navbar } from "@/components/layout/navbar";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function MessagingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-linkedin-warm-gray">
        <Navbar />
        <main className="h-[calc(100vh-56px)]">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
