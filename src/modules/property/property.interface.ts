export interface IProperty {
  title: string;
  description: string;

  price: number;

  bedrooms: number;
  bathrooms: number;
  address: string;
  city: string;
  area?: string;

  latitude?: number;
  longitude?: number;

  amenities?: string[];

  thumbnail?: string;
}