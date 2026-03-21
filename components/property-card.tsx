"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "./score-badge";
import { slugify, formatPrice } from "@/lib/properties";
import type { Property } from "@/lib/types";

function FeatureIcon({ label, active }: { label: string; active?: boolean }) {
  if (!active) return null;
  return (
    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-medium">
      {label}
    </Badge>
  );
}

export function PropertyCard({ property, rank }: { property: Property; rank?: number }) {
  const p = property;
  const photoIndex = rank && rank <= 20 ? String(rank).padStart(2, "0") : null;
  const hasPhoto = photoIndex !== null;

  return (
    <Link href={`/properties/${slugify(p.address)}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow active:scale-[0.98] cursor-pointer">
        {/* Photo or gradient placeholder */}
        <div className="relative h-40 bg-gradient-to-br from-slate-200 to-slate-300">
          {hasPhoto && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/photos/prop-${photoIndex}.png`}
              alt={p.address}
              className="w-full h-full object-cover"
            />
          )}
          {!hasPhoto && (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 7.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
              </svg>
            </div>
          )}

          {/* Score badge overlay */}
          <div className="absolute top-2 right-2">
            <ScoreBadge score={p.totalScore || p.score} size="sm" />
          </div>

          {/* Rank badge */}
          {rank && (
            <div className="absolute top-2 left-2 bg-black/60 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              #{rank}
            </div>
          )}

          {/* Price overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2">
            <div className="text-white font-bold text-lg">{formatPrice(p.price)}</div>
          </div>
        </div>

        {/* Details */}
        <div className="p-3 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-medium text-slate-900 truncate flex-1">{p.address}</span>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`}
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

          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="font-semibold">{p.beds}bd / {p.baths}ba</span>
            <span>{p.sqft.toLocaleString()} sf</span>
            <span className="text-slate-400">${p.ppsf}/sf</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{p.yearBuilt}</span>
            <span>·</span>
            <span>{p.lotAcres ? `${p.lotAcres.toFixed(1)} ac` : ""}</span>
            {p.hoa ? (
              <>
                <span>·</span>
                <span>HOA ${p.hoa}/mo</span>
              </>
            ) : (
              <>
                <span>·</span>
                <span className="text-emerald-600 font-medium">No HOA</span>
              </>
            )}
          </div>

          <div className="flex gap-1 flex-wrap">
            <FeatureIcon label="Pool" active={p.hasPool} />
            <FeatureIcon label="Waterfront" active={p.isWaterfront} />
            <FeatureIcon label="Updated" active={p.isRenovated} />
          </div>
        </div>
      </Card>
    </Link>
  );
}
