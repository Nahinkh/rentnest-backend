export type SortOrder = "asc" | "desc";

export interface PaginationOptions {
  page?: number;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}