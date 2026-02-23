import { useState } from "react";
import { Shield, Receipt, TrendingDown, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SMSInput } from "@/components/SMSInput";
import { TransactionTable } from "@/components/TransactionTable";
import { SubscriptionDashboard } from "@/components/SubscriptionDashboard";
import { SmartAlerts } from "@/components/SmartAlerts";
import { detectSubscriptions, type Transaction, type Subscription } from "@/lib/sms-parser";

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const handleTransactionsFound = (txs: Transaction[]) => {
    setTransactions(txs);
    const subs = detectSubscriptions(txs);
    setSubscriptions(subs);
  };

  const totalYearly = subscriptions.reduce((s, sub) => s + sub.yearlyCost, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-lg font-bold leading-tight">ReceiptGuard</h1>
              <p className="text-xs text-muted-foreground leading-tight">Subscription Tracker</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative container mx-auto px-4 py-16 md:py-24 text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="h-4 w-4" />
            Stop losing money to forgotten subscriptions
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Track Hidden{" "}
            <span className="text-gradient">Subscriptions</span>{" "}
            & Auto-Debits
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Paste your bank SMS messages and instantly discover recurring charges, 
            forgotten trials, and auto-debit mandates eating into your wallet.
          </p>

          {totalYearly > 0 && (
            <div className="animate-slide-up inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-danger/10 border border-danger/30">
              <TrendingDown className="h-5 w-5 text-danger" />
              <span className="text-sm font-medium">
                You're spending <span className="text-danger font-display font-bold text-lg">₹{Math.round(totalYearly).toLocaleString("en-IN")}</span> per year on subscriptions
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-20 space-y-8 max-w-5xl">
        <SMSInput onTransactionsFound={handleTransactionsFound} />

        {transactions.length > 0 && (
          <div className="animate-slide-up">
            <TransactionTable transactions={transactions} />
          </div>
        )}

        {subscriptions.length > 0 && (
          <div className="animate-slide-up space-y-8">
            <SubscriptionDashboard subscriptions={subscriptions} />
            <SmartAlerts subscriptions={subscriptions} />
          </div>
        )}

        {/* How It Works (shown when no data) */}
        {transactions.length === 0 && (
          <section className="grid md:grid-cols-3 gap-6 mt-12">
            {[
              { icon: Receipt, title: "Paste SMS", desc: "Paste your bank debit SMS messages or upload a CSV statement" },
              { icon: Shield, title: "Auto-Detect", desc: "We scan for recurring patterns, auto-debits, and hidden subscriptions" },
              { icon: TrendingDown, title: "Save Money", desc: "See your yearly spend, find unused subscriptions, and stop the leaks" },
            ].map((step, i) => (
              <div key={i} className="text-center p-6 rounded-xl border border-border bg-card">
                <div className="inline-flex p-3 rounded-xl bg-primary/10 mb-4">
                  <step.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>ReceiptGuard — Your money, your control. No data is stored or sent to any server.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
