#!/usr/bin/env python3
"""Process and rank sold properties from Redfin data for East Lake HS zone."""

import json
import os
from datetime import datetime
from collections import Counter

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "data")


def load_and_process():
    raw_input = os.path.join(SCRIPT_DIR, "data", "raw-properties.json")
    with open(raw_input) as f:
        all_props = json.load(f)

    # Convert soldDate epoch ms to readable dates
    for p in all_props:
        if p.get('soldDate'):
            dt = datetime.fromtimestamp(p['soldDate'] / 1000)
            p['soldDateStr'] = dt.strftime('%Y-%m-%d')
            p['soldMonth'] = dt.strftime('%Y-%m')
            p['soldYear'] = dt.year
        # Calculate lot acres
        if p.get('lotSqft'):
            p['lotAcres'] = round(p['lotSqft'] / 43560, 2)
        # Ensure beds exists
        if 'beds' not in p or p['beds'] is None:
            p['beds'] = 0

    # Filter: only properties with valid data
    valid = [p for p in all_props if p.get('price') and p.get('sqft') and p.get('soldDate')]

    # Filter: only sold within last 3 years (since March 2023)
    cutoff = datetime(2023, 3, 21).timestamp() * 1000
    valid = [p for p in valid if p['soldDate'] >= cutoff]

    # Filter: only properties in East Lake HS zone
    valid = [p for p in valid if p.get('inZone', p.get('zip') in ('34685', '34688'))]

    print(f"\nTotal raw properties: {len(all_props)}")
    print(f"Valid properties (with price/sqft/date, last 3yr): {len(valid)}")

    # === SALE MONTH FREQUENCY ANALYSIS ===
    months = Counter(p['soldMonth'] for p in valid)
    print("\n=== SALE MONTH FREQUENCY ===")
    for month in sorted(months.keys()):
        bar = '#' * months[month]
        print(f"  {month}: {months[month]:3d} {bar}")

    # Quarterly summary
    quarters = Counter()
    for p in valid:
        dt = datetime.fromtimestamp(p['soldDate'] / 1000)
        q = f"{dt.year}-Q{(dt.month - 1) // 3 + 1}"
        quarters[q] = quarters.get(q, 0) + 1
    print("\n=== QUARTERLY SUMMARY ===")
    for q in sorted(quarters.keys()):
        bar = '#' * (quarters[q] // 2)
        print(f"  {q}: {quarters[q]:3d} {bar}")

    # === SCORING ===
    def score_property(prop, all_p):
        score = 0

        # 1. Price/sqft value (25 pts) - lower is better
        ppsf_vals = [p['ppsf'] for p in all_p if p.get('ppsf')]
        if ppsf_vals and prop.get('ppsf'):
            min_ppsf, max_ppsf = min(ppsf_vals), max(ppsf_vals)
            if max_ppsf > min_ppsf:
                score += 25 * (1 - (prop['ppsf'] - min_ppsf) / (max_ppsf - min_ppsf))

        # 2. Lot size (15 pts) - bigger is better, cap at 2 acres
        lot_vals = [min(p.get('lotSqft', 0), 87120) for p in all_p]
        if lot_vals and prop.get('lotSqft'):
            lot_capped = min(prop['lotSqft'], 87120)
            min_lot, max_lot = min(lot_vals), max(lot_vals)
            if max_lot > min_lot:
                score += 15 * ((lot_capped - min_lot) / (max_lot - min_lot))

        # 3. Year built + condition (20 pts)
        yb = prop.get('yearBuilt', 1990)
        if yb >= 2020: score += 18
        elif yb >= 2010: score += 15
        elif yb >= 2000: score += 12
        elif yb >= 1995: score += 9
        elif yb >= 1990: score += 7
        elif yb >= 1985: score += 5
        else: score += 3
        score = min(score, 20) if score > 20 else score

        # 4. Features (15 pts)
        if prop.get('lotSqft', 0) > 21780:
            score += 5
        if prop.get('hoa') is not None:
            if prop['hoa'] < 150:
                score += 5
            elif prop['hoa'] < 250:
                score += 3
            elif prop['hoa'] < 400:
                score += 1
        else:
            score += 4
        beds = prop.get('beds', 0)
        if beds >= 5: score += 3
        elif beds >= 4: score += 1
        baths = prop.get('baths', 0)
        if baths >= 4: score += 2

        # 5. Size efficiency (10 pts)
        eff_vals = [p['sqft'] / p['price'] for p in all_p if p.get('sqft') and p.get('price')]
        if eff_vals and prop.get('sqft') and prop.get('price'):
            eff = prop['sqft'] / prop['price']
            min_eff, max_eff = min(eff_vals), max(eff_vals)
            if max_eff > min_eff:
                score += 10 * ((eff - min_eff) / (max_eff - min_eff))

        # 6. Recency bonus (5 pts)
        if yb >= 2015: score += 5
        elif yb >= 2005: score += 3
        elif yb >= 2000: score += 1

        return round(score, 1)

    # Score all properties
    for p in valid:
        p['score'] = score_property(p, valid)

    # Sort by score descending
    valid.sort(key=lambda x: x['score'], reverse=True)

    # === SUMMARY STATS ===
    prices = [p['price'] for p in valid]
    ppsf_all = [p['ppsf'] for p in valid if p.get('ppsf')]
    sqfts = [p['sqft'] for p in valid]

    print(f"\n=== SUMMARY STATISTICS ===")
    print(f"  Properties analyzed: {len(valid)}")
    print(f"  Price range: ${min(prices):,.0f} - ${max(prices):,.0f}")
    print(f"  Median price: ${sorted(prices)[len(prices)//2]:,.0f}")
    print(f"  Avg price: ${sum(prices)/len(prices):,.0f}")
    print(f"  Avg $/sqft: ${sum(ppsf_all)/len(ppsf_all):,.0f}")
    print(f"  SqFt range: {min(sqfts):,} - {max(sqfts):,}")
    print(f"  Avg sqft: {sum(sqfts)/len(sqfts):,.0f}")

    # Save processed data
    scored_output = os.path.join(SCRIPT_DIR, "data", "all-properties-scored.json")
    with open(scored_output, 'w') as f:
        json.dump(valid, f, indent=2)

    # Also copy to app data dir
    app_output = os.path.join(DATA_DIR, "all-properties-scored.json")
    with open(app_output, 'w') as f:
        json.dump(valid, f, indent=2)

    print(f"\nSaved {len(valid)} scored properties to {scored_output}")
    print(f"Also saved to {app_output}")
    return valid

if __name__ == '__main__':
    load_and_process()
