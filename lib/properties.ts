import top50Data from "@/data/top50-final.json";
import allData from "@/data/all-properties-scored.json";
import type { Property, FilterState } from "./types";

export const top50: Property[] = top50Data as Property[];
export const allProperties: Property[] = allData as Property[];

export function getProperty(id: string): Property | undefined {
  return [...top50, ...allProperties].find(
    (p) => slugify(p.address) === id || p.mlsId === id
  );
}

export function slugify(address: string): string {
  return address
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getRedfinUrl(p: Property): string {
  return p.url ? `https://www.redfin.com${p.url}` : "";
}

export function filterProperties(
  properties: Property[],
  filters: Partial<FilterState>
): Property[] {
  let result = [...properties];

  if (filters.minPrice)
    result = result.filter((p) => p.price >= filters.minPrice!);
  if (filters.maxPrice)
    result = result.filter((p) => p.price <= filters.maxPrice!);
  if (filters.minSqft)
    result = result.filter((p) => p.sqft >= filters.minSqft!);
  if (filters.pool === true)
    result = result.filter((p) => p.hasPool);
  if (filters.waterfront === true)
    result = result.filter((p) => p.isWaterfront);
  if (filters.subdivision)
    result = result.filter((p) => p.subdivision === filters.subdivision);

  const sortBy = filters.sortBy || "totalScore";
  const sortOrder = filters.sortOrder || "desc";
  const dir = sortOrder === "desc" ? -1 : 1;

  result.sort((a, b) => {
    const aVal = (a[sortBy] as number) ?? 0;
    const bVal = (b[sortBy] as number) ?? 0;
    return (aVal - bVal) * dir;
  });

  return result;
}

export function getSubdivisions(properties: Property[]): string[] {
  const subs = new Set(properties.map((p) => p.subdivision).filter(Boolean));
  return Array.from(subs).sort();
}

export function getMarketStats(properties: Property[]) {
  const prices = properties.map((p) => p.price).sort((a, b) => a - b);
  const ppsf = properties.map((p) => p.ppsf).filter(Boolean);
  const sqfts = properties.map((p) => p.sqft);

  return {
    count: properties.length,
    medianPrice: prices[Math.floor(prices.length / 2)],
    avgPrice: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
    avgPpsf: Math.round(ppsf.reduce((a, b) => a + b, 0) / ppsf.length),
    minPrice: prices[0],
    maxPrice: prices[prices.length - 1],
    avgSqft: Math.round(sqfts.reduce((a, b) => a + b, 0) / sqfts.length),
    poolCount: properties.filter((p) => p.hasPool).length,
    waterfrontCount: properties.filter((p) => p.isWaterfront).length,
  };
}

export function getSalesByMonth(properties: Property[]) {
  const months: Record<string, number> = {};
  for (const p of properties) {
    if (p.soldMonth) {
      months[p.soldMonth] = (months[p.soldMonth] || 0) + 1;
    }
  }
  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, count }));
}

export function findComps(
  target: Property,
  sold: Property[],
  limit = 5
): Property[] {
  return sold
    .filter((p) => p.address !== target.address)
    .map((p) => ({
      ...p,
      _distance:
        Math.abs(p.sqft - target.sqft) / target.sqft +
        Math.abs(p.price - target.price) / target.price +
        (p.zip === target.zip ? 0 : 0.3),
    }))
    .sort((a, b) => a._distance - b._distance)
    .slice(0, limit);
}

export function formatPrice(price: number): string {
  if (price >= 1_000_000) return `$${(price / 1_000_000).toFixed(2)}M`;
  return `$${(price / 1_000).toFixed(0)}K`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString();
}
