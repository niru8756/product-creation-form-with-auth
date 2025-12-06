import {
  ExternalProductIdType,
  InventoryStrategyType,
  PriceStrategyType,
} from "@prisma/client";
import { JsonValue } from "@prisma/client/runtime/client";

export interface Assets {
  id: bigint;
  position: number;
  uri: string;
}

export interface Variant {
  id: bigint;
  sku: string;
  externalProductIdentifier: {
    id: bigint;
    storeId: bigint;
    variantId: bigint;
    type: ExternalProductIdType;
    value: string;
  }[];
  option: JsonValue;
  extraData: JsonValue;
  channels: string[];
  assets: Assets[];
}

// User API Types
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: bigint;
  email: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

// Product API Types
export interface CreateProductRequest {
  name: string;
  description?: string;
  price?: number;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
}

export interface ProductResponse {
  id: bigint;
  title: string;
  description: string;
  status: "ACTIVE" | "INACTIVE" | "DELETED" | "DRAFT";
  hsnCode: string;
  storeId: bigint;
  subCategoryId: bigint;
  categoryId: bigint;
  inventoryStrategy: InventoryStrategyType | null;
  priceStrategy: PriceStrategyType | null;
  originCountry: string | null;
  variants: Variant[];
  assets: Assets[];
}

// Pagination Types
export interface PaginationParams {
  page?: number;
  limit?: number;
}

export type PaginatedResponse<T, K extends string = "data"> = {
  [P in K]: T[];
} & {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type VariantAttributeType =
  | "size"
  | "color"
  | "flavor"
  | "numberOfItems"
  | "itemWeight"
  | "scent";
