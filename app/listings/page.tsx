"use client";

import { useState, useMemo } from "react";
import { ListingCard } from "@/components/listing-card";
import { activeListings } from "@/lib/properties";
import type { ActiveListing } from "@/lib/types";

type SortKey = "score" | "price" | "ppsf" | "sqft" | "dom" | "yearBuilt";

const sortOptions: { value: SortKey; label: string; order: "desc" | "asc" }[] = [
  { value: "score", label: "Best Deal", order: "desc" },
  { value: "dom", label: "Newest Listed", order: "asc" },
  { value: "price", label: "Price: Low", order: "asc" },
  { value: "price", label: "Price: High", order: "desc" },
  { value: "ppsf", label: "$/SF: Low", order: "asc" },
  { value: "dom", label: "Most Negotiable", order: "desc" },
  { value: "sqft", label: "Largest", order: "desc" },
  { value: "yearBuilt", label: "Newest Built", order: "desc" },
];

export default function ListingsPage() {
  const [sortIndex, setSortIndex] = useState(0);
  const [poolOnly, setPoolOnly] = useState(false);
  const [waterfrontOnly, setWaterfrontOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [valueOnly, setValueOnly] = useState(false);

  const filtered = useMemo(() => {
    let result = [...activeListings];
    if (poolOnly) result = result.filter((l) => l.hasPool);
    if (waterfrontOnly) result = result.filter((l) => l.isWaterfront);
    if (maxPrice) result = result.filter((l) => l.price <= maxPrice);
    if (valueOnly) result = result.filter((l) =>
      l.valueAssessment === "Strong Value" || l.valueAssessment === "Good Value"
    );

    const sort = sortOptions[sortIndex];
    const dir = sort.order === "desc" ? -1 : 1;
    result.sort((a, b) => {
      const aVal = (a[sort.value as keyof ActiveListing] as number) ?? 0;
      const bVal = (b[sort.value as keyof ActiveListing] as number) ?? 0;
      return (aVal - bVal) * dir;
    });

    return result;
  }, [sortIndex, poolOnly, waterfrontOnly, maxPrice, valueOnly]);

  const stats = useMemo(() => {
    const prices = activeListings.map((l) => l.ppsf);
    const avgPpsf = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const strongDeals = activeListings.filter(
      (l) => l.valueAssessment === "Strong Value" || l.valueAssessment === "Good Value"
    ).length;
    const newCount = activeListings.filter((l) => (l.dom ?? 999) <= 7).length;
    return { avgPpsf, total: activeListings.length, strongDeals, newCount };
  }, []);

  return (
    <div className="p-4 space-y-4">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-slate-900">For Sale</h1>
        <p className="text-sm text-slate-500 mt-1">
          {stats.total} active listings · avg ${stats.avgPpsf}/sf · {stats.strongDeals} deals
          {stats.newCount > 0 && (
            <span className="text-emerald-600 font-medium"> · {stats.newCount} new this week</span>
          )}
        </p>
      </div>

      {/* Sort */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
        {sortOptions.map((opt, i) => (
          <button
            key={`${opt.value}-${opt.order}`}
            onClick={() => setSortIndex(i)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
          onClick={() => setValueOnly(!valueOnly)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            valueOnly
              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
              : "bg-white text-slate-500 border border-slate-200"
          }`}
        >
          Deals Only {valueOnly && "✓"}
        </button>
        <button
          onClick={() => setPoolOnly(!poolOnly)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            poolOnly
              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
              : "bg-white text-slate-500 border border-slate-200"
          }`}
        >
          Pool {poolOnly && "✓"}
        </button>
        <button
          onClick={() => setWaterfrontOnly(!waterfrontOnly)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
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
      <div className="text-sm text-slate-500">
        {filtered.length} listings
      </div>

      {/* Results */}
      <div className="space-y-3">
        {filtered.map((l, i) => (
          <ListingCard key={l.mlsId || l.address} listing={l} rank={i + 1} />
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            No listings match your filters
          </div>
        )}
      </div>
    </div>
  );
}
