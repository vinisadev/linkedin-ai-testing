import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-linkedin-warm-gray">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="hidden lg:block">
              <Sidebar />
            </aside>
            <main className="lg:col-span-2">{children}</main>
            <aside className="hidden lg:block">
              {/* Right sidebar - news, ads, etc. */}
            </aside>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
