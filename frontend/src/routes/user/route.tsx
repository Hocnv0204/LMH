import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/user")({
  component: UserLayout,
});

function UserLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}