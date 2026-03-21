"use client";

import { useState, useMemo } from "react";
import { PropertyCard } from "@/components/property-card";
import { Badge } from "@/components/ui/badge";
import { top50 } from "@/lib/properties";
import type { Property, SortField } from "@/lib/types";

const sortOptions: { value: SortField; label: string; order: "desc" | "asc" }[] = [
  { value: "totalScore", label: "Best Value", order: "desc" },
  { value: "price", label: "Price: Low", order: "asc" },
  { value: "price", label: "Price: High", order: "desc" },
  { value: "ppsf", label: "$/SF: Low", order: "asc" },
  { value: "sqft", label: "Largest", order: "desc" },
  { value: "yearBuilt", label: "Newest", order: "desc" },
];

export default function BrowsePage() {
  const [sortIndex, setSortIndex] = useState(0);
  const [poolOnly, setPoolOnly] = useState(false);
  const [waterfrontOnly, setWaterfrontOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const filtered = useMemo(() => {
    let result = [...top50];
    if (poolOnly) result = result.filter((p) => p.hasPool);
    if (waterfrontOnly) result = result.filter((p) => p.isWaterfront);
    if (maxPrice) result = result.filter((p) => p.price <= maxPrice);

    const sort = sortOptions[sortIndex];
    const dir = sort.order === "desc" ? -1 : 1;
    result.sort((a, b) => {
      const aVal = (a[sort.value] as number) ?? 0;
      const bVal = (b[sort.value] as number) ?? 0;
      return (aVal - bVal) * dir;
    });

    return result;
  }, [sortIndex, poolOnly, waterfrontOnly, maxPrice]);

  // Re-rank after filtering
  const originalRank = (p: Property) => top50.findIndex((t) => t.address === p.address) + 1;

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-slate-900 pt-2">Browse Properties</h1>

      {/* Sort */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {sortOptions.map((opt, i) => (
          <button
            key={i}
            onClick={() => setSortIndex(i)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              sortIndex === i
                ? "bg-blue-600 text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setPoolOnly(!poolOnly)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            poolOnly
              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
              : "bg-white text-slate-500 border border-slate-200"
          }`}
        >
          Pool {poolOnly && "✓"}
        </button>
        <button
          onClick={() => setWaterfrontOnly(!waterfrontOnly)}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            waterfrontOnly
              ? "bg-blue-100 text-blue-700 border border-blue-300"
              : "bg-white text-slate-500 border border-slate-200"
          }`}
        >
          Waterfront {waterfrontOnly && "✓"}
        </button>
        {[1000000, 1250000, 1500000].map((cap) => (
          <button
            key={cap}
            onClick={() => setMaxPrice(maxPrice === cap ? null : cap)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              maxPrice === cap
                ? "bg-purple-100 text-purple-700 border border-purple-300"
                : "bg-white text-slate-500 border border-slate-200"
            }`}
          >
            &lt;${cap / 1_000_000}M {maxPrice === cap && "✓"}
          </button>
        ))}
      </div>

      {/* Count */}
      <div className="text-xs text-slate-500">
        {filtered.length} properties
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filtered.map((p) => (
          <PropertyCard key={p.address} property={p} rank={originalRank(p)} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No properties match your filters
          </div>
        )}
      </div>
    </div>
  );
}
