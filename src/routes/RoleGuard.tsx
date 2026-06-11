import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getRole } from "../auth/getRole";

export default function RoleGuard({
  children,
  role,
}: {
  children: ReactNode;
  role: "ADMIN" | "USER" | "VIEWER";
}) {
  const currentRole = getRole();

  if (currentRole !== role && currentRole !== "ADMIN") {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}