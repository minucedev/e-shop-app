// utils/userUtils.ts
import { User } from "@/services/authApi";

export const getFullName = (user: User): string => {
  return `${user.firstName} ${user.lastName}`.trim();
};

export const getInitials = (user: User): string => {
  const firstName = user.firstName?.charAt(0)?.toUpperCase() || "";
  const lastName = user.lastName?.charAt(0)?.toUpperCase() || "";
  return `${firstName}${lastName}`;
};

export const formatUserRole = (roles: string[]): string => {
  return roles
    .map((role) => role.replace("ROLE_", ""))
    .map((role) => role.charAt(0) + role.slice(1).toLowerCase())
    .join(", ");
};

export const isCustomer = (user: User): boolean => {
  return user.roles.includes("ROLE_CUSTOMER");
};

export const isAdmin = (user: User): boolean => {
  return user.roles.includes("ROLE_ADMIN");
};
