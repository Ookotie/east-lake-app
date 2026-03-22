"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "./score-badge";
import { slugify, formatPrice } from "@/lib/properties";
import type { ActiveListing } from "@/lib/types";

function ValueBadge({ assessment }: { assessment?: string }) {
  if (!assessment) return null;
  const colors: Record<string, string> = {
    "Strong Value": "bg-emerald-100 text-emerald-700 border-emerald-300",
    "Good Value": "bg-blue-100 text-blue-700 border-blue-300",
    "Fair Price": "bg-slate-100 text-slate-600 border-slate-300",
    "Slightly Overpriced": "bg-amber-100 text-amber-700 border-amber-300",
    "Overpriced": "bg-red-100 text-red-700 border-red-300",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${colors[assessment] || colors["Fair Price"]}`}>
      {assessment}
    </span>
  );
}

export function ListingCard({ listing, rank }: { listing: ActiveListing; rank?: number }) {
  const l = listing;

  return (
    <Link href={`/listings/${slugify(l.address)}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow active:scale-[0.98] cursor-pointer">
        {/* Header with price and score */}
        <div className="relative bg-gradient-to-br from-blue-50 to-slate-100 p-4">
          {/* Score badge */}
          <div className="absolute top-3 right-3">
            <ScoreBadge score={l.score} size="sm" />
          </div>

          {/* Rank */}
          {rank && (
            <div className="absolute top-3 left-3 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              #{rank}
            </div>
          )}

          <div className="pt-6">
            <div className="text-2xl font-bold text-slate-900">{formatPrice(l.price)}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-slate-500">${l.ppsf}/sf</span>
              {l.compAvgPpsf && (
                <span className={`text-sm font-medium ${l.ppsf <= l.compAvgPpsf ? "text-emerald-600" : "text-red-500"}`}>
                  {l.ppsf <= l.compAvgPpsf ? "vs" : "vs"} ${l.compAvgPpsf}/sf comps
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-slate-900 truncate flex-1">{l.address}</span>
            <a
              href={`https://www.google.com/maps/place/${encodeURIComponent(l.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-500 hover:text-blue-700 shrink-0"
              aria-label="View on Google Maps"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </a>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-700">
            <span className="font-semibold">{l.beds}bd / {l.baths}ba</span>
            <span>{l.sqft?.toLocaleString()} sf</span>
            {l.yearBuilt && <span className="text-slate-400">{l.yearBuilt}</span>}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500">
            {l.lotAcres && <span>{l.lotAcres.toFixed(2)} ac</span>}
            {l.hoa ? (
              <>
                <span>·</span>
                <span>HOA ${l.hoa}/mo</span>
              </>
            ) : (
              <>
                <span>·</span>
                <span className="text-emerald-600 font-medium">No HOA</span>
              </>
            )}
            {l.dom != null && (
              <>
                <span>·</span>
                <span className={l.dom >= 90 ? "text-amber-600 font-medium" : ""}>
                  {l.dom} days
                </span>
              </>
            )}
          </div>

          {/* Tags row */}
          <div className="flex gap-1.5 flex-wrap items-center">
            <ValueBadge assessment={l.valueAssessment} />
            {l.hasPool && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium">Pool</Badge>
            )}
            {l.isWaterfront && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium">Waterfront</Badge>
            )}
            {l.isConservation && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5 font-medium bg-amber-50 text-amber-700">Conservation</Badge>
            )}
          </div>

          {/* Fair value comparison */}
          {l.estimatedFairValue && l.priceDelta !== undefined && (
            <div className={`text-xs font-medium ${l.priceDelta > 0 ? "text-red-500" : "text-emerald-600"}`}>
              Fair value est: {formatPrice(l.estimatedFairValue)}
              {l.priceDelta > 0 ? ` (+${formatPrice(l.priceDelta)} over)` : ` (${formatPrice(Math.abs(l.priceDelta))} under)`}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
