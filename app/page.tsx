import { Card, CardContent } from "@/components/ui/card";
import { PropertyCard } from "@/components/property-card";
import { top50, allProperties, getMarketStats, formatPrice } from "@/lib/properties";
import Link from "next/link";

export default function Dashboard() {
  const stats = getMarketStats(top50);
  const allStats = getMarketStats(allProperties);
  const topProperties = top50.slice(0, 5);

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900">East Lake Homes</h1>
        <p className="text-sm text-slate-500">
          ELHS zone &middot; {allStats.count} sold properties analyzed
        </p>
      </div>

      {/* Market Snapshot */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{formatPrice(allStats.medianPrice)}</div>
            <div className="text-blue-200 text-xs">Median Price</div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 text-white border-0">
          <CardContent className="p-4">
            <div className="text-2xl font-bold">${allStats.avgPpsf}</div>
            <div className="text-slate-400 text-xs">Avg $/sqft</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-lg font-bold text-emerald-600">{stats.poolCount}/{top50.length}</div>
            <div className="text-slate-500 text-xs">Have Pools</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-lg font-bold text-blue-500">{stats.waterfrontCount}/{top50.length}</div>
            <div className="text-slate-500 text-xs">Waterfront</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insight */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <div className="text-sm font-semibold text-amber-800">Best Value Zone</div>
          <div className="text-xs text-amber-700 mt-1">
            ZIP 34688 (East Lake) averages $230-$280/sf vs $300-$400/sf in 34685 (Palm Harbor) for comparable quality. Peak selling: Apr-Aug.
          </div>
        </CardContent>
      </Card>

      {/* Top 5 */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Top Ranked</h2>
          <Link href="/properties" className="text-sm text-blue-600 font-medium">
            View all &rarr;
          </Link>
        </div>
        <div className="space-y-3">
          {topProperties.map((p, i) => (
            <PropertyCard key={p.address} property={p} rank={i + 1} />
          ))}
        </div>
      </div>

      {/* Criteria */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Search Criteria</h3>
          <div className="grid grid-cols-2 gap-y-1 text-xs text-slate-600">
            <span>Price</span><span className="text-right font-medium">$800K - $2.5M</span>
            <span>Size</span><span className="text-right font-medium">3,000+ sqft</span>
            <span>Type</span><span className="text-right font-medium">Single Family</span>
            <span>Zone</span><span className="text-right font-medium">East Lake HS</span>
            <span>Period</span><span className="text-right font-medium">Last 3 years</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
