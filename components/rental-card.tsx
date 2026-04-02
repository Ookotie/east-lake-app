"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "./score-badge";
import { FavoriteButton } from "./favorite-button";
import type { RentalListing } from "@/lib/types";

export function RentalCard({
  rental,
  rank,
}: {
  rental: RentalListing;
  rank?: number;
}) {
  const r = rental;
  const zilUrl = r.url.startsWith("http")
    ? r.url
    : `https://www.zillow.com${r.url}`;

  return (
    <a href={zilUrl} target="_blank" rel="noopener noreferrer">
      <Card className="overflow-hidden hover:shadow-lg transition-shadow active:scale-[0.98] cursor-pointer">
        <div className="p-4 space-y-2">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {rank && (
                <span className="text-xs font-bold text-slate-400 mr-2">
                  #{rank}
                </span>
              )}
              <span className="text-sm font-semibold text-slate-900">
                {r.address.split(",")[0]}
              </span>
              {r.buildingName && (
                <div className="text-xs text-slate-500">{r.buildingName}</div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <FavoriteButton id={r.zpid} />
              <ScoreBadge score={r.score} size="sm" />
            </div>
          </div>

          {/* Price */}
          <div className="text-lg font-bold text-blue-600">
            ${r.price.toLocaleString()}/mo
            {r.ppsf && (
              <span className="text-sm font-normal text-slate-400 ml-2">
                ${r.ppsf.toFixed(2)}/sf
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex items-center gap-3 text-sm text-slate-700">
            {r.beds && <span className="font-semibold">{r.beds}bd</span>}
            {r.baths && <span className="font-semibold">/ {r.baths}ba</span>}
            {r.sqft && <span>{r.sqft.toLocaleString()} sf</span>}
            {r.yearBuilt && (
              <span className="text-slate-400">{r.yearBuilt}</span>
            )}
          </div>

          {/* Tags */}
          <div className="flex gap-1.5 flex-wrap items-center">
            <Badge
              variant="secondary"
              className="text-xs px-2 py-0.5 font-medium capitalize"
            >
              {r.homeType === "unknown" ? r.source : r.homeType}
            </Badge>
            {r.hasPool && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 font-medium"
              >
                Pool
              </Badge>
            )}
            {r.isWaterfront && (
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 font-medium"
              >
                Waterfront
              </Badge>
            )}
            <span className="text-xs text-slate-400">
              ZIP {r.zip}
            </span>
          </div>

          {/* Map link */}
          <div className="flex items-center gap-2 pt-1">
            <a
              href={`https://www.google.com/maps/place/${encodeURIComponent(r.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Map
            </a>
          </div>
        </div>
      </Card>
    </a>
  );
}
