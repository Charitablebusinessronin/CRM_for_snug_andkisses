export type UserRole = "admin" | "client" | "employee" | "contractor";

export function canAccessRoute(pathname: string, role: UserRole | undefined): boolean {
  // Public routes
  if (pathname === "/" || pathname.startsWith("/signin")) return true;

  // Role-gated dashboards
  const routeToRole: Record<string, UserRole> = {
    "/admin-dashboard": "admin",
    "/client-dashboard": "client",
    "/employee-dashboard": "employee",
    "/contractor-dashboard": "contractor",
  };

  const requiredRole = routeToRole[pathname];
  if (!requiredRole) return true;
  return role === requiredRole;
}


