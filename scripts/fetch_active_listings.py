#!/usr/bin/env python3
"""Fetch active for-sale listings from Redfin JSON API for East Lake HS zone."""

import json
import os
import time
import urllib.request

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "data")

# Redfin region IDs for target ZIPs
REGIONS = {
    "34685": 14696,   # Palm Harbor
    "34688": 14697,   # East Lake / Tarpon Springs
    "34689": 14698,   # Tarpon Springs
}

BASE_URL = "https://www.redfin.com/stingray/api/gis"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json",
    "Referer": "https://www.redfin.com/",
}


def fetch_region(zip_code, region_id):
    """Fetch active single-family listings for a ZIP region."""
    params = (
        f"?al=1&include_pending_homes=false"
        f"&isRentals=false&market=tampa"
        f"&num_homes=350"
        f"&ord=redfin-recommended-asc"
        f"&page_number=1"
        f"&region_id={region_id}&region_type=2"
        f"&status=9&uipt=1&v=8"
    )
    url = BASE_URL + params
    print(f"  Fetching ZIP {zip_code} (region {region_id})...")

    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            text = resp.read().decode("utf-8")
    except Exception as e:
        print(f"  ERROR fetching {zip_code}: {e}")
        return []

    text = text.replace("{}&&", "", 1)
    data = json.loads(text)
    homes = data.get("payload", {}).get("homes", [])
    print(f"  Found {len(homes)} homes in ZIP {zip_code}")
    return homes


def parse_home(h, zip_code):
    """Parse a Redfin JSON home object into our standard format."""
    price = h.get("price", {}).get("value")
    sqft = h.get("sqFt", {}).get("value")
    if not price or not sqft or sqft == 0:
        return None

    street = h.get("streetLine", {}).get("value", "")
    city = h.get("city", "")
    state = h.get("state", "FL")
    actual_zip = h.get("zip", zip_code)
    address = f"{street}, {city}, {state} {actual_zip}"

    lot_sqft = h.get("lotSize", {}).get("value")
    year_built = h.get("yearBuilt", {}).get("value")
    dom = h.get("dom", {}).get("value")
    hoa = h.get("hoa", {}).get("value")
    lat_long = h.get("latLong", {}).get("value", {})

    remarks = h.get("listingRemarks", "")
    key_facts = [kf.get("description", "") for kf in h.get("keyFacts", [])]
    listing_tags = h.get("listingTags", [])

    # Pool detection
    has_pool = any("pool" in tag.lower() for tag in listing_tags)
    if not has_pool and remarks:
        has_pool = "pool" in remarks.lower()
    if not has_pool:
        has_pool = h.get("skPoolType", 0) > 0

    # Waterfront detection
    is_waterfront = any("water" in tag.lower() or "lake" in tag.lower() for tag in listing_tags)
    if not is_waterfront and remarks:
        is_waterfront = any(w in remarks.lower() for w in ["waterfront", "water view", "lake view", "lakefront"])

    # Conservation detection
    is_conservation = False
    if remarks:
        is_conservation = any(w in remarks.lower() for w in ["conservation", "preserve", "wetland"])

    sashes = [s.get("sashTypeName", "") for s in h.get("sashes", [])]
    agent = h.get("listingAgent", {}).get("name", "")

    return {
        "address": address,
        "price": price,
        "sqft": sqft,
        "ppsf": round(price / sqft),
        "lotSqft": lot_sqft,
        "lotAcres": round(lot_sqft / 43560, 2) if lot_sqft else None,
        "beds": h.get("beds"),
        "baths": h.get("baths"),
        "stories": h.get("stories"),
        "yearBuilt": year_built,
        "hoa": hoa,
        "dom": dom,
        "subdivision": h.get("location", {}).get("value", ""),
        "url": h.get("url", ""),
        "mlsId": h.get("mlsId", {}).get("value", ""),
        "zip": actual_zip,
        "lat": lat_long.get("latitude"),
        "lon": lat_long.get("longitude"),
        "isActive": True,
        "hasPool": has_pool,
        "isWaterfront": is_waterfront,
        "isConservation": is_conservation,
        "sashes": sashes,
        "listingAgent": agent,
        "remarks": remarks[:500] if remarks else "",
        "keyFacts": key_facts,
        "listingTags": listing_tags,
        "garageSpaces": h.get("skGarageSpaces"),
        "propertyId": h.get("propertyId"),
    }


def main():
    all_listings = []
    seen_ids = set()

    for zip_code, region_id in REGIONS.items():
        homes = fetch_region(zip_code, region_id)
        for h in homes:
            listing = parse_home(h, zip_code)
            if listing and listing["mlsId"] not in seen_ids:
                seen_ids.add(listing["mlsId"])
                all_listings.append(listing)
        time.sleep(3)

    print(f"\nTotal unique listings: {len(all_listings)}")

    # Sort by ppsf (best value first)
    all_listings.sort(key=lambda x: x.get("ppsf", 999))

    # Summary
    if all_listings:
        zips = {}
        for l in all_listings:
            zips[l["zip"]] = zips.get(l["zip"], 0) + 1
        print(f"By ZIP: {zips}")

        prices = [l["price"] for l in all_listings]
        ppsfs = [l["ppsf"] for l in all_listings]
        print(f"Price range: ${min(prices):,.0f} - ${max(prices):,.0f}")
        print(f"$/sqft range: ${min(ppsfs)} - ${max(ppsfs)}")
        print(f"With pool: {sum(1 for l in all_listings if l.get('hasPool'))}")
        print(f"Conservation lots: {sum(1 for l in all_listings if l.get('isConservation'))}")

    # Save raw listings to scripts/data (intermediate file)
    raw_output = os.path.join(SCRIPT_DIR, "data", "active-listings-raw.json")
    with open(raw_output, "w") as f:
        json.dump(all_listings, f, indent=2)

    print(f"\nSaved to {raw_output}")
    return all_listings


if __name__ == "__main__":
    main()
