export interface Property {
  id: string;
  title: string;
  category: string;
  deal: string;
  price: number;
  currency: string;
  city: string;
  district: string;
  address: string;
  area: number;
  plot?: number;
  lat?: number;
  lng?: number;
  rooms?: number;
  floor?: number;
  floors?: number;
  condition: string;
  description: string;
  features: string[];
  photos: string[];
  date: string;
  status: string;
  contact: {
    name: string;
    role: string;
    phone: string;
    lat?: string;
    lng?: string;
  };
}

export interface ListingDraft {
  [key: string]: string | string[];
  deal: string;
  category: string;
  city: string;
  district: string;
  address: string;
  area: string;
  rooms: string;
  floor: string;
  floors: string;
  condition: string;
  price: string;
  photos: string[];
  title: string;
  description: string;
  name: string;
  phone: string;
  id?: string;
  date?: string;
}

export type PageName =
  | 'home'
  | 'catalog'
  | 'property'
  | 'valuation'
  | 'ai-search'
  | 'favorites'
  | 'compare'
  | 'create-listing'
  | 'profile'
  | 'login';
