import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Receipt } from "lucide-react";
import type { Transaction } from "@/lib/sms-parser";

interface TransactionTableProps {
  transactions: Transaction[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
  if (transactions.length === 0) return null;

  return (
    <Card className="border-border bg-card overflow-hidden">
      <div className="p-6 pb-4 flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Receipt className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-lg font-bold">Extracted Transactions</h2>
          <p className="text-sm text-muted-foreground">{transactions.length} transactions found</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="text-muted-foreground font-semibold">Merchant</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Amount</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Date</TableHead>
              <TableHead className="text-muted-foreground font-semibold">Flags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => (
              <TableRow key={tx.id} className="border-border">
                <TableCell className="font-medium">{tx.merchant}</TableCell>
                <TableCell className="font-mono font-semibold">₹{tx.amount.toLocaleString("en-IN")}</TableCell>
                <TableCell className="text-muted-foreground">
                  {tx.date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </TableCell>
                <TableCell>
                  {tx.isAutoDebit ? (
                    <Badge variant="outline" className="border-warning/50 text-warning bg-warning/10 gap-1 text-xs">
                      <AlertTriangle className="h-3 w-3" />
                      Auto-Renew
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
