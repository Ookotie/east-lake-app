import { Card, CardContent } from "@/components/ui/card";
import { allProperties, getMarketStats, getSalesByMonth, formatPrice } from "@/lib/properties";

export default function MarketPage() {
  const stats = getMarketStats(allProperties);
  const salesByMonth = getSalesByMonth(allProperties);

  // Aggregate by calendar month
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const byCalMonth: Record<number, number> = {};
  for (const p of allProperties) {
    if (p.soldDate) {
      const m = new Date(p.soldDate).getMonth();
      byCalMonth[m] = (byCalMonth[m] || 0) + 1;
    }
  }
  const maxMonthCount = Math.max(...Object.values(byCalMonth));

  // Subdivision stats
  const subdivStats: Record<string, { count: number; prices: number[]; ppsf: number[] }> = {};
  for (const p of allProperties) {
    const s = p.subdivision || "Unknown";
    if (!subdivStats[s]) subdivStats[s] = { count: 0, prices: [], ppsf: [] };
    subdivStats[s].count++;
    subdivStats[s].prices.push(p.price);
    if (p.ppsf) subdivStats[s].ppsf.push(p.ppsf);
  }
  const topSubdivs = Object.entries(subdivStats)
    .filter(([, s]) => s.count >= 3)
    .sort((a, b) => {
      const aAvg = a[1].ppsf.reduce((x, y) => x + y, 0) / a[1].ppsf.length;
      const bAvg = b[1].ppsf.reduce((x, y) => x + y, 0) / b[1].ppsf.length;
      return aAvg - bAvg;
    });

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-xl font-bold text-slate-900 pt-2">Market Analytics</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="text-lg font-bold">{stats.count}</div>
            <div className="text-[10px] text-slate-500">Total Sold</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-lg font-bold">{formatPrice(stats.medianPrice)}</div>
            <div className="text-[10px] text-slate-500">Median Price</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-lg font-bold">${stats.avgPpsf}</div>
            <div className="text-[10px] text-slate-500">Avg $/SF</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3">
            <div className="text-lg font-bold">{stats.avgSqft.toLocaleString()}</div>
            <div className="text-[10px] text-slate-500">Avg SqFt</div>
          </CardContent>
        </Card>
      </div>

      {/* Seasonality Chart */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">When Homes Sell</h3>
          <div className="space-y-1.5">
            {monthNames.map((name, i) => {
              const count = byCalMonth[i] || 0;
              const pct = maxMonthCount > 0 ? (count / maxMonthCount) * 100 : 0;
              const isPeak = count >= maxMonthCount * 0.8;
              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 w-7">{name}</span>
                  <div className="flex-1 h-4 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isPeak ? "bg-blue-500" : "bg-slate-300"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 w-5 text-right">{count}</span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Peak: Apr-Aug. Best buying window: Jan-Feb.</p>
        </CardContent>
      </Card>

      {/* Subdivision Rankings */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            Subdivisions by Value (best $/sf first)
          </h3>
          <div className="space-y-2">
            {topSubdivs.map(([name, s]) => {
              const avgPpsf = Math.round(s.ppsf.reduce((a, b) => a + b, 0) / s.ppsf.length);
              const avgPrice = Math.round(s.prices.reduce((a, b) => a + b, 0) / s.prices.length);
              return (
                <div key={name} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                  <div>
                    <div className="text-xs font-medium text-slate-800 truncate max-w-[180px]">{name}</div>
                    <div className="text-[10px] text-slate-400">{s.count} sales</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-slate-900">${avgPpsf}/sf</div>
                    <div className="text-[10px] text-slate-400">{formatPrice(avgPrice)} avg</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
