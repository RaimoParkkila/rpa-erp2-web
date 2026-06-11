export type UserRole = "ADMIN" | "USER" | "VIEWER";

export function getRole(): UserRole {
  return (localStorage.getItem("role") as UserRole) || "USER";
}

export function isAdmin() {
  return getRole() === "ADMIN";
}