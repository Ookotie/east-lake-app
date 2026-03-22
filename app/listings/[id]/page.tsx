"use client";

import { use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/score-badge";
import { Separator } from "@/components/ui/separator";
import { activeListings, slugify, formatPrice } from "@/lib/properties";
import Link from "next/link";

export default function ListingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const listing = activeListings.find((l) => slugify(l.address) === id);

  if (!listing) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-lg font-bold text-slate-900">Listing not found</h1>
        <Link href="/listings" className="text-blue-600 text-sm mt-2 inline-block">Back to listings</Link>
      </div>
    );
  }

  const l = listing;
  const redfinUrl = l.url ? `https://www.redfin.com${l.url}` : "";

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-blue-100 to-slate-200 p-6 pt-12">
        <Link href="/listings" className="absolute top-3 left-3 bg-black/50 text-white p-2 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <div className="absolute top-3 right-3">
          <ScoreBadge score={l.score} size="lg" />
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold text-slate-900">{formatPrice(l.price)}</div>
          <div className="flex items-center gap-2 mt-1 text-sm">
            <span className="text-slate-500">${l.ppsf}/sf</span>
            {l.compAvgPpsf && (
              <span className={`font-medium ${l.ppsf <= l.compAvgPpsf ? "text-emerald-600" : "text-red-500"}`}>
                vs ${l.compAvgPpsf}/sf comps
              </span>
            )}
          </div>
          {l.valueAssessment && (
            <ValueBadge assessment={l.valueAssessment} />
          )}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Address */}
        <div>
          <h1 className="text-lg font-bold text-slate-900">{l.address}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{l.subdivision}</p>
          <div className="flex items-center gap-2 mt-2">
            {redfinUrl && (
              <a
                href={redfinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-red-50 text-red-700 font-medium border border-red-200"
              >
                Redfin
              </a>
            )}
            <a
              href={`https://www.zillow.com/homes/${encodeURIComponent(l.address.replace(/,/g, "").replace(/ /g, "-"))}_rb/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-medium border border-blue-200"
            >
              Zillow
            </a>
            <a
              href={`https://maps.apple.com/?q=${encodeURIComponent(l.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 font-medium border border-slate-200"
            >
              Apple Maps
            </a>
            <a
              href={`https://www.google.com/maps/place/${encodeURIComponent(l.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 font-medium border border-emerald-200"
            >
              Google Maps
            </a>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Beds/Baths" value={`${l.beds || "?"}/${l.baths || "?"}`} />
          <StatBox label="Sq Ft" value={l.sqft?.toLocaleString() || "—"} />
          <StatBox label="$/SqFt" value={`$${l.ppsf}`} />
          <StatBox label="Year Built" value={l.yearBuilt ? String(l.yearBuilt) : "—"} />
          <StatBox label="Lot" value={l.lotAcres ? `${l.lotAcres.toFixed(2)} ac` : "—"} />
          <StatBox label="HOA" value={l.hoa ? `$${l.hoa}/mo` : "None"} />
        </div>

        {/* Features */}
        <div className="flex gap-2 flex-wrap">
          {l.hasPool && <Badge className="bg-emerald-100 text-emerald-700">Pool</Badge>}
          {l.isWaterfront && <Badge className="bg-blue-100 text-blue-700">Waterfront</Badge>}
          {l.isConservation && <Badge className="bg-amber-100 text-amber-700">Conservation Lot</Badge>}
          {l.hoa === null && <Badge className="bg-amber-100 text-amber-700">No HOA</Badge>}
          {(l.garageSpaces ?? 0) >= 3 && <Badge className="bg-slate-100 text-slate-700">{l.garageSpaces}-Car Garage</Badge>}
        </div>

        {/* Value Analysis */}
        <Card className={l.priceDelta && l.priceDelta < 0 ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}>
          <CardContent className="p-4">
            <h3 className="text-base font-semibold text-slate-700 mb-2">Value Analysis</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-slate-500">Asking $/sf</span>
              <span className="text-right font-medium">${l.ppsf}</span>

              <span className="text-slate-500">Comp avg $/sf</span>
              <span className="text-right font-medium">${l.compAvgPpsf || "—"}</span>

              <span className="text-slate-500">Market median $/sf</span>
              <span className="text-right font-medium">${l.marketMedianPpsf || "—"}</span>

              {l.estimatedFairValue && (
                <>
                  <span className="text-slate-500">Est. fair value</span>
                  <span className="text-right font-bold">{formatPrice(l.estimatedFairValue)}</span>
                </>
              )}

              {l.priceDelta !== undefined && (
                <>
                  <span className="text-slate-500">Delta</span>
                  <span className={`text-right font-bold ${l.priceDelta > 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {l.priceDelta > 0 ? "+" : ""}{formatPrice(Math.abs(l.priceDelta))}
                    {l.priceDelta > 0 ? " over" : " under"}
                  </span>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Listing Details */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-base font-semibold text-slate-700 mb-2">Listing Details</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600">
              <span>MLS #</span><span className="text-right font-medium">{l.mlsId || "—"}</span>
              <span>Days on Market</span>
              <span className={`text-right font-medium ${(l.dom ?? 0) >= 90 ? "text-amber-600" : ""}`}>
                {l.dom ?? "—"}
              </span>
              <span>Listing Agent</span><span className="text-right font-medium">{l.listingAgent || "—"}</span>
              <span>ZIP</span><span className="text-right font-medium">{l.zip}</span>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Comparable Sold Properties */}
        {l.comps && l.comps.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Similar Sold Properties (Comps)</h3>
            <div className="space-y-2">
              {l.comps.map((c) => (
                <Card key={c.address}>
                  <CardContent className="p-3 flex justify-between items-center">
                    <div>
                      <div className="text-sm font-medium text-slate-900 truncate max-w-[220px]">{c.address}</div>
                      <div className="text-sm text-slate-500">
                        {c.sqft?.toLocaleString()} sf · {c.yearBuilt} · {c.beds}bd/{c.baths}ba
                      </div>
                      {c.soldDate && <div className="text-sm text-slate-400">Sold {c.soldDate}</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{formatPrice(c.price)}</div>
                      <div className="text-sm text-slate-500">${c.ppsf}/sf</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="h-20" />
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 text-center">
      <div className="text-base font-bold text-slate-900">{value}</div>
      <div className="text-[10px] text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}

function ValueBadge({ assessment }: { assessment: string }) {
  const colors: Record<string, string> = {
    "Strong Value": "bg-emerald-100 text-emerald-700",
    "Good Value": "bg-blue-100 text-blue-700",
    "Fair Price": "bg-slate-100 text-slate-600",
    "Slightly Overpriced": "bg-amber-100 text-amber-700",
    "Overpriced": "bg-red-100 text-red-700",
  };
  return (
    <span className={`inline-block mt-2 text-sm px-3 py-1 rounded-full font-medium ${colors[assessment] || colors["Fair Price"]}`}>
      {assessment}
    </span>
  );
}
