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

export interface ActiveListing {
  address: string;
  price: number;
  sqft: number;
  ppsf: number;
  lotSqft: number | null;
  lotAcres?: number | null;
  beds: number | null;
  baths: number | null;
  stories: number | null;
  yearBuilt: number | null;
  hoa: number | null;
  dom: number | null;
  subdivision: string;
  url: string;
  mlsId: string;
  zip: string;
  lat: number | null;
  lon: number | null;
  isActive: boolean;
  hasPool: boolean;
  isWaterfront: boolean;
  isConservation: boolean;
  listingAgent: string;
  garageSpaces: number | null;
  propertyId: number | null;
  score: number;
  compAvgPpsf?: number;
  compDiscount?: number;
  valueAssessment?: string;
  estimatedFairValue?: number;
  priceDelta?: number;
  marketMedianPpsf?: number;
  comps?: {
    address: string;
    price: number;
    sqft: number;
    ppsf: number;
    soldDate: string;
    beds: number | null;
    baths: number | null;
    yearBuilt: number | null;
  }[];
}

export interface RentalListing {
  address: string;
  buildingName: string | null;
  price: number;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  yearBuilt: number | null;
  lat: number | null;
  lon: number | null;
  zip: string;
  url: string;
  zpid: string;
  lotSqft: number | null;
  lotAcres: number | null;
  hasPool: boolean;
  isWaterfront: boolean;
  dom: number | null;
  homeType: string;
  source: string;
  isBuilding: boolean;
  score: number;
  ppsf?: number;
}

export interface ChangesData {
  date: string;
  forSale: {
    total: number;
    new: ChangeListing[];
    removed: ChangeListing[];
    priceChanges: PriceChange[];
  };
  rentals: {
    total: number;
    new: ChangeListing[];
    removed: ChangeListing[];
    priceChanges: PriceChange[];
  };
  stats: MarketStats;
}

export interface ChangeListing {
  address: string;
  price: number;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  score: number;
  url: string;
  mlsId?: string;
  zpid?: string;
}

export interface PriceChange {
  address: string;
  oldPrice: number;
  newPrice: number;
  pctChange: number;
  score: number;
  dom: number | null;
  url: string;
  mlsId?: string;
  zpid?: string;
}

export interface MarketStats {
  forSaleCount: number;
  rentalCount: number;
  medianSalePrice: number;
  medianPpsf: number;
  medianRent: number;
  avgDom: number;
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
