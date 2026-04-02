#!/usr/bin/env python3
"""Fetch rental listings from Zillow for East Lake HS zone ZIPs.

Redfin's API doesn't support rental searches, so we use Zillow's embedded
__NEXT_DATA__ JSON from their rental search pages.
"""

import json
import os
import re
import time
import urllib.request
import urllib.parse

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

TARGET_ZIPS = ["34685", "34688", "34689"]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
    "Accept-Language": "en-US,en;q=0.9",
}

# Map ZIP to Zillow city slug
ZIP_SLUGS = {
    "34685": "palm-harbor-fl-34685",
    "34688": "tarpon-springs-fl-34688",
    "34689": "tarpon-springs-fl-34689",
}


def build_zillow_url(zip_code):
    """Build Zillow rental search URL for a ZIP code."""
    slug = ZIP_SLUGS.get(zip_code, f"{zip_code}")
    search_state = {
        "pagination": {},
        "usersSearchTerm": zip_code,
        "filterState": {
            "fr": {"value": True},       # for rent
            "fsba": {"value": False},     # not for sale by agent
            "fsbo": {"value": False},     # not FSBO
            "nc": {"value": False},       # not new construction
            "cmsn": {"value": False},     # not coming soon
            "auc": {"value": False},      # not auction
            "fore": {"value": False},     # not foreclosure
        },
    }
    encoded = urllib.parse.quote(json.dumps(search_state))
    return f"https://www.zillow.com/{slug}/rentals/?searchQueryState={encoded}"


def fetch_zip(zip_code):
    """Fetch rental listings for a single ZIP from Zillow."""
    url = build_zillow_url(zip_code)
    print(f"  Fetching ZIP {zip_code} from Zillow...")

    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            html = resp.read().decode("utf-8")
    except Exception as e:
        print(f"  ERROR fetching {zip_code}: {e}")
        return []

    match = re.search(
        r'<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)</script>', html, re.DOTALL
    )
    if not match:
        print(f"  WARNING: No __NEXT_DATA__ found for {zip_code}")
        return []

    data = json.loads(match.group(1))
    results = (
        data.get("props", {})
        .get("pageProps", {})
        .get("searchPageState", {})
        .get("cat1", {})
        .get("searchResults", {})
        .get("listResults", [])
    )
    print(f"  Found {len(results)} listings in ZIP {zip_code}")
    return results


def parse_listing(r, zip_code):
    """Parse a Zillow listing result into our standard format."""
    is_building = r.get("isBuilding", False)
    units = r.get("units", [])
    lat_long = r.get("latLong", {})

    if is_building and units:
        # Apartment complex — create one entry per unit type
        parsed = []
        for unit in units:
            price_str = unit.get("price", "$0")
            price = int(re.sub(r"[^\d]", "", price_str.split("+")[0].split("/")[0]))
            if price == 0:
                continue
            beds_str = unit.get("beds", "0")
            beds = int(re.sub(r"[^\d]", "", beds_str)) if beds_str else None
            parsed.append({
                "address": r.get("address", ""),
                "buildingName": r.get("buildingName", r.get("statusText", "")),
                "price": price,
                "beds": beds,
                "baths": None,
                "sqft": None,
                "yearBuilt": None,
                "lat": lat_long.get("latitude"),
                "lon": lat_long.get("longitude"),
                "zip": r.get("addressZipcode", zip_code),
                "url": r.get("detailUrl", ""),
                "zpid": str(r.get("zpid", "")),
                "lotSqft": None,
                "lotAcres": None,
                "hasPool": False,
                "isWaterfront": False,
                "dom": None,
                "homeType": "apartment",
                "source": "zillow",
                "isBuilding": True,
            })
        return parsed
    else:
        # Single listing (SFH, townhouse, condo)
        price_str = r.get("price", "$0")
        price = int(re.sub(r"[^\d]", "", price_str.split("+")[0].split("/")[0]))
        if price == 0:
            return []

        # Get detail data if available
        detail = r.get("hdpData", {}).get("homeInfo", {})

        return [{
            "address": r.get("address", detail.get("streetAddress", "")),
            "buildingName": None,
            "price": price,
            "beds": detail.get("bedrooms", r.get("beds")),
            "baths": detail.get("bathrooms", r.get("baths")),
            "sqft": detail.get("livingArea", r.get("area")),
            "yearBuilt": detail.get("yearBuilt"),
            "lat": lat_long.get("latitude", detail.get("latitude")),
            "lon": lat_long.get("longitude", detail.get("longitude")),
            "zip": r.get("addressZipcode", detail.get("zipcode", zip_code)),
            "url": r.get("detailUrl", ""),
            "zpid": str(detail.get("zpid", r.get("zpid", ""))),
            "lotSqft": detail.get("lotSize"),
            "lotAcres": round(detail["lotSize"] / 43560, 2) if detail.get("lotSize") else None,
            "hasPool": False,  # Zillow doesn't reliably expose this in search
            "isWaterfront": False,
            "dom": None,
            "homeType": detail.get("homeType", "unknown").lower(),
            "source": "zillow",
            "isBuilding": False,
        }]


def main():
    all_rentals = []
    seen_keys = set()

    for zip_code in TARGET_ZIPS:
        results = fetch_zip(zip_code)
        for r in results:
            parsed = parse_listing(r, zip_code)
            for rental in parsed:
                # Dedup by address + price
                key = f"{rental['address']}_{rental['price']}_{rental.get('beds','')}"
                if key not in seen_keys:
                    seen_keys.add(key)
                    all_rentals.append(rental)
        time.sleep(3)  # Be polite

    print(f"\nTotal unique rental listings: {len(all_rentals)}")

    if all_rentals:
        sfh = sum(1 for r in all_rentals if not r.get("isBuilding"))
        apt = sum(1 for r in all_rentals if r.get("isBuilding"))
        print(f"  Single-family/townhouse/condo: {sfh}")
        print(f"  Apartment units: {apt}")

        prices = [r["price"] for r in all_rentals if r["price"]]
        if prices:
            print(f"  Price range: ${min(prices):,}/mo - ${max(prices):,}/mo")

    # Save raw rentals — but don't overwrite good data with empty on fetch failure
    raw_output = os.path.join(SCRIPT_DIR, "data", "rental-listings-raw.json")
    if all_rentals:
        with open(raw_output, "w") as f:
            json.dump(all_rentals, f, indent=2)
        print(f"\nSaved {len(all_rentals)} rentals to {raw_output}")
    else:
        if os.path.exists(raw_output):
            print(f"\nFetch returned 0 results — keeping existing {raw_output}")
        else:
            with open(raw_output, "w") as f:
                json.dump([], f)
            print(f"\nNo rentals found and no existing data — saved empty to {raw_output}")

    return all_rentals


if __name__ == "__main__":
    main()
