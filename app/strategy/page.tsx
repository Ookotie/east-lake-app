"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const insights = [
  {
    title: "Buy in September or October",
    category: "Timing",
    impact: "Save $20-30K",
    color: "bg-emerald-50 border-emerald-200",
    titleColor: "text-emerald-800",
    detail: `Sellers get desperate after the summer rush. Sep-Oct avg $288-294/sf vs $311-312/sf in Apr/Aug. On a 4,000sf home that's $70-90K less. November is the WORST month to buy — avg $385/sf (sellers hold out for year-end closings at premium prices).`,
    action: "Start touring in August. Make offers in September. Close by October.",
  },
  {
    title: "ZIP 34688 is 10% Cheaper Than 34685",
    category: "Location",
    impact: "Save $40-60K",
    color: "bg-blue-50 border-blue-200",
    titleColor: "text-blue-800",
    detail: `34688 (East Lake/Tarpon Springs) averages $297/sf. 34685 (Palm Harbor/Lansbrook) averages $307/sf. But 34688 homes are actually BIGGER on average (4,017sf vs 3,724sf). Same school zone, bigger house, lower price. Subdivisions like Crescent Oaks ($241/sf), Northfield ($255/sf), and Cypress Run ($256/sf) are the best deals.`,
    action: "Focus search on 34688 — same ELHS zone, 10% less per sqft, larger lots.",
    mapNote: "34688 sits NORTH of 34685, centered around East Lake Rd and Keystone Rd",
  },
  {
    title: "Pools Are Free",
    category: "Features",
    impact: "Get $40K+ feature at no premium",
    color: "bg-cyan-50 border-cyan-200",
    titleColor: "text-cyan-800",
    detail: `Pool homes sell at $271/sf. Non-pool homes sell at $274/sf. Pools add ZERO price premium per sqft — they're essentially free. 86% of top-50 properties have pools. A pool install costs $40-80K, so buying a home WITH a pool saves that entire amount.`,
    action: "Always prefer a home with an existing pool. You're not paying extra for it.",
  },
  {
    title: "Waterfront is Underpriced",
    category: "Features",
    impact: "Premium feature at market price",
    color: "bg-purple-50 border-purple-200",
    titleColor: "text-purple-800",
    detail: `Waterfront properties in the top 50 sell at $272/sf — virtually identical to non-waterfront ($271/sf). In most FL markets, waterfront commands a 20-40% premium. Here it doesn't, likely because these are river/lake/canal views rather than Gulf-front. This is a massive value opportunity — you get water access and views for the same price.`,
    action: "Prioritize properties on Salt Lake, Anclote River, or canals. You're getting waterfront at inland prices.",
    mapNote: "Sail Harbor, Pointe Alexis, and Mary Ln offer direct Gulf access via Anclote River",
  },
  {
    title: "2000-2004 Builds Are the Sweet Spot",
    category: "Age",
    impact: "Modern construction at vintage prices",
    color: "bg-amber-50 border-amber-200",
    titleColor: "text-amber-800",
    detail: `Homes built 2000-2004 sell at $295/sf — the same as 1990s builds — but have modern construction standards (impact windows, updated electrical, open floor plans). Meanwhile 2005-2014 builds sell at $336/sf — a $41/sf premium for just a few more years. The 2000-2004 era is the value pocket.`,
    action: "Target 2000-2004 builds. You get modern construction without the \"newer build\" markup.",
  },
  {
    title: "The Market Is Softening in Q1 2026",
    category: "Timing",
    impact: "Increased negotiation leverage",
    color: "bg-red-50 border-red-200",
    titleColor: "text-red-800",
    detail: `Q1 2026 shows $279/sf average — the lowest since Q2 2023 ($278/sf). The median price dropped to $1.0M from $1.15M a year ago. This suggests buyer fatigue and increased inventory. Sellers are more willing to negotiate. The Aug school enrollment deadline gives you natural leverage — \"we need to close by July for school enrollment.\"`,
    action: "Use the softening market + school deadline as dual leverage in negotiations.",
  },
  {
    title: "Bigger Homes = Better $/SF",
    category: "Size",
    impact: "More space for less per sqft",
    color: "bg-orange-50 border-orange-200",
    titleColor: "text-orange-800",
    detail: `Homes over 5,000sf average $220-260/sf while 3,000sf homes average $300+/sf. There's an inverse relationship between size and $/sf. If you can afford the total price, buying bigger is a better value proposition — you pay less for each square foot.`,
    action: "Don't filter out bigger homes because of sticker shock. Compare by $/sf, not total price.",
  },
  {
    title: "HOA Homes Are Cheaper Per SqFt",
    category: "Cost Structure",
    impact: "Lower purchase price, ongoing cost",
    color: "bg-slate-50 border-slate-300",
    titleColor: "text-slate-800",
    detail: `HOA homes average $304/sf vs $321/sf for no-HOA. Buyers discount HOA homes because of the ongoing monthly cost. An HOA of $150/mo = $1,800/yr = $54K over 30 years. But the upfront savings on a 4,000sf home is $68K ($304 vs $321 × 4,000). You save more upfront than you pay in HOA long-term, especially if you don't stay 30 years.`,
    action: "Don't auto-reject HOA properties. The lower purchase price often more than offsets the monthly fee, especially for a 5-7 year hold.",
  },
];

const topValueSubdivisions = [
  { name: "Bayshore Heights", zip: "34689", ppsf: 240, year: 2018, note: "Newest builds at lowest $/sf" },
  { name: "Crescent Oaks CC", zip: "34688", ppsf: 241, year: 1992, note: "Golf community, large lots" },
  { name: "Lynnwood", zip: "34685", ppsf: 243, year: 1998, note: "Best value in Palm Harbor" },
  { name: "Riverside", zip: "34688", ppsf: 251, year: 2001, note: "Acreage on Salt Lake" },
  { name: "Northfield", zip: "34688", ppsf: 255, year: 2002, note: "Newer builds, low HOA" },
  { name: "Cypress Run II", zip: "34688", ppsf: 256, year: 1990, note: "Golf community, established" },
  { name: "Briarwick", zip: "34685", ppsf: 265, year: 1986, note: "Affordable entry to Palm Harbor" },
];

export default function StrategyPage() {
  return (
    <div className="p-4 space-y-6">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900">Buyer Strategy</h1>
        <p className="text-sm text-slate-500">
          Actionable insights from 257 sold properties
        </p>
      </div>

      {/* Key Takeaway */}
      <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white border-0">
        <CardContent className="p-5">
          <div className="text-lg font-bold mb-2">The Playbook</div>
          <div className="text-sm leading-relaxed text-blue-100">
            Buy a <strong className="text-white">2000-2004 build</strong> in{" "}
            <strong className="text-white">ZIP 34688</strong> with a{" "}
            <strong className="text-white">pool</strong>, ideally{" "}
            <strong className="text-white">waterfront</strong>, and close in{" "}
            <strong className="text-white">September-October</strong>. You'll pay $240-280/sf
            instead of $300-400/sf and get a bigger home with premium features at inland prices.
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="space-y-4">
        {insights.map((insight, i) => (
          <Card key={i} className={insight.color}>
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="text-[10px] mb-1">{insight.category}</Badge>
                  <h3 className={`text-base font-bold ${insight.titleColor}`}>{insight.title}</h3>
                </div>
                <Badge className="bg-emerald-600 text-white text-[10px] whitespace-nowrap shrink-0">
                  {insight.impact}
                </Badge>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{insight.detail}</p>
              {insight.mapNote && (
                <p className="text-xs text-slate-500 italic">{insight.mapNote}</p>
              )}
              <div className="bg-white/60 rounded-lg p-3 mt-1">
                <div className="text-xs font-semibold text-slate-500 mb-0.5">ACTION</div>
                <div className="text-sm font-medium text-slate-800">{insight.action}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* Best Value Subdivisions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-3">Target Subdivisions</h2>
        <p className="text-sm text-slate-500 mb-4">Sorted by value (lowest $/sf first). All in ELHS zone.</p>
        <div className="space-y-2">
          {topValueSubdivisions.map((s, i) => (
            <Card key={i}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-500">
                    ZIP {s.zip} · Avg built {s.year} · {s.note}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-emerald-600">${s.ppsf}</div>
                  <div className="text-[10px] text-slate-400">per sqft</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Negotiation Cheat Sheet */}
      <Card>
        <CardContent className="p-4">
          <h3 className="text-base font-bold text-slate-900 mb-3">Negotiation Leverage</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="flex gap-3">
              <span className="text-lg">1</span>
              <div>
                <div className="font-semibold">School deadline = natural urgency</div>
                <div className="text-slate-500 text-xs">
                  &ldquo;We need to close by July for August enrollment.&rdquo;
                  Sellers know losing a qualified buyer means listing through slow fall months.
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">2</span>
              <div>
                <div className="font-semibold">Market is softening</div>
                <div className="text-slate-500 text-xs">
                  Q1 2026 avg $/sf is at 3-year low ($279). Point to recent comps that sold below ask.
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">3</span>
              <div>
                <div className="font-semibold">Come with pre-approval + flexible close</div>
                <div className="text-slate-500 text-xs">
                  Physician income makes you a strong buyer. Offer quick close (30 days) in exchange for price concession.
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="text-lg">4</span>
              <div>
                <div className="font-semibold">Use comp data from this app</div>
                <div className="text-slate-500 text-xs">
                  Show the seller&apos;s agent comparable sales data. &ldquo;Similar homes in the same subdivision sold at $X/sf. Your asking price implies $Y/sf.&rdquo;
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="h-4" />
    </div>
  );
}
