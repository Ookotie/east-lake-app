import { Card, CardContent } from "@/components/ui/card";

export default function AlertsPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold text-slate-900 pt-2">Listing Alerts</h1>
      <p className="text-sm text-slate-500">
        Real-time monitoring for new listings in the East Lake HS zone.
      </p>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4 text-center space-y-3">
          <div className="text-4xl">🔔</div>
          <div className="text-sm font-semibold text-blue-800">Coming Soon</div>
          <div className="text-xs text-blue-600">
            Automated scraping will check Redfin every 6 hours for new listings matching your criteria.
            You&apos;ll get a notification when a great deal appears.
          </div>
          <div className="text-xs text-blue-500 mt-2">
            Criteria: SFH &middot; 3,000+ sqft &middot; $800K-$2.5M &middot; ELHS Zone
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">How it works</h3>
          <ol className="text-xs text-slate-600 space-y-2 list-decimal list-inside">
            <li>Every 6 hours, we check Redfin for new active listings</li>
            <li>Each listing is scored against the 257 sold comps in our database</li>
            <li>If the score beats 70% of recent sales, you get an alert</li>
            <li>Tap the alert to see the full analysis + closest comparable sales</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
