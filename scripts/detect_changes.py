#!/usr/bin/env python3
"""Detect changes in for-sale and rental listings day-over-day.

Compares today's scored listings against yesterday's snapshot to find:
- New listings
- Removed listings
- Price changes

Outputs changes.json (today) and appends to changes-history.json (rolling 30 days).
"""

import json
import os
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "data")
SNAPSHOT_DIR = os.path.join(SCRIPT_DIR, "data")


def load_json(path):
    """Load JSON file, return empty list if not found."""
    if not os.path.exists(path):
        return []
    with open(path) as f:
        return json.load(f)


def save_json(path, data):
    """Save JSON data to file."""
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


def diff_listings(today, yesterday, id_key="mlsId"):
    """Compare today's listings to yesterday's snapshot.

    Returns dict with new, removed, and price_changes lists.
    """
    today_by_id = {l[id_key]: l for l in today if l.get(id_key)}
    yesterday_by_id = {l[id_key]: l for l in yesterday if l.get(id_key)}

    today_ids = set(today_by_id.keys())
    yesterday_ids = set(yesterday_by_id.keys())

    new_listings = []
    for lid in today_ids - yesterday_ids:
        l = today_by_id[lid]
        new_listings.append({
            "address": l.get("address", ""),
            "price": l.get("price", 0),
            "beds": l.get("beds"),
            "baths": l.get("baths"),
            "sqft": l.get("sqft"),
            "score": l.get("score", 0),
            "url": l.get("url", ""),
            id_key: lid,
        })

    removed_listings = []
    for lid in yesterday_ids - today_ids:
        l = yesterday_by_id[lid]
        removed_listings.append({
            "address": l.get("address", ""),
            "price": l.get("price", 0),
            "beds": l.get("beds"),
            "baths": l.get("baths"),
            "sqft": l.get("sqft"),
            id_key: lid,
        })

    price_changes = []
    for lid in today_ids & yesterday_ids:
        old_price = yesterday_by_id[lid].get("price", 0)
        new_price = today_by_id[lid].get("price", 0)
        if old_price and new_price and old_price != new_price:
            pct = round((new_price - old_price) / old_price * 100, 1)
            price_changes.append({
                "address": today_by_id[lid].get("address", ""),
                "oldPrice": old_price,
                "newPrice": new_price,
                "pctChange": pct,
                "score": today_by_id[lid].get("score", 0),
                "dom": today_by_id[lid].get("dom"),
                "url": today_by_id[lid].get("url", ""),
                id_key: lid,
            })

    # Sort: new listings by score desc, price changes by magnitude
    new_listings.sort(key=lambda x: x.get("score", 0), reverse=True)
    price_changes.sort(key=lambda x: x.get("pctChange", 0))

    return {
        "new": new_listings,
        "removed": removed_listings,
        "priceChanges": price_changes,
    }


def compute_market_stats(for_sale, rentals):
    """Compute summary market statistics."""
    sale_prices = [l.get("price", 0) for l in for_sale if l.get("price")]
    sale_ppsfs = [l.get("ppsf", 0) for l in for_sale if l.get("ppsf")]
    rental_prices = [r.get("price", 0) for r in rentals if r.get("price")]

    return {
        "forSaleCount": len(for_sale),
        "rentalCount": len(rentals),
        "medianSalePrice": sorted(sale_prices)[len(sale_prices) // 2] if sale_prices else 0,
        "medianPpsf": sorted(sale_ppsfs)[len(sale_ppsfs) // 2] if sale_ppsfs else 0,
        "medianRent": sorted(rental_prices)[len(rental_prices) // 2] if rental_prices else 0,
        "avgDom": round(sum(l.get("dom", 0) or 0 for l in for_sale) / len(for_sale)) if for_sale else 0,
    }


def merge_changes(existing, new_diff, id_key):
    """Merge new diff findings into existing changes, deduplicating by id_key."""
    merged = {}
    for field in ("new", "removed", "priceChanges"):
        seen = {item[id_key] for item in existing.get(field, []) if item.get(id_key)}
        combined = list(existing.get(field, []))
        for item in new_diff.get(field, []):
            if item.get(id_key) and item[id_key] not in seen:
                combined.append(item)
                seen.add(item[id_key])
        merged[field] = combined
    return merged


def main():
    import sys

    rotate_snapshot = "--no-rotate" not in sys.argv
    today = datetime.now().strftime("%Y-%m-%d")
    print(f"Detecting changes for {today} (rotate={rotate_snapshot})...")

    # Load today's data
    for_sale = load_json(os.path.join(DATA_DIR, "active-listings.json"))
    rentals = load_json(os.path.join(DATA_DIR, "rental-listings.json"))

    # Load yesterday's snapshots
    prev_sale = load_json(os.path.join(SNAPSHOT_DIR, "previous-snapshot.json"))
    prev_rental = load_json(os.path.join(SNAPSHOT_DIR, "previous-rental-snapshot.json"))

    print(f"  For sale: {len(for_sale)} today, {len(prev_sale)} yesterday")
    print(f"  Rentals:  {len(rentals)} today, {len(prev_rental)} yesterday")

    # Diff for-sale listings (keyed by mlsId)
    sale_diff = diff_listings(for_sale, prev_sale, id_key="mlsId")

    # Diff rentals (keyed by zpid since Zillow uses zpid)
    rental_diff = diff_listings(rentals, prev_rental, id_key="zpid")

    # If changes.json already exists for today, merge new findings into it
    # so the evening run doesn't erase the morning run's discoveries (or vice versa)
    changes_path = os.path.join(DATA_DIR, "changes.json")
    existing = load_json(changes_path)
    if isinstance(existing, dict) and existing.get("date") == today:
        print("  Merging with existing changes from earlier run today")
        sale_diff = merge_changes(existing.get("forSale", {}), sale_diff, "mlsId")
        rental_diff = merge_changes(existing.get("rentals", {}), rental_diff, "zpid")

    # Compute market stats
    stats = compute_market_stats(for_sale, rentals)

    # Build changes object
    changes = {
        "date": today,
        "forSale": {
            "total": len(for_sale),
            **sale_diff,
        },
        "rentals": {
            "total": len(rentals),
            **rental_diff,
        },
        "stats": stats,
    }

    # Summary
    print(f"\n=== CHANGES ===")
    print(f"  For sale: +{len(sale_diff['new'])} new, -{len(sale_diff['removed'])} removed, {len(sale_diff['priceChanges'])} price changes")
    print(f"  Rentals:  +{len(rental_diff['new'])} new, -{len(rental_diff['removed'])} removed, {len(rental_diff['priceChanges'])} price changes")

    if sale_diff["new"]:
        print(f"\n  New for-sale:")
        for l in sale_diff["new"][:5]:
            print(f"    ${l['price']:,} | {l.get('beds','?')}bd | Score {l['score']} | {l['address'][:50]}")

    if sale_diff["priceChanges"]:
        print(f"\n  Price changes:")
        for c in sale_diff["priceChanges"][:5]:
            print(f"    ${c['oldPrice']:,} > ${c['newPrice']:,} ({c['pctChange']:+.1f}%) | {c['address'][:50]}")

    if rental_diff["new"]:
        print(f"\n  New rentals:")
        for r in rental_diff["new"][:5]:
            print(f"    ${r['price']:,}/mo | {r.get('beds','?')}bd | Score {r['score']} | {r['address'][:50]}")

    # Save changes.json
    save_json(changes_path, changes)
    print(f"\nSaved {changes_path}")

    # Append to changes-history.json (rolling 30 days)
    history_path = os.path.join(DATA_DIR, "changes-history.json")
    history = load_json(history_path)
    # Remove existing entry for today if re-running
    history = [h for h in history if h.get("date") != today]
    history.append(changes)
    # Keep only last 30 days
    history = history[-30:]
    save_json(history_path, history)
    print(f"Saved history ({len(history)} days) to {history_path}")

    # Only rotate snapshots when told to (morning run).
    # The evening run passes --no-rotate so the morning run still diffs
    # against the previous day's baseline and catches everything.
    if rotate_snapshot:
        save_json(os.path.join(SNAPSHOT_DIR, "previous-snapshot.json"), for_sale)
        save_json(os.path.join(SNAPSHOT_DIR, "previous-rental-snapshot.json"), rentals)
        print("Updated snapshots for next run")
    else:
        print("Skipping snapshot rotation (--no-rotate)")

    return changes


if __name__ == "__main__":
    main()
