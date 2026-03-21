export interface Property {
  address: string;
  price: number;
  sqft: number;
  ppsf: number;
  lotSqft: number;
  lotAcres?: number;
  beds: number;
  baths: number;
  stories: number;
  yearBuilt: number;
  hoa: number | null;
  soldDate: number;
  soldDateStr?: string;
  soldMonth?: string;
  subdivision: string;
  url: string;
  dom: number | null;
  mlsId: string;
  zip: string;
  score: number;
  totalScore?: number;
  visualScore?: number;
  exteriorScore?: number;
  interiorScore?: number;
  lotScore?: number;
  visualNotes?: string;
  visualFeatures?: string[];
  mlsDescription?: string;
  mlsFeatures?: string;
  hasPool?: boolean;
  isWaterfront?: boolean;
  isRenovated?: boolean;
}

export type SortField = 'totalScore' | 'price' | 'ppsf' | 'sqft' | 'yearBuilt' | 'lotAcres';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  minSqft: number;
  pool: boolean | null;
  waterfront: boolean | null;
  subdivision: string;
  sortBy: SortField;
  sortOrder: SortOrder;
}
