import { AdminSidebar } from "@/features/admin/components/admin-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Outlet } from "@tanstack/react-router";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar />
      <main>{children ? children : <Outlet />}</main>
    </SidebarProvider>
  );
}
