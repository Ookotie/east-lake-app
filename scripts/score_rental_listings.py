#!/usr/bin/env python3
"""Score rental listings for East Lake HS zone.

Hard filter: ELHS zone only (point-in-polygon for 34689, auto-pass 34685/34688).
Scoring: beds, sqft, price value, pool/waterfront, move-in timing, year built.
"""

import json
import os
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "data")

# Move-in target
MOVE_IN_DATE = datetime(2026, 6, 1)


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


def score_rental(rental):
    """Score a rental listing (0-100)."""
    score = 0

    # 1. Beds (25 pts) — 4+ preferred, 3 acceptable
    beds = rental.get("beds") or 0
    if beds >= 5:
        score += 25
    elif beds >= 4:
        score += 20
    elif beds >= 3:
        score += 10
    elif beds >= 2:
        score += 3

    # 2. Sqft (20 pts) — 3000+ preferred
    sqft = rental.get("sqft") or 0
    if sqft >= 3500:
        score += 20
    elif sqft >= 3000:
        score += 16
    elif sqft >= 2500:
        score += 12
    elif sqft >= 2000:
        score += 8
    elif sqft >= 1500:
        score += 4
    elif sqft > 0:
        score += 2

    # 3. Price value (20 pts) — lower monthly rent = higher score
    price = rental.get("price") or 0
    if price > 0:
        if price <= 2500:
            score += 20
        elif price <= 3000:
            score += 17
        elif price <= 3500:
            score += 14
        elif price <= 4000:
            score += 11
        elif price <= 5000:
            score += 7
        elif price <= 6000:
            score += 4
        else:
            score += 2

    # 4. Pool / Waterfront (10 pts)
    if rental.get("hasPool"):
        score += 5
    if rental.get("isWaterfront"):
        score += 5

    # 5. Move-in timing (15 pts) — available before June 1
    # For now, all current listings get partial credit since we can't
    # reliably determine available date from Zillow search results
    days_to_move = (MOVE_IN_DATE - datetime.now()).days
    if days_to_move > 0:
        score += 10  # Available now = good
    else:
        score += 15  # Past move-in date, urgency is high

    # 6. Year built / condition (10 pts)
    yb = rental.get("yearBuilt") or 0
    if yb >= 2020:
        score += 10
    elif yb >= 2010:
        score += 8
    elif yb >= 2000:
        score += 6
    elif yb >= 1995:
        score += 5
    elif yb >= 1985:
        score += 3
    elif yb > 0:
        score += 1

    return max(0, min(100, round(score)))


def main():
    print("Loading East Lake HS zone boundary...")
    zone_polygon = load_school_zone()

    print("Loading raw rental listings...")
    raw_input = os.path.join(SCRIPT_DIR, "data", "rental-listings-raw.json")
    with open(raw_input) as f:
        raw_rentals = json.load(f)
    print(f"  {len(raw_rentals)} raw rental listings")

    # Filter to ELHS zone
    rentals = []
    skipped_no_coords = 0
    skipped_outside_zone = 0
    skipped_filter = 0

    for r in raw_rentals:
        zip_code = r.get("zip", "")
        lat = r.get("lat")
        lon = r.get("lon")
        price = r.get("price", 0) or 0
        beds = r.get("beds") or 0
        sqft = r.get("sqft") or 0

        # ELHS zone hard filter
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

        # Basic rental filters
        if price < 1500 or price > 8000:
            skipped_filter += 1
            continue
        if beds > 0 and beds < 2:
            skipped_filter += 1
            continue

        rentals.append(r)

    print(f"  {skipped_no_coords} skipped (no coordinates)")
    print(f"  {skipped_outside_zone} skipped (outside ELHS zone)")
    print(f"  {skipped_filter} skipped (price/bed filters)")
    print(f"  {len(rentals)} after all filters")

    # Score each rental
    print("Scoring...")
    for rental in rentals:
        rental["score"] = score_rental(rental)
        # Add ppsf for rentals that have sqft
        if rental.get("sqft") and rental.get("price"):
            rental["ppsf"] = round(rental["price"] / rental["sqft"], 2)

    # Sort by score (best first)
    rentals.sort(key=lambda x: x["score"], reverse=True)

    # Summary
    if rentals:
        scores = [r["score"] for r in rentals]
        print(f"\n=== SCORING RESULTS ===")
        print(f"  {len(rentals)} rentals scored")
        print(f"  Score range: {min(scores)} - {max(scores)}")
        print(f"  Mean score: {sum(scores)/len(scores):.1f}")

        sfh = sum(1 for r in rentals if not r.get("isBuilding"))
        apt = sum(1 for r in rentals if r.get("isBuilding"))
        print(f"  SFH/townhouse/condo: {sfh}, Apartments: {apt}")

        print(f"\nTop 5:")
        for r in rentals[:5]:
            addr = r["address"][:40]
            print(f"  Score {r['score']:>3} | ${r['price']:,}/mo | {r.get('beds','?')}bd | {r.get('sqft','?')}sf | {addr}")
    else:
        print("\nNo rentals matched filters.")

    # Save scored rentals for the app
    app_output = os.path.join(DATA_DIR, "rental-listings.json")
    with open(app_output, "w") as f:
        json.dump(rentals, f, indent=2)
    print(f"\nSaved {len(rentals)} scored rentals to {app_output}")

    # Also save full version in scripts/data
    scored_output = os.path.join(SCRIPT_DIR, "data", "rental-listings-scored.json")
    with open(scored_output, "w") as f:
        json.dump(rentals, f, indent=2)
    print(f"Saved full version to {scored_output}")

    return rentals


if __name__ == "__main__":
    main()
