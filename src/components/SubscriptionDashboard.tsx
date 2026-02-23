import { Card } from "@/components/ui/card";
import { IndianRupee, TrendingUp, CreditCard, AlertCircle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { Subscription } from "@/lib/sms-parser";

interface DashboardProps {
  subscriptions: Subscription[];
}

const COLORS = [
  "hsl(160, 84%, 39%)",
  "hsl(210, 70%, 50%)",
  "hsl(38, 92%, 50%)",
  "hsl(280, 60%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(190, 70%, 45%)",
  "hsl(330, 65%, 50%)",
  "hsl(60, 70%, 45%)",
];

function StatCard({ icon: Icon, label, value, subtitle, variant = "default" }: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtitle?: string;
  variant?: "default" | "danger" | "warning" | "safe";
}) {
  const variantClasses = {
    default: "bg-primary/10 text-primary",
    danger: "bg-danger/10 text-danger",
    warning: "bg-moderate/10 text-moderate",
    safe: "bg-safe/10 text-safe",
  };

  return (
    <Card className="p-5 border-border bg-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{label}</p>
          <p className="text-2xl font-display font-bold mt-1 animate-count-up">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${variantClasses[variant]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Card>
  );
}

export function SubscriptionDashboard({ subscriptions }: DashboardProps) {
  if (subscriptions.length === 0) return null;

  const totalMonthly = subscriptions.reduce((s, sub) => {
    if (sub.frequency === "monthly") return s + sub.amount;
    if (sub.frequency === "yearly") return s + sub.amount / 12;
    return s + sub.amount;
  }, 0);

  const totalYearly = subscriptions.reduce((s, sub) => s + sub.yearlyCost, 0);
  const highest = subscriptions[0];
  const autoDebits = subscriptions.filter((s) => s.transactions.some((t) => t.isAutoDebit)).length;

  const pieData = subscriptions.map((s) => ({
    name: s.merchant,
    value: s.yearlyCost,
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <TrendingUp className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Subscription Dashboard</h2>
          <p className="text-sm text-muted-foreground">Overview of your recurring spending</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={IndianRupee}
          label="Monthly Spending"
          value={`₹${Math.round(totalMonthly).toLocaleString("en-IN")}`}
          variant="default"
        />
        <StatCard
          icon={TrendingUp}
          label="Yearly Spending"
          value={`₹${Math.round(totalYearly).toLocaleString("en-IN")}`}
          subtitle="Total recurring cost"
          variant="danger"
        />
        <StatCard
          icon={CreditCard}
          label="Highest Subscription"
          value={highest.merchant}
          subtitle={`₹${highest.yearlyCost.toLocaleString("en-IN")}/yr`}
          variant="warning"
        />
        <StatCard
          icon={AlertCircle}
          label="Active Auto-Debits"
          value={String(autoDebits)}
          subtitle={`of ${subscriptions.length} subscriptions`}
          variant="safe"
        />
      </div>

      {/* Pie Chart */}
      <Card className="p-6 border-border bg-card">
        <h3 className="font-display font-bold mb-4">Spending Breakdown</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                labelLine={false}
              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`₹${value.toLocaleString("en-IN")}`, "Yearly Cost"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}
