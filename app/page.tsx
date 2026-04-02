import { Card, CardContent } from "@/components/ui/card";
import { ListingCard } from "@/components/listing-card";
import { RentalCard } from "@/components/rental-card";
import {
  top50,
  allProperties,
  activeListings,
  rentalListings,
  changes,
  getMarketStats,
  formatPrice,
  getRedfinPhotoUrl,
  slugify,
} from "@/lib/properties";
import Link from "next/link";

function DaysCountdown() {
  const moveIn = new Date("2026-06-01");
  const now = new Date();
  const days = Math.ceil(
    (moveIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  const color =
    days <= 30 ? "text-red-600" : days <= 60 ? "text-amber-600" : "text-blue-600";
  return (
    <span className={`text-3xl font-bold ${color}`}>
      {days} <span className="text-base font-normal text-slate-500">days to move-in</span>
    </span>
  );
}

export default function Dashboard() {
  const allStats = getMarketStats(allProperties);
  const topListings = [...activeListings]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 5);
  const topRentals = rentalListings.slice(0, 3);
  // Newest listings = lowest DOM (just hit market)
  const newestForSale = [...activeListings]
    .sort((a, b) => (a.dom ?? 999) - (b.dom ?? 999))
    .slice(0, 5);
  const newListings = activeListings.filter((l) => (l.dom ?? 999) <= 7);
  // Newest rentals from changes data
  const newestRentals = changes?.rentals?.new?.slice(0, 3) ?? [];

  // Changes data
  const saleChanges = changes?.forSale;
  const rentalChanges = changes?.rentals;
  const hasChanges =
    (saleChanges?.new?.length ?? 0) > 0 ||
    (saleChanges?.removed?.length ?? 0) > 0 ||
    (saleChanges?.priceChanges?.length ?? 0) > 0 ||
    (rentalChanges?.new?.length ?? 0) > 0;

  return (
    <div className="space-y-6 p-4">
      {/* Header with countdown */}
      <div className="pt-2 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">East Lake Homes</h1>
          <p className="text-sm text-slate-500">
            ELHS zone &middot; {activeListings.length} for sale &middot;{" "}
            {rentalListings.length} rentals
          </p>
        </div>
        <DaysCountdown />
      </div>

      {/* Today's Changes */}
      {hasChanges && (
        <Card className="bg-slate-900 text-white border-0">
          <CardContent className="p-4 space-y-2">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Today&apos;s Changes
            </div>

            {/* For sale changes */}
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">For Sale:</span>
              {(saleChanges?.new?.length ?? 0) > 0 && (
                <span className="text-emerald-400">
                  +{saleChanges!.new.length} new
                </span>
              )}
              {(saleChanges?.removed?.length ?? 0) > 0 && (
                <span className="text-red-400">
                  -{saleChanges!.removed.length} removed
                </span>
              )}
              {(saleChanges?.priceChanges?.length ?? 0) > 0 && (
                <span className="text-amber-400">
                  {saleChanges!.priceChanges.length} price{" "}
                  {saleChanges!.priceChanges.length === 1 ? "drop" : "drops"}
                </span>
              )}
            </div>

            {/* Rental changes */}
            {((rentalChanges?.new?.length ?? 0) > 0 ||
              (rentalChanges?.removed?.length ?? 0) > 0) && (
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-400">Rentals:</span>
                {(rentalChanges?.new?.length ?? 0) > 0 && (
                  <span className="text-emerald-400">
                    +{rentalChanges!.new.length} new
                  </span>
                )}
                {(rentalChanges?.removed?.length ?? 0) > 0 && (
                  <span className="text-red-400">
                    -{rentalChanges!.removed.length} removed
                  </span>
                )}
              </div>
            )}

            {/* Price drops detail */}
            {(saleChanges?.priceChanges?.length ?? 0) > 0 && (
              <div className="pt-1 space-y-1">
                {saleChanges!.priceChanges.slice(0, 3).map((c) => (
                  <div
                    key={c.address}
                    className="text-xs text-amber-300 flex items-center gap-2"
                  >
                    <span className="truncate flex-1">
                      {c.address.split(",")[0]}
                    </span>
                    <span className="shrink-0">
                      {formatPrice(c.oldPrice)} &rarr; {formatPrice(c.newPrice)}{" "}
                      ({c.pctChange > 0 ? "+" : ""}
                      {c.pctChange.toFixed(1)}%)
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Newest For-Sale Listings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Newest For Sale
          </h2>
          <Link href="/listings" className="text-sm text-blue-600 font-medium">
            All {activeListings.length} &rarr;
          </Link>
        </div>
        <div className="space-y-3">
          {newestForSale.map((l) => (
            <ListingCard key={l.mlsId || l.address} listing={l} />
          ))}
        </div>
      </div>

      {/* Newest Rentals */}
      {topRentals.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900">
              Newest Rentals
            </h2>
            <Link href="/rentals" className="text-sm text-blue-600 font-medium">
              All {rentalListings.length} &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {topRentals.map((r, i) => (
              <RentalCard key={r.zpid} rental={r} rank={i + 1} />
            ))}
          </div>
        </div>
      )}

      {/* Market Snapshot */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              {formatPrice(changes?.stats?.medianSalePrice || allStats.medianPrice)}
            </div>
            <div className="text-blue-200 text-xs">Median Ask</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 text-white border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">
              ${changes?.stats?.medianPpsf || allStats.avgPpsf}
            </div>
            <div className="text-slate-400 text-xs">Median $/sqft</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-lg font-bold text-emerald-600">
              {changes?.stats?.avgDom || "---"}
            </div>
            <div className="text-slate-500 text-xs">Avg Days on Market</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-lg font-bold text-blue-500">
              ${changes?.stats?.medianRent?.toLocaleString() || "---"}/mo
            </div>
            <div className="text-slate-500 text-xs">Median Rent</div>
          </CardContent>
        </Card>
      </div>

      {/* Top 5 For Sale */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">
            Top For Sale
          </h2>
          <Link
            href="/listings"
            className="text-sm text-blue-600 font-medium"
          >
            View all &rarr;
          </Link>
        </div>
        <div className="space-y-3">
          {topListings.map((l, i) => (
            <ListingCard key={l.mlsId || l.address} listing={l} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/strategy">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-sm font-semibold text-slate-700">Strategy</div>
              <div className="text-xs text-slate-400">Search criteria & insights</div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/market">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 text-center">
              <div className="text-sm font-semibold text-slate-700">Market</div>
              <div className="text-xs text-slate-400">Trends & analytics</div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="h-8" />
    </div>
  );
}
