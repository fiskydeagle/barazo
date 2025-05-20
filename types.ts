export type DataTableColumnsType = {
  key: string;
  label: string;
  class?: string;
  isVisible?: boolean;
};

export enum UserRole {
  SUPERADMIN = "superadmin",
  ADMIN = "admin",
  EMPLOYEE = "employee",
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  city?: string;
  address?: string;
  tel?: string;
  role: UserRole;
  verified: boolean;
  password: string | null | undefined;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdByUser?: User;
  updatedByUser?: User;
}

export interface Supplier {
  id: number;
  company: string;
  city: string;
  address: string;
  tel: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdByUser?: User;
  updatedByUser?: User;
}
