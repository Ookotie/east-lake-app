"use client";

import { useState, useEffect } from "react";
import { getFavorites } from "@/lib/favorites";
import { activeListings, rentalListings } from "@/lib/properties";
import { ListingCard } from "@/components/listing-card";
import { RentalCard } from "@/components/rental-card";

export default function SavedPage() {
  const [favIds, setFavIds] = useState<string[]>([]);

  useEffect(() => {
    setFavIds(getFavorites());
    // Re-check on storage changes (other tabs)
    const handler = () => setFavIds(getFavorites());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // Re-render when favorites change within this tab
  useEffect(() => {
    const interval = setInterval(() => {
      setFavIds(getFavorites());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const savedSales = activeListings.filter((l) => favIds.includes(l.mlsId));
  const savedRentals = rentalListings.filter((r) => favIds.includes(r.zpid));
  const empty = savedSales.length === 0 && savedRentals.length === 0;

  return (
    <div className="space-y-6 p-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900">Saved</h1>
        <p className="text-sm text-slate-500">
          {empty
            ? "Tap the heart icon on any listing to save it here"
            : `${savedSales.length + savedRentals.length} saved listings`}
        </p>
      </div>

      {empty && (
        <div className="text-center py-16 text-slate-400">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <p className="text-sm">No saved listings yet</p>
          <p className="text-xs mt-1">
            Browse For Sale or Rentals and tap the heart to save
          </p>
        </div>
      )}

      {savedSales.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            For Sale ({savedSales.length})
          </h2>
          <div className="space-y-3">
            {savedSales.map((l) => (
              <ListingCard key={l.mlsId} listing={l} />
            ))}
          </div>
        </div>
      )}

      {savedRentals.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-slate-900 mb-3">
            Rentals ({savedRentals.length})
          </h2>
          <div className="space-y-3">
            {savedRentals.map((r) => (
              <RentalCard key={r.zpid} rental={r} />
            ))}
          </div>
        </div>
      )}

      <div className="h-8" />
    </div>
  );
}
