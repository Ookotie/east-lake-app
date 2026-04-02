#!/usr/bin/env python3
"""Send daily East Lake housing digest to Telegram.

Reads changes.json and sends a formatted market update.
7 AM run: full digest. 7 PM run: only alerts for high-scoring new listings.

Env vars required: TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
"""

import json
import os
import sys
import urllib.request
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(os.path.dirname(SCRIPT_DIR), "data")

# Move-in target
MOVE_IN_DATE = datetime(2026, 6, 1)
HOT_DEAL_THRESHOLD = 55  # Score threshold for evening alerts

# App URL
APP_URL = "east-lake-app.vercel.app"


def load_json(path):
    if not os.path.exists(path):
        return {}
    with open(path) as f:
        return json.load(f)


def format_price(price, monthly=False):
    """Format price for display."""
    if not price:
        return "?"
    if monthly:
        return f"${price:,}/mo"
    if price >= 1_000_000:
        return f"${price / 1_000_000:.2f}M"
    return f"${price / 1000:.0f}K"


def build_full_digest(changes):
    """Build the full morning digest message."""
    date = changes.get("date", datetime.now().strftime("%Y-%m-%d"))
    days_to_move = (MOVE_IN_DATE - datetime.now()).days

    sale = changes.get("forSale", {})
    rental = changes.get("rentals", {})
    stats = changes.get("stats", {})

    lines = []
    lines.append(f"East Lake Daily -- {datetime.now().strftime('%b %-d')} ({days_to_move} days to move-in)")
    lines.append("")

    # FOR SALE section
    sale_new = sale.get("new", [])
    sale_removed = sale.get("removed", [])
    sale_price = sale.get("priceChanges", [])

    lines.append(f"FOR SALE: {sale.get('total', 0)} active")
    parts = []
    if sale_new:
        parts.append(f"+{len(sale_new)} new")
    if sale_removed:
        parts.append(f"-{len(sale_removed)} removed")
    if sale_price:
        parts.append(f"{len(sale_price)} price {'drop' if len(sale_price) == 1 else 'drops'}")
    if parts:
        lines.append(f" {' | '.join(parts)}")
    elif not sale_new and not sale_removed and not sale_price:
        lines.append(" No changes today")

    # New for-sale listings (top 5)
    if sale_new:
        lines.append("")
        lines.append("NEW:")
        for l in sale_new[:5]:
            beds = l.get("beds", "?")
            baths = l.get("baths", "?")
            sqft = f"{l['sqft']:,}" if l.get("sqft") else "?"
            score = l.get("score", 0)
            addr = l["address"].split(",")[0]  # Street only
            lines.append(f" {addr} -- {format_price(l['price'])} -- {beds}/{baths} {sqft}sf -- Score {score:.0f}")
        if len(sale_new) > 5:
            lines.append(f" ...and {len(sale_new) - 5} more")

    # Price drops
    if sale_price:
        lines.append("")
        lines.append("PRICE DROPS:" if any(c["pctChange"] < 0 for c in sale_price) else "PRICE CHANGES:")
        for c in sale_price[:5]:
            addr = c["address"].split(",")[0]
            lines.append(f" {addr} -- {format_price(c['oldPrice'])} > {format_price(c['newPrice'])} ({c['pctChange']:+.1f}%)")

    # Removed
    if sale_removed:
        lines.append("")
        lines.append("REMOVED:")
        for l in sale_removed[:3]:
            addr = l["address"].split(",")[0]
            lines.append(f" {addr} (was {format_price(l['price'])})")
        if len(sale_removed) > 3:
            lines.append(f" ...and {len(sale_removed) - 3} more")

    # RENTALS section
    rental_new = rental.get("new", [])
    rental_removed = rental.get("removed", [])
    rental_price = rental.get("priceChanges", [])

    lines.append("")
    lines.append(f"RENTALS: {rental.get('total', 0)} active")
    parts = []
    if rental_new:
        parts.append(f"+{len(rental_new)} new")
    if rental_removed:
        parts.append(f"-{len(rental_removed)} removed")
    if rental_price:
        parts.append(f"{len(rental_price)} price changes")
    if parts:
        lines.append(f" {' | '.join(parts)}")
    elif not rental_new and not rental_removed and not rental_price:
        lines.append(" No changes today")

    if rental_new:
        for r in rental_new[:3]:
            beds = r.get("beds", "?")
            baths = r.get("baths", "?")
            sqft = f"{r['sqft']:,}" if r.get("sqft") else "?"
            addr = r["address"].split(",")[0]
            lines.append(f" {addr} -- {format_price(r['price'], monthly=True)} -- {beds}/{baths} {sqft}sf")

    # Market stats
    if stats:
        lines.append("")
        lines.append(f"Median ask: {format_price(stats.get('medianSalePrice', 0))} | $/sf: ${stats.get('medianPpsf', 0)} | Avg DOM: {stats.get('avgDom', 0)}")

    # Top 3 deals
    for_sale_data = load_json(os.path.join(DATA_DIR, "active-listings.json"))
    if isinstance(for_sale_data, list):
        top3 = sorted(for_sale_data, key=lambda x: x.get("score", 0), reverse=True)[:3]
        if top3:
            deal_str = " | ".join(
                f"{l['address'].split(',')[0].split(' ')[-2]} {l['address'].split(',')[0].split(' ')[-1]}({l['score']:.0f})"
                for l in top3
            )
            lines.append(f"Top deals: {deal_str}")

    lines.append("")
    lines.append(APP_URL)

    return "\n".join(lines)


def build_evening_alert(changes):
    """Build evening alert for high-scoring new listings only."""
    sale = changes.get("forSale", {})
    rental = changes.get("rentals", {})

    hot_sales = [l for l in sale.get("new", []) if l.get("score", 0) >= HOT_DEAL_THRESHOLD]
    hot_rentals = [r for r in rental.get("new", []) if r.get("score", 0) >= HOT_DEAL_THRESHOLD]

    if not hot_sales and not hot_rentals:
        return None  # Nothing to alert

    lines = []
    lines.append(f"East Lake Alert -- {datetime.now().strftime('%b %-d %I:%M %p')}")
    lines.append("")

    if hot_sales:
        lines.append(f"HOT NEW LISTINGS ({len(hot_sales)}):")
        for l in hot_sales[:5]:
            beds = l.get("beds", "?")
            baths = l.get("baths", "?")
            sqft = f"{l['sqft']:,}" if l.get("sqft") else "?"
            addr = l["address"].split(",")[0]
            lines.append(f" {addr} -- {format_price(l['price'])} -- {beds}/{baths} {sqft}sf -- Score {l['score']:.0f}")

    if hot_rentals:
        lines.append(f"\nHOT NEW RENTALS ({len(hot_rentals)}):")
        for r in hot_rentals[:5]:
            beds = r.get("beds", "?")
            addr = r["address"].split(",")[0]
            lines.append(f" {addr} -- {format_price(r['price'], monthly=True)} -- {beds}bd -- Score {r['score']}")

    lines.append("")
    lines.append(APP_URL)

    return "\n".join(lines)


def send_telegram(message, bot_token, chat_id):
    """Send a message via Telegram Bot API."""
    # Split message if too long (Telegram limit: 4096 chars)
    messages = []
    if len(message) > 3500:
        # Split at the RENTALS section
        parts = message.split("\nRENTALS:")
        if len(parts) == 2:
            messages.append(parts[0].rstrip())
            messages.append("RENTALS:" + parts[1])
        else:
            messages.append(message[:3500] + "\n...")
    else:
        messages.append(message)

    for msg in messages:
        data = json.dumps({
            "chat_id": chat_id,
            "text": msg,
            "parse_mode": "HTML",
            "disable_web_page_preview": True,
        }).encode()

        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        req = urllib.request.Request(
            url,
            data=data,
            headers={"Content-Type": "application/json"},
        )
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                result = json.loads(resp.read().decode())
                if result.get("ok"):
                    print(f"  Sent message ({len(msg)} chars)")
                else:
                    print(f"  WARNING: Telegram API returned: {result}")
        except Exception as e:
            print(f"  ERROR sending Telegram message: {e}")


def main():
    dry_run = "--dry-run" in sys.argv
    evening = "--evening" in sys.argv

    # Load changes
    changes = load_json(os.path.join(DATA_DIR, "changes.json"))
    if not changes:
        print("No changes.json found. Run detect_changes.py first.")
        sys.exit(1)

    # Build message
    if evening:
        message = build_evening_alert(changes)
        if not message:
            print("No hot deals to alert. Skipping evening message.")
            return
    else:
        message = build_full_digest(changes)

    print(f"\n{'='*50}")
    print(message)
    print(f"{'='*50}")
    print(f"\nMessage length: {len(message)} chars")

    if dry_run:
        print("\n[DRY RUN] Not sending to Telegram.")
        return

    # Get Telegram credentials
    bot_token = os.environ.get("TELEGRAM_BOT_TOKEN")
    chat_id = os.environ.get("TELEGRAM_CHAT_ID")

    if not bot_token or not chat_id:
        # Try loading from oni-hub/.env
        env_paths = [
            os.path.expanduser("~/oni-hub/.env"),
            "/mnt/c/Users/ookot/oni-ecosystem/oni-hub/.env",
        ]
        env_path = next((p for p in env_paths if os.path.exists(p)), None)
        if env_path:
            with open(env_path) as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("TELEGRAM_BOT_TOKEN="):
                        bot_token = line.split("=", 1)[1].strip().strip('"')
                    elif line.startswith("TELEGRAM_CHAT_ID="):
                        chat_id = line.split("=", 1)[1].strip().strip('"')

    if not bot_token or not chat_id:
        print("ERROR: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must be set.")
        print("Set as env vars or in ~/oni-hub/.env")
        sys.exit(1)

    send_telegram(message, bot_token, chat_id)
    print("Done!")


if __name__ == "__main__":
    main()
