import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScoreBadge } from "@/components/score-badge";
import { Separator } from "@/components/ui/separator";
import { top50, allProperties, slugify, getRedfinUrl, formatPrice, findComps } from "@/lib/properties";
import Link from "next/link";

export function generateStaticParams() {
  return top50.map((p) => ({ id: slugify(p.address) }));
}

export default async function PropertyDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = [...top50, ...allProperties].find((p) => slugify(p.address) === id);
  if (!property) notFound();

  const p = property;
  const rank = top50.findIndex((t) => t.address === p.address) + 1;
  const photoIndex = rank > 0 && rank <= 20 ? String(rank).padStart(2, "0") : null;
  const comps = findComps(p, allProperties);
  const redfinUrl = getRedfinUrl(p);

  return (
    <div className="space-y-4">
      {/* Hero */}
      <div className="relative h-56 bg-gradient-to-br from-slate-300 to-slate-400">
        {photoIndex && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={`/photos/prop-${photoIndex}.png`} alt={p.address} className="w-full h-full object-cover" />
        )}
        <Link href="/properties" className="absolute top-3 left-3 bg-black/50 text-white p-2 rounded-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        {rank > 0 && (
          <div className="absolute top-3 right-3">
            <ScoreBadge score={p.totalScore || p.score} size="lg" />
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          <div className="text-white text-2xl font-bold">{formatPrice(p.price)}</div>
          {rank > 0 && <div className="text-white/70 text-xs">Rank #{rank} of 50</div>}
        </div>
      </div>

      <div className="px-4 space-y-4">
        {/* Address */}
        <div>
          <h1 className="text-lg font-bold text-slate-900">{p.address}</h1>
          <div className="flex items-center gap-3 mt-0.5">
            <p className="text-sm text-slate-500">{p.subdivision}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(p.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Map
            </a>
          </div>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <StatBox label="Beds/Baths" value={`${p.beds}/${p.baths}`} />
          <StatBox label="Sq Ft" value={p.sqft.toLocaleString()} />
          <StatBox label="$/SqFt" value={`$${p.ppsf}`} />
          <StatBox label="Year Built" value={String(p.yearBuilt)} />
          <StatBox label="Lot" value={p.lotAcres ? `${p.lotAcres.toFixed(2)} ac` : "—"} />
          <StatBox label="HOA" value={p.hoa ? `$${p.hoa}/mo` : "None"} />
        </div>

        {/* Features */}
        <div className="flex gap-2 flex-wrap">
          {p.hasPool && <Badge className="bg-emerald-100 text-emerald-700">Pool</Badge>}
          {p.isWaterfront && <Badge className="bg-blue-100 text-blue-700">Waterfront</Badge>}
          {p.isRenovated && <Badge className="bg-purple-100 text-purple-700">Updated</Badge>}
          {p.hoa === null && <Badge className="bg-amber-100 text-amber-700">No HOA</Badge>}
        </div>

        {/* Visual Score Breakdown */}
        {p.visualScore && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-base font-semibold text-slate-700 mb-2">Quality Score Breakdown</h3>
              <div className="space-y-2">
                <ScoreBar label="Data Score" value={p.score} max={85} />
                <ScoreBar label="Visual Quality" value={p.visualScore} max={15} />
                {p.exteriorScore !== undefined && (
                  <div className="grid grid-cols-3 gap-2 text-sm text-slate-500 mt-2">
                    <span>Exterior: {p.exteriorScore}/5</span>
                    <span>Interior: {p.interiorScore}/5</span>
                    <span>Lot: {p.lotScore}/5</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Visual Notes */}
        {p.visualNotes && !p.visualNotes.includes("Estimated") && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="text-base font-semibold text-blue-800 mb-1">Assessment</div>
              <div className="text-sm text-blue-700 leading-relaxed">{p.visualNotes}</div>
            </CardContent>
          </Card>
        )}

        {/* Key Features List */}
        {p.visualFeatures && p.visualFeatures.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <h3 className="text-base font-semibold text-slate-700 mb-2">Key Features</h3>
              <div className="flex flex-wrap gap-2">
                {p.visualFeatures.map((f) => (
                  <Badge key={f} variant="outline" className="text-sm py-1 px-2">{f}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* MLS Description */}
        {p.mlsDescription && (
          <div>
            <h3 className="text-base font-semibold text-slate-700 mb-2">Description</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{p.mlsDescription}</p>
          </div>
        )}

        {/* Sale Info */}
        <Card>
          <CardContent className="p-4">
            <h3 className="text-base font-semibold text-slate-700 mb-2">Sale Details</h3>
            <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600">
              <span>Sold</span><span className="text-right font-medium">{p.soldDateStr}</span>
              <span>MLS #</span><span className="text-right font-medium">{p.mlsId || "—"}</span>
              <span>Days on Market</span><span className="text-right font-medium">{p.dom ?? "—"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Comparable Sales */}
        {comps.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-2">Similar Sold Properties</h3>
            <div className="space-y-2">
              {comps.map((c) => (
                <Link key={c.address} href={`/properties/${slugify(c.address)}`}>
                  <Card className="hover:shadow-sm transition-shadow">
                    <CardContent className="p-3 flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium text-slate-900 truncate max-w-[220px]">{c.address}</div>
                        <div className="text-xs text-slate-500">{c.sqft.toLocaleString()} sf &middot; {c.yearBuilt}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-slate-900">{formatPrice(c.price)}</div>
                        <div className="text-xs text-slate-500">${c.ppsf}/sf</div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Redfin Link */}
        {redfinUrl && (
          <a
            href={redfinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-red-600 text-white py-3 rounded-lg font-medium text-sm hover:bg-red-700 transition-colors"
          >
            View on Redfin &rarr;
          </a>
        )}

        <div className="h-4" />
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

function ScoreBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-600 mb-0.5">
        <span>{label}</span>
        <span className="font-medium">{Math.round(value)}/{max}</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
