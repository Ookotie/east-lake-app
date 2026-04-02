#!/bin/bash
# Fetch, score, commit and push rental listings
# Runs via Windows Task Scheduler → WSL

set -e

REPO_DIR="/mnt/c/Users/ookot/east-lake/east-lake-app"
LOG_FILE="$REPO_DIR/scripts/data/rental-refresh.log"

cd "$REPO_DIR"

echo "=== Rental refresh $(date) ===" >> "$LOG_FILE"

# Pull latest first
git pull --rebase origin master >> "$LOG_FILE" 2>&1

# Fetch from Zillow
python3 scripts/fetch_rental_listings.py >> "$LOG_FILE" 2>&1

# Score
python3 scripts/score_rental_listings.py >> "$LOG_FILE" 2>&1

# Commit and push if changed
git add data/rental-listings.json scripts/data/rental-listings-raw.json scripts/data/rental-listings-scored.json
if ! git diff --staged --quiet; then
    git commit -m "chore: refresh rental listings $(date +%Y-%m-%d-%H%M)" >> "$LOG_FILE" 2>&1
    git push >> "$LOG_FILE" 2>&1
    echo "Pushed rental update" >> "$LOG_FILE"
else
    echo "No rental changes" >> "$LOG_FILE"
fi

echo "=== Done $(date) ===" >> "$LOG_FILE"
