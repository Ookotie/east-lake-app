import { Card, CardContent } from "@/components/ui/card";

const pmCompanies = [
  {
    tier: 1,
    name: "Premis Realty",
    phone: "(727) 447-5100",
    email: "customerservice@premisrealty.com",
    website: "https://www.premisrealty.com/east-lake-property-management-services/",
    address: "36366 US Hwy 19 N, Palm Harbor, FL 34683",
    rating: 3.9,
    reviews: 67,
    portfolio: "200+ units managed",
    established: "2002 (23 years)",
    fees: "12%/mo, no placement fee, no hidden fees",
    notes: "Family-owned, 5th generation in Pinellas County. Dedicated East Lake & East Lake Woodlands page. Full-service: tenant screening, rent collection, maintenance (no markup on repairs). 40+ years real estate experience. Uses ManageBuilding platform.",
    eastLake: true,
    applyUrl: "https://premisrealty.managebuilding.com/Resident/apps/rentalapp",
    currentListings: "10 rentals listed (1 in Palm Harbor 34683, none in 34685/34688 currently)",
  },
  {
    tier: 1,
    name: "PMI Pinellas",
    phone: "786-223-6998",
    email: "yledo@pmipinellas.com",
    website: "https://www.palmharborpropertymanagementinc.com/palm-harbor-homes-for-rent",
    address: "9886 Trumpet Vine Loop, Trinity, FL 34655",
    rating: 4.6,
    reviews: 10,
    portfolio: "~10-20 properties (boutique)",
    established: "2025 BBB accreditation (newer)",
    fees: "Not published",
    notes: "Run by Yosvani Ledo. Uses Rentvine (Julie already registered). Franchise of PMI national brand. 21-day tenant placement guarantee or first month free. Covers eviction costs up to $2K. Mix of long-term rentals and vacation/short-term. Most Google reviews are from vacation guests, not long-term tenants.",
    eastLake: true,
    applyUrl: "https://pmipinellas.rentvine.com/public/apply",
    currentListings: "4 listings: Trinity 5BR/4770sqft $4,500 (Apr 15), Oldsmar 2BR $2,100, Clearwater Beach 2BR $3,600, NPR 4BR $2,875",
  },
  {
    tier: 1,
    name: "All County Associates",
    phone: "(727) 853-6888",
    email: "contact@allcountyassociates.com",
    website: "https://www.allcountyassociates.com/",
    address: "2706 US-19 Alt, Palm Harbor, FL 34683",
    rating: 4.8,
    reviews: 30,
    portfolio: "Not disclosed",
    established: "National franchise since 1990",
    fees: "Not published",
    notes: "Highest rated PM in the area. Exclusively residential property management -- does NOT buy/sell real estate (considers it a conflict of interest). Covers Palm Harbor, Tarpon Springs, East Lake, Trinity. Claims 10-20% savings through preferred vendor pricing. No markup on maintenance. Run by 'Michael'. Uses RentManager platform.",
    eastLake: true,
    applyUrl: null,
    currentListings: "8 listings (Tarpon Springs, NPR, Tampa, St. Pete -- none in East Lake currently)",
  },
  {
    tier: 2,
    name: "RentICR Realty",
    phone: "(727) 431-5581",
    email: "joe@renticr.com",
    website: "https://www.renticr.com/",
    address: "PO Box 2752, Tarpon Springs, FL 34688",
    rating: 4.9,
    reviews: 29,
    portfolio: "200-300 properties",
    established: "~2020",
    fees: "Not published",
    notes: "Run by Joe Ionata (former college football coach at ECU, Clemson, UGA). Based in 34688 (Tarpon Springs/East Lake adjacent). Previously managed 800 homes in 18 months for a large REIT. Offers deposit-free living via Obligo. Covers Pinellas + Pasco + Hillsborough. Also buys homes for cash.",
    eastLake: true,
    applyUrl: "https://ji.managebuilding.com/Resident/apps/rentalapp/",
    currentListings: "Listings page uses TenantTurner (app.tenantturner.com)",
  },
  {
    tier: 2,
    name: "East Lake Real Estate, LLC",
    phone: "(727) 947-9377",
    email: null,
    website: "https://www.preferredrealtygroupfl.com/east-lake-real-estate-llc",
    address: "800 Tarpon Woods Blvd Suite F1, Palm Harbor, FL 34685",
    rating: null,
    reviews: 0,
    portfolio: "~15 furnished units",
    established: "Unknown",
    fees: "Not published",
    notes: "Run by Jeff Montemarano (NJ transplant, also has Century 21 in Butler, NJ). Despite the name, ALL current listings are in Oldsmar 34677 -- none actually in East Lake. Focuses on furnished short-term rentals. Unfurnished annual page is broken (404). Very few online reviews. Office IS in 34685 though.",
    eastLake: false,
    applyUrl: null,
    currentListings: "15 furnished rentals, all in Oldsmar 34677. Price range $1,700-$3,000. Mostly 2BR/2BA.",
  },
  {
    tier: 3,
    name: "Trust Property Management FL",
    phone: "(727) 937-6000",
    email: "monica@trustpmf.com",
    website: "https://www.trustpropertymanagementflorida.com/contact",
    address: "439 E Tarpon Ave, Tarpon Springs, FL 34689",
    rating: 3.4,
    reviews: 10,
    portfolio: "Not disclosed",
    established: "Unknown",
    fees: "Not published",
    notes: "Tarpon Springs based. Lower rated. Backup option only.",
    eastLake: false,
    applyUrl: null,
    currentListings: "Unknown",
  },
];

function StarRating({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-slate-400 text-sm">No reviews</span>;
  const full = Math.floor(rating);
  return (
    <span className="text-sm">
      {"★".repeat(full)}
      {rating % 1 >= 0.5 ? "½" : ""}
      {"☆".repeat(5 - Math.ceil(rating))}{" "}
      <span className="font-semibold">{rating}</span>
    </span>
  );
}

function TierBadge({ tier }: { tier: number }) {
  const colors: Record<number, string> = {
    1: "bg-emerald-100 text-emerald-800",
    2: "bg-blue-100 text-blue-800",
    3: "bg-slate-100 text-slate-600",
  };
  const labels: Record<number, string> = {
    1: "Priority",
    2: "Worth calling",
    3: "Backup",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${colors[tier]}`}>
      {labels[tier]}
    </span>
  );
}

export default function RentalsPage() {
  return (
    <div className="space-y-6 p-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-slate-900">Rental Search</h1>
        <p className="text-sm text-slate-500">
          Property management companies serving East Lake HS zone
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Updated March 30, 2026
        </p>
      </div>

      {/* Call Script */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h2 className="font-semibold text-blue-900 text-sm mb-2">What to say when you call</h2>
          <p className="text-sm text-blue-800 italic">
            &ldquo;Hi, I&apos;m Dr. Okotie. My husband is a physician and we&apos;re relocating to the East Lake High School zone. We&apos;re looking for a 4+ bedroom, 3,000+ sqft single family home on a 12-month lease. What do you have available or coming available in the next 30-60 days? We can submit a full tenant packet same day.&rdquo;
          </p>
        </CardContent>
      </Card>

      {/* Key Insight */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="p-4">
          <h2 className="font-semibold text-amber-900 text-sm mb-2">Key insight</h2>
          <p className="text-sm text-amber-800">
            PM companies know about vacancies 30 days before they hit Zillow/Redfin. Ask each one what&apos;s <strong>coming available</strong>, not just what&apos;s listed now. None currently have 4BR+ homes in East Lake proper -- but inventory rotates fast.
          </p>
        </CardContent>
      </Card>

      {/* Company Cards */}
      <div className="space-y-4">
        {pmCompanies.map((co, i) => (
          <Card key={i} className="overflow-hidden">
            <CardContent className="p-4 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-slate-900">#{i + 1}</span>
                    <TierBadge tier={co.tier} />
                    {co.eastLake && (
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded">
                        East Lake
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{co.name}</h3>
                </div>
                <div className="text-amber-500">
                  <StarRating rating={co.rating} />
                  {co.reviews > 0 && (
                    <span className="text-slate-400 text-xs ml-1">({co.reviews})</span>
                  )}
                </div>
              </div>

              {/* Contact Actions */}
              <div className="flex gap-2 flex-wrap">
                <a
                  href={`tel:${co.phone.replace(/[^\d+]/g, "")}`}
                  className="flex-1 min-w-[140px] bg-emerald-600 text-white text-center py-2.5 rounded-lg text-sm font-semibold active:bg-emerald-700"
                >
                  Call {co.phone}
                </a>
                {co.email && (
                  <a
                    href={`mailto:${co.email}?subject=Rental%20Inquiry%20-%20East%20Lake%20HS%20Zone&body=Hello%2C%0A%0AI%27m%20Dr.%20Okotie%20and%20my%20husband%20is%20a%20physician%20relocating%20to%20the%20East%20Lake%20High%20School%20zone.%20We%27re%20looking%20for%20a%204%2B%20bedroom%2C%203%2C000%2B%20sqft%20single%20family%20home%20on%20a%2012-month%20lease.%0A%0ACould%20you%20let%20me%20know%20what%20you%20have%20available%20or%20coming%20available%20in%20the%20next%2030-60%20days%3F%20We%20can%20submit%20a%20complete%20tenant%20packet%20same%20day.%0A%0AThank%20you%2C%0ADr.%20Julie%20Okotie`}
                    className="flex-1 min-w-[100px] bg-blue-600 text-white text-center py-2.5 rounded-lg text-sm font-semibold active:bg-blue-700"
                  >
                    Email
                  </a>
                )}
                <a
                  href={co.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-200 text-slate-700 text-center py-2.5 px-4 rounded-lg text-sm font-semibold active:bg-slate-300"
                >
                  Web
                </a>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Portfolio</span>
                  <span className="text-slate-700 font-medium">{co.portfolio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Established</span>
                  <span className="text-slate-700 font-medium">{co.established}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mgmt fees</span>
                  <span className="text-slate-700 font-medium">{co.fees}</span>
                </div>
                <div>
                  <span className="text-slate-500">Address: </span>
                  <span className="text-slate-700">{co.address}</span>
                </div>
                <div>
                  <span className="text-slate-500">Current listings: </span>
                  <span className="text-slate-700">{co.currentListings}</span>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-slate-50 rounded-lg p-3">
                <p className="text-xs text-slate-600 leading-relaxed">{co.notes}</p>
              </div>

              {/* Apply link */}
              {co.applyUrl && (
                <a
                  href={co.applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-sm text-blue-600 font-medium underline"
                >
                  Apply online / View portal
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Other Resources */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <h2 className="font-semibold text-slate-900">Other rental resources</h2>
          <div className="space-y-2 text-sm">
            <a href="https://www.invitationhomes.com/search/palm-harbor-fl-34685-usa" target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline">
              Invitation Homes (institutional) -- 12 homes near East Lake, only 1 with 4BR
            </a>
            <a href="https://www.zillow.com/palm-harbor-fl/rentals/?searchQueryState=%7B%22pagination%22%3A%7B%7D%2C%22usersSearchTerm%22%3A%2234685%22%2C%22filterState%22%3A%7B%22beds%22%3A%7B%22min%22%3A4%7D%2C%22fr%22%3A%7B%22value%22%3Atrue%7D%2C%22fsba%22%3A%7B%22value%22%3Afalse%7D%2C%22fsbo%22%3A%7B%22value%22%3Afalse%7D%2C%22nc%22%3A%7B%22value%22%3Afalse%7D%2C%22cmsn%22%3A%7B%22value%22%3Afalse%7D%2C%22auc%22%3A%7B%22value%22%3Afalse%7D%2C%22fore%22%3A%7B%22value%22%3Afalse%7D%7D%7D" target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline">
              Zillow Rentals -- Palm Harbor 4+ BR
            </a>
            <a href="https://www.realtor.com/apartments/Palm-Harbor_FL/beds-4" target="_blank" rel="noopener noreferrer" className="block text-blue-600 underline">
              Realtor.com -- Palm Harbor rentals
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Fee-based agent */}
      <Card className="bg-slate-50">
        <CardContent className="p-4 space-y-2">
          <h2 className="font-semibold text-slate-900 text-sm">Backup: Fee-based agent</h2>
          <p className="text-sm text-slate-700">
            <strong>Justin Morris</strong>, REALTOR at Smith & Associates
          </p>
          <p className="text-xs text-slate-500">
            South Tampa specialist. 10+ years experience, handles leases ($2K-$8K/mo range). Good reviews for responsiveness and remote buyers. BUT his territory is South Tampa/Hillsborough -- not Pinellas/East Lake. Use as backup if PM pipeline doesn&apos;t produce in 30 days.
          </p>
          <div className="flex gap-2">
            <a
              href="tel:8138100776"
              className="bg-slate-200 text-slate-700 text-center py-2 px-4 rounded-lg text-sm font-semibold"
            >
              813-810-0776
            </a>
            <a
              href="mailto:jmorris@smithandassociates.com"
              className="bg-slate-200 text-slate-700 text-center py-2 px-4 rounded-lg text-sm font-semibold"
            >
              Email
            </a>
          </div>
        </CardContent>
      </Card>

      <div className="h-8" />
    </div>
  );
}
