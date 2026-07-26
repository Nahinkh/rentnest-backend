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

  category: {
    name: string;
    description?: string;
  };
}