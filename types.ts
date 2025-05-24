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
  shopId: number;
  verified: boolean;
  password: string | null | undefined;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdByUser?: User;
  updatedByUser?: User;
  shop?: Shop;
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

export interface Shop {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdByUser?: User;
  updatedByUser?: User;
}

export interface Purchase {
  id: number;
  date: string;
  amount: number;
  isDeclared: boolean;
  invoiceNumber?: string;
  comment?: string;
  shopId: number;
  supplierId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdByUser?: User;
  updatedByUser?: User;
  shop?: Shop;
  supplier?: Supplier;
  supplierName?: string;
}

export interface Draw {
  id: number;
  date: string;
  cashAmount: number;
  totalAmount: number;
  plusMinus: number;
  systemAmount: number;
  comment?: string;
  shopId: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  createdBy: string;
  updatedBy: string;
  createdByUser?: User;
  updatedByUser?: User;
  shop?: Shop;
}
