import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquareText, Upload, FileText, Trash2, Sparkles } from "lucide-react";
import { parseBulkSMS, parseCSV, type Transaction } from "@/lib/sms-parser";
import { useToast } from "@/hooks/use-toast";

interface SMSInputProps {
  onTransactionsFound: (transactions: Transaction[]) => void;
}

const SAMPLE_SMS = `Your a/c XX1234 debited Rs.199.00 on 15-Jan-2024 for Netflix subscription. Auto-debit mandate active.
Your a/c XX1234 debited Rs.199.00 on 15-Feb-2024 for Netflix subscription. Auto-debit mandate active.
Your a/c XX1234 debited Rs.199.00 on 15-Mar-2024 for Netflix subscription. Auto-debit mandate active.
Rs.119 debited from a/c XX5678 on 10-Jan-2024. Payment to Spotify via autopay.
Rs.119 debited from a/c XX5678 on 10-Feb-2024. Payment to Spotify via autopay.
Rs.119 debited from a/c XX5678 on 10-Mar-2024. Payment to Spotify via autopay.
Your a/c XX1234 debited INR 1499 on 05-Jan-2024 towards Amazon Prime yearly renewal.
Your a/c XX1234 debited INR 1499 on 05-Jan-2023 towards Amazon Prime yearly renewal.
Rs.299 debited from XX9012 on 20-Feb-2024. Paid to YouTube Premium. Recurring subscription.
Rs.299 debited from XX9012 on 20-Mar-2024. Paid to YouTube Premium. Recurring subscription.
Your a/c XX3456 debited Rs.599 on 01-Mar-2024 for Adobe subscription auto-debit.
Your a/c XX3456 debited Rs.599 on 01-Feb-2024 for Adobe subscription auto-debit.
FREE TRIAL ending soon. Rs.899 will be auto-debited from a/c XX7890 on 01-Apr-2024 for LinkedIn Premium.`;

export function SMSInput({ onTransactionsFound }: SMSInputProps) {
  const [text, setText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!text.trim()) {
      toast({ title: "No content", description: "Please paste SMS messages or upload a CSV file.", variant: "destructive" });
      return;
    }
    const txs = parseBulkSMS(text);
    if (txs.length === 0) {
      toast({ title: "No transactions found", description: "Could not extract any transactions. Try pasting bank debit SMS messages.", variant: "destructive" });
      return;
    }
    onTransactionsFound(txs);
    toast({ title: `${txs.length} transactions extracted`, description: "Analyzing for recurring subscriptions..." });
  };

  const handleCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const csv = ev.target?.result as string;
      const txs = parseCSV(csv);
      if (txs.length === 0) {
        toast({ title: "No transactions found in CSV", description: "Make sure CSV has amount and date columns.", variant: "destructive" });
        return;
      }
      onTransactionsFound(txs);
      toast({ title: `${txs.length} transactions from CSV`, description: "Analyzing for recurring subscriptions..." });
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const loadSample = () => {
    setText(SAMPLE_SMS);
    toast({ title: "Sample data loaded", description: "Click 'Extract & Analyze' to process." });
  };

  return (
    <Card className="p-6 border-border bg-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-primary/10">
          <MessageSquareText className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Paste Bank SMS</h2>
          <p className="text-sm text-muted-foreground">Paste one or more bank debit SMS messages</p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={`Paste your bank SMS messages here, one per line...\n\nExample:\nYour a/c XX1234 debited Rs.199.00 on 15-Jan-2024 for Netflix subscription.`}
        className="w-full h-44 bg-muted rounded-lg p-4 text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-ring transition-all text-sm font-mono"
      />

      <div className="flex flex-wrap gap-3 mt-4">
        <Button onClick={handleAnalyze} disabled={!text.trim()} className="gap-2">
          <FileText className="h-4 w-4" />
          Extract & Analyze
        </Button>
        <Button variant="outline" onClick={() => fileRef.current?.click()} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload CSV
        </Button>
        <Button variant="outline" onClick={loadSample} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Load Sample Data
        </Button>
        {text && (
          <Button variant="ghost" onClick={() => setText("")} className="gap-2 text-muted-foreground">
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>
      <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleCSV} className="hidden" />
    </Card>
  );
}
