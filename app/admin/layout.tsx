import type { Metadata } from "next";
import AdminProviders from "@/components/admin/AdminProviders";
import AdminShell from "@/components/admin/AdminShell";

export const metadata: Metadata = {
  title: "Admin Dashboard | GovCorp News",
  description: "GovCorp News Content Management & Administration System",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="notranslate" translate="no">
      <AdminProviders>
        <AdminShell>{children}</AdminShell>
      </AdminProviders>
    </div>
  );
}
