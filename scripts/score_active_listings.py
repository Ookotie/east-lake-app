#!/usr/bin/env python3
"""Score active listings against the sold home baseline for East Lake HS zone."""

import json
import os
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "data")


def load_school_zone():
    """Load East Lake HS zone polygon."""
    geojson_path = os.path.join(SCRIPT_DIR, "data", "east_lake_hs_zone.geojson")
    with open(geojson_path) as f:
        data = json.load(f)
    return data["features"][0]["geometry"]["coordinates"][0]


def point_in_polygon(lat, lon, polygon):
    """Ray-casting algorithm for point-in-polygon check."""
    n = len(polygon)
    inside = False
    j = n - 1
    for i in range(n):
        xi, yi = polygon[i]  # lon, lat in geojson
        xj, yj = polygon[j]
        if ((yi > lat) != (yj > lat)) and (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi):
            inside = not inside
        j = i
    return inside

def load_sold_baseline():
    """Load sold properties and compute market stats."""
    scored_path = os.path.join(SCRIPT_DIR, "data", "all-properties-scored.json")
    with open(scored_path) as f:
        sold = json.load(f)

    prices = [p["price"] for p in sold if p.get("price")]
    ppsfs = [p["ppsf"] for p in sold if p.get("ppsf")]
    sqfts = [p["sqft"] for p in sold if p.get("sqft")]

    # Subdivision-level stats for comps
    subdiv_stats = {}
    for p in sold:
        s = p.get("subdivision", "Unknown")
        if s not in subdiv_stats:
            subdiv_stats[s] = {"prices": [], "ppsfs": [], "sqfts": [], "count": 0}
        subdiv_stats[s]["prices"].append(p["price"])
        subdiv_stats[s]["ppsfs"].append(p["ppsf"])
        subdiv_stats[s]["sqfts"].append(p["sqft"])
        subdiv_stats[s]["count"] += 1

    # ZIP-level stats
    zip_stats = {}
    for p in sold:
        z = p.get("zip", "?")
        if z not in zip_stats:
            zip_stats[z] = {"ppsfs": [], "prices": []}
        zip_stats[z]["ppsfs"].append(p["ppsf"])
        zip_stats[z]["prices"].append(p["price"])

    stats = {
        "median_price": sorted(prices)[len(prices) // 2],
        "median_ppsf": sorted(ppsfs)[len(ppsfs) // 2],
        "mean_ppsf": sum(ppsfs) / len(ppsfs),
        "min_ppsf": min(ppsfs),
        "max_ppsf": max(ppsfs),
        "median_sqft": sorted(sqfts)[len(sqfts) // 2],
        "total_sold": len(sold),
        "subdiv_stats": subdiv_stats,
        "zip_stats": zip_stats,
    }
    return sold, stats


def find_comps(listing, sold, stats, n=5):
    """Find the n most comparable sold properties."""
    comps = []
    for s in sold:
        sqft_diff = abs(s.get("sqft", 0) - listing.get("sqft", 0)) / max(listing.get("sqft", 1), 1)
        bed_diff = abs((s.get("beds", 0) or 0) - (listing.get("beds", 0) or 0))
        year_diff = abs((s.get("yearBuilt", 2000) or 2000) - (listing.get("yearBuilt", 2000) or 2000))
        same_zip = 1 if s.get("zip") == listing.get("zip") else 0

        similarity = sqft_diff * 3 + bed_diff * 0.3 + year_diff * 0.02 - same_zip * 0.5
        comps.append((similarity, s))

    comps.sort(key=lambda x: x[0])
    return [c[1] for c in comps[:n]]


def score_listing(listing, sold, stats):
    """Score an active listing (0-100) based on value vs. sold baseline."""
    score = 0

    ppsf = listing.get("ppsf", 999)
    median_ppsf = stats["median_ppsf"]

    # 1. Price/sqft discount vs market (30 pts)
    if ppsf <= median_ppsf:
        discount_pct = (median_ppsf - ppsf) / median_ppsf
        score += min(30, 30 * (discount_pct / 0.3))
    else:
        premium_pct = (ppsf - median_ppsf) / median_ppsf
        score += max(0, 15 * (1 - premium_pct / 0.3))

    # 2. Comp-based value (20 pts)
    comps = find_comps(listing, sold, stats)
    if comps:
        comp_ppsfs = [c["ppsf"] for c in comps if c.get("ppsf")]
        if comp_ppsfs:
            avg_comp_ppsf = sum(comp_ppsfs) / len(comp_ppsfs)
            listing["compAvgPpsf"] = round(avg_comp_ppsf)
            listing["compDiscount"] = round((1 - ppsf / avg_comp_ppsf) * 100, 1)

            if ppsf <= avg_comp_ppsf:
                discount = (avg_comp_ppsf - ppsf) / avg_comp_ppsf
                score += min(20, 20 * (discount / 0.2))
            else:
                premium = (ppsf - avg_comp_ppsf) / avg_comp_ppsf
                score += max(0, 10 * (1 - premium / 0.2))

        listing["comps"] = [
            {
                "address": c["address"],
                "price": c["price"],
                "sqft": c["sqft"],
                "ppsf": c["ppsf"],
                "soldDate": c.get("soldDateStr", ""),
                "beds": c.get("beds"),
                "baths": c.get("baths"),
                "yearBuilt": c.get("yearBuilt"),
            }
            for c in comps[:5]
        ]

    # 3. Lot size (10 pts)
    lot_sqft = listing.get("lotSqft", 0) or 0
    lot_capped = min(lot_sqft, 87120)
    if lot_capped > 0:
        score += min(10, 10 * (lot_capped / 21780))

    # 4. Year built (10 pts)
    yb = listing.get("yearBuilt") or 1990
    if yb >= 2020: score += 10
    elif yb >= 2010: score += 8
    elif yb >= 2000: score += 6
    elif yb >= 1995: score += 5
    elif yb >= 1990: score += 4
    elif yb >= 1985: score += 3
    else: score += 1

    # 5. Features (10 pts)
    if listing.get("hasPool"): score += 3
    if listing.get("isWaterfront"): score += 3
    beds = listing.get("beds") or 0
    if beds >= 5: score += 2
    elif beds >= 4: score += 1
    baths = listing.get("baths") or 0
    if baths >= 4: score += 1
    if listing.get("garageSpaces", 0) and listing["garageSpaces"] >= 3: score += 1

    # 6. DOM staleness bonus (10 pts)
    dom = listing.get("dom") or 0
    if dom >= 120: score += 10
    elif dom >= 90: score += 8
    elif dom >= 60: score += 6
    elif dom >= 30: score += 4
    elif dom >= 14: score += 2

    # 7. HOA reasonableness (5 pts)
    hoa = listing.get("hoa")
    if hoa is None or hoa == 0:
        score += 5
    elif hoa < 150:
        score += 4
    elif hoa < 250:
        score += 3
    elif hoa < 400:
        score += 1

    # 8. Conservation penalty (-5 pts)
    if listing.get("isConservation"):
        score -= 5

    score = max(0, min(100, round(score, 1)))

    # Value assessment
    if listing.get("compAvgPpsf"):
        comp_ppsf = listing["compAvgPpsf"]
        if ppsf < comp_ppsf * 0.9:
            listing["valueAssessment"] = "Strong Value"
        elif ppsf < comp_ppsf * 0.98:
            listing["valueAssessment"] = "Good Value"
        elif ppsf < comp_ppsf * 1.05:
            listing["valueAssessment"] = "Fair Price"
        elif ppsf < comp_ppsf * 1.15:
            listing["valueAssessment"] = "Slightly Overpriced"
        else:
            listing["valueAssessment"] = "Overpriced"

    # Estimated fair value
    if listing.get("compAvgPpsf") and listing.get("sqft"):
        listing["estimatedFairValue"] = round(listing["compAvgPpsf"] * listing["sqft"])
        listing["priceDelta"] = listing["price"] - listing["estimatedFairValue"]

    return score


def main():
    print("Loading sold home baseline...")
    sold, stats = load_sold_baseline()
    print(f"  {stats['total_sold']} sold homes, median $/sqft: ${stats['median_ppsf']}")

    print("Loading East Lake HS zone boundary...")
    zone_polygon = load_school_zone()

    print("Loading active listings...")
    raw_input = os.path.join(SCRIPT_DIR, "data", "active-listings-raw.json")
    with open(raw_input) as f:
        raw_listings = json.load(f)
    print(f"  {len(raw_listings)} raw active listings")

    # Filter to match sold home criteria
    listings = []
    skipped_no_coords = 0
    skipped_outside_zone = 0
    for l in raw_listings:
        sqft = l.get("sqft", 0) or 0
        price = l.get("price", 0) or 0
        beds = l.get("beds", 0) or 0
        lat = l.get("lat")
        lon = l.get("lon")

        zip_code = l.get("zip", "")
        if zip_code not in ("34685", "34688", "34689"):
            skipped_outside_zone += 1
            continue
        if zip_code == "34689":
            if not lat or not lon:
                skipped_no_coords += 1
                continue
            if not point_in_polygon(lat, lon, zone_polygon):
                skipped_outside_zone += 1
                continue
        if sqft < 3000:
            continue
        if beds < 3 or beds > 7:
            continue
        if price < 800000 or price > 2500000:
            continue
        stories = l.get("stories") or 0
        lot_acres = l.get("lotAcres") or 0
        if stories >= 3 and lot_acres < 0.25:
            continue
        listings.append(l)
    print(f"  {skipped_no_coords} skipped (no coordinates)")
    print(f"  {skipped_outside_zone} skipped (outside East Lake HS zone)")
    print(f"  {len(listings)} after all filters (in zone, 3000+ sqft, 3-7 beds, $800K-$2.5M)")

    # Score each listing
    print("Scoring...")
    for listing in listings:
        listing["score"] = score_listing(listing, sold, stats)
        listing["marketMedianPpsf"] = stats["median_ppsf"]

    # Sort by score (best deals first)
    listings.sort(key=lambda x: x["score"], reverse=True)

    # Summary
    if listings:
        scores = [l["score"] for l in listings]
        print(f"\n=== SCORING RESULTS ===")
        print(f"  Score range: {min(scores)} - {max(scores)}")
        print(f"  Mean score: {sum(scores)/len(scores):.1f}")
        print(f"  Score 60+: {sum(1 for s in scores if s >= 60)} listings")
        print(f"  Score 50+: {sum(1 for s in scores if s >= 50)} listings")
        print(f"  Score 40+: {sum(1 for s in scores if s >= 40)} listings")
    else:
        print("\nNo listings matched filters.")

    # Save scored listings (full version)
    scored_output = os.path.join(SCRIPT_DIR, "data", "active-listings-scored.json")
    with open(scored_output, "w") as f:
        json.dump(listings, f, indent=2)
    print(f"\nSaved {len(listings)} scored listings to {scored_output}")

    # Save slim version for the app (no remarks/tags to reduce size)
    app_listings = []
    for l in listings:
        app_l = {k: v for k, v in l.items() if k not in ["remarks", "listingTags", "keyFacts", "sashes"]}
        app_listings.append(app_l)

    app_output = os.path.join(DATA_DIR, "active-listings.json")
    with open(app_output, "w") as f:
        json.dump(app_listings, f, indent=2)
    print(f"Saved slim version for app to {app_output}")

    return listings


if __name__ == "__main__":
    main()
