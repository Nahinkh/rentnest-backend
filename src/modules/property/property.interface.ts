import { PaginationOptions } from "../../interfaces/pagination";
import { ICategory } from "../category/category.interface";

export interface IProperty {
    title: string;
  description: string;

  rentPrice: number;

  bedrooms: number;
  bathrooms: number;

  area?: number;

  address: string;
  city: string;
  division: string;

  latitude?: number;
  longitude?: number;

  category: string | ICategory;
}

export interface PropertyFilters {
  searchTerm?: string;
  city?: string;
  division?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface GetAllPropertyOptions {
  filters: PropertyFilters;

  pagination: PaginationOptions;
}


export interface IUpdateProperty {
  title?: string;
  description?: string;

  rentPrice?: number;

  bedrooms?: number;
  bathrooms?: number;

  area?: number;

  address?: string;
  city?: string;
  division?: string;

  latitude?: number;
  longitude?: number;

  category?: ICategory;
}