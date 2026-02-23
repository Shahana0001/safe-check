import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, IndianRupee, ThumbsUp, ThumbsDown, Lightbulb, AlertTriangle, CheckCircle, Download } from "lucide-react";
import type { Subscription } from "@/lib/sms-parser";

interface SmartAlertsProps {
  subscriptions: Subscription[];
}

export function SmartAlerts({ subscriptions }: SmartAlertsProps) {
  const [dismissed, setDismissed] = useState<Record<string, "yes" | "no">>({});

  if (subscriptions.length === 0) return null;

  const potentialSavings = subscriptions
    .filter((s) => dismissed[s.merchant] === "no")
    .reduce((sum, s) => sum + s.yearlyCost, 0);

  const riskBadge = (level: "safe" | "moderate" | "danger") => {
    const config = {
      safe: { label: "Low", className: "border-safe/50 text-safe bg-safe/10" },
      moderate: { label: "Medium", className: "border-moderate/50 text-moderate bg-moderate/10" },
      danger: { label: "High", className: "border-danger/50 text-danger bg-danger/10" },
    };
    const c = config[level];
    return <Badge variant="outline" className={`${c.className} text-xs`}>{c.label} Cost</Badge>;
  };

  const generateReport = () => {
    const lines = [
      "ReceiptGuard — Subscription Summary Report",
      `Generated: ${new Date().toLocaleDateString("en-IN")}`,
      "═".repeat(50),
      "",
      "DETECTED SUBSCRIPTIONS:",
      "",
    ];

    for (const sub of subscriptions) {
      const status = dismissed[sub.merchant] === "no" ? "❌ NOT USING" : dismissed[sub.merchant] === "yes" ? "✅ ACTIVE" : "⚠️ REVIEW";
      lines.push(`${status} ${sub.merchant}`);
      lines.push(`   Amount: ₹${sub.amount}/mo | Yearly: ₹${sub.yearlyCost}`);
      lines.push(`   Frequency: ${sub.frequency} | Risk: ${sub.riskLevel}`);
      if (sub.nextExpectedDate) {
        lines.push(`   Next charge: ${sub.nextExpectedDate.toLocaleDateString("en-IN")}`);
      }
      lines.push("");
    }

    const totalYearly = subscriptions.reduce((s, sub) => s + sub.yearlyCost, 0);
    lines.push("═".repeat(50));
    lines.push(`Total Yearly Spend: ₹${Math.round(totalYearly).toLocaleString("en-IN")}`);
    lines.push(`Potential Savings: ₹${Math.round(potentialSavings).toLocaleString("en-IN")}`);
    lines.push("");
    lines.push("Tip: Cancel unused subscriptions to save money!");

    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ReceiptGuard-Report.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-warning/10">
            <Lightbulb className="h-5 w-5 text-warning" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold">Smart Alerts</h2>
            <p className="text-sm text-muted-foreground">Review your subscriptions & find savings</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={generateReport} className="gap-2">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Savings Banner */}
      {potentialSavings > 0 && (
        <Card className="p-4 border-danger/30 bg-danger/5">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-danger shrink-0" />
            <div>
              <p className="font-semibold">
                You could save <span className="text-danger font-display">₹{Math.round(potentialSavings).toLocaleString("en-IN")}/year</span> by cancelling unused subscriptions
              </p>
              <p className="text-sm text-muted-foreground">Review each subscription below and mark the ones you don't use</p>
            </div>
          </div>
        </Card>
      )}

      {/* Subscription Cards */}
      <div className="grid gap-4">
        {subscriptions.map((sub) => (
          <Card key={sub.merchant} className={`p-5 border-border transition-all ${dismissed[sub.merchant] === "no" ? "border-danger/40 bg-danger/5" : dismissed[sub.merchant] === "yes" ? "border-safe/40 bg-safe/5" : "bg-card"}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-display font-bold text-lg">{sub.merchant}</h3>
                  {riskBadge(sub.riskLevel)}
                  <Badge variant="secondary" className="text-xs">{sub.frequency}</Badge>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <IndianRupee className="h-3.5 w-3.5" />
                    ₹{sub.amount}/
                    {sub.frequency === "yearly" ? "yr" : "mo"}
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUpIcon />
                    ₹{sub.yearlyCost.toLocaleString("en-IN")}/year
                  </span>
                  {sub.nextExpectedDate && (
                    <span className="flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      Next: {sub.nextExpectedDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    </span>
                  )}
                </div>

                {dismissed[sub.merchant] === "no" && (
                  <p className="text-sm text-danger font-medium flex items-center gap-1">
                    <CheckCircle className="h-3.5 w-3.5" />
                    Potential saving: ₹{sub.yearlyCost.toLocaleString("en-IN")}/year
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <p className="text-xs text-muted-foreground mr-2 hidden sm:block">Do you use this?</p>
                <Button
                  size="sm"
                  variant={dismissed[sub.merchant] === "yes" ? "default" : "outline"}
                  onClick={() => setDismissed((d) => ({ ...d, [sub.merchant]: "yes" }))}
                  className="gap-1"
                >
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Yes
                </Button>
                <Button
                  size="sm"
                  variant={dismissed[sub.merchant] === "no" ? "destructive" : "outline"}
                  onClick={() => setDismissed((d) => ({ ...d, [sub.merchant]: "no" }))}
                  className="gap-1"
                >
                  <ThumbsDown className="h-3.5 w-3.5" />
                  No
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function TrendingUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
  );
}
