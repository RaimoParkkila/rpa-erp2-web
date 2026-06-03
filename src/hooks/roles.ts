export type UserRole = "admin" | "user";

export function isAdmin(role?: string) {
  return role === "admin";
}

export function isUser(role?: string) {
  return role === "user";
}