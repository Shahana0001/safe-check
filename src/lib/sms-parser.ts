export interface Transaction {
  id: string;
  amount: number;
  merchant: string;
  date: Date;
  rawText: string;
  isAutoDebit: boolean;
  keywords: string[];
}

export interface Subscription {
  merchant: string;
  amount: number;
  frequency: "monthly" | "yearly" | "unknown";
  transactions: Transaction[];
  nextExpectedDate: Date | null;
  yearlyCost: number;
  isActive: boolean;
  riskLevel: "safe" | "moderate" | "danger";
}

const RISK_KEYWORDS = [
  "AUTO-DEBIT", "AUTO DEBIT", "AUTODEBIT",
  "MANDATE", "RENEWAL", "SUBSCRIPTION",
  "FREE TRIAL", "RECURRING", "AUTOPAY",
  "STANDING INSTRUCTION", "SI DEBIT",
];

const MERCHANT_ALIASES: Record<string, string> = {
  "NETFLIX": "Netflix",
  "SPOTIFY": "Spotify",
  "AMAZON": "Amazon Prime",
  "AMAZONPRIME": "Amazon Prime",
  "HOTSTAR": "Disney+ Hotstar",
  "DISNEY": "Disney+ Hotstar",
  "YOUTUBE": "YouTube Premium",
  "YTPREMIUM": "YouTube Premium",
  "GOOGLE": "Google Services",
  "APPLE": "Apple Services",
  "SWIGGY": "Swiggy One",
  "ZOMATO": "Zomato Gold",
  "GPAY": "Google Pay",
  "PHONEPE": "PhonePe",
  "PAYTM": "Paytm",
  "UBER": "Uber",
  "OLA": "Ola",
  "LINKEDIN": "LinkedIn Premium",
  "ADOBE": "Adobe",
  "MICROSOFT": "Microsoft 365",
  "DROPBOX": "Dropbox",
  "ICLOUD": "iCloud",
  "GYM": "Gym Membership",
  "CHATGPT": "ChatGPT Plus",
  "OPENAI": "ChatGPT Plus",
};

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

function normalizeMerchant(raw: string): string {
  const upper = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  for (const [key, value] of Object.entries(MERCHANT_ALIASES)) {
    if (upper.includes(key)) return value;
  }
  // Title case the original
  return raw.replace(/\b\w/g, (c) => c.toUpperCase()).trim();
}

function extractAmount(text: string): number | null {
  // Match patterns like Rs.299, Rs 299, INR 299, ₹299, Rs.2,999.00
  const patterns = [
    /(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /(?:debited|deducted|paid|charged).*?(?:Rs\.?|INR|₹)\s*([\d,]+(?:\.\d{1,2})?)/i,
    /([\d,]+(?:\.\d{1,2})?)\s*(?:debited|deducted)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ""));
    }
  }
  return null;
}

function extractDate(text: string): Date | null {
  // Match patterns like 15-Jan-2024, 15/01/2024, Jan 15 2024, 2024-01-15
  const patterns = [
    /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/,
    /(\d{1,2})[-\s](Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[-\s](\d{2,4})/i,
    /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[-\s](\d{1,2})[-,\s]+(\d{2,4})/i,
    /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,
  ];

  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Try to parse based on matched groups
      if (match[2] && months[match[2].toLowerCase().substring(0, 3)] !== undefined) {
        const day = parseInt(match[1]);
        const month = months[match[2].toLowerCase().substring(0, 3)];
        let year = parseInt(match[3]);
        if (year < 100) year += 2000;
        return new Date(year, month, day);
      }
      if (match[1] && months[match[1].toLowerCase().substring(0, 3)] !== undefined) {
        const day = parseInt(match[2]);
        const month = months[match[1].toLowerCase().substring(0, 3)];
        let year = parseInt(match[3]);
        if (year < 100) year += 2000;
        return new Date(year, month, day);
      }
      // Numeric date
      let day = parseInt(match[1]);
      let month = parseInt(match[2]) - 1;
      let year = parseInt(match[3]);
      if (year < 100) year += 2000;
      // If first number > 12, swap day/month
      if (day > 12 && month <= 11) {
        return new Date(year, month, day);
      }
      if (match[1].length === 4) {
        // YYYY-MM-DD
        return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
      }
      return new Date(year, month, day);
    }
  }
  return null;
}

function extractMerchant(text: string): string {
  // Try to find merchant after common keywords
  const patterns = [
    /(?:to|at|for|from|by|paid to|debited for|towards)\s+([A-Za-z][A-Za-z0-9\s.&'-]{2,30})/i,
    /(?:transaction|txn|payment).*?(?:at|to|for)\s+([A-Za-z][A-Za-z0-9\s.&'-]{2,30})/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const merchant = match[1].replace(/\s+(on|dated|ref|upi|imps|neft).*$/i, "").trim();
      if (merchant.length > 2) return normalizeMerchant(merchant);
    }
  }
  // Fallback: check for known merchants
  const upper = text.toUpperCase();
  for (const [key, value] of Object.entries(MERCHANT_ALIASES)) {
    if (upper.includes(key)) return value;
  }
  return "Unknown Merchant";
}

function findRiskKeywords(text: string): string[] {
  const upper = text.toUpperCase();
  return RISK_KEYWORDS.filter((kw) => upper.includes(kw));
}

export function parseSMS(text: string): Transaction | null {
  const amount = extractAmount(text);
  if (!amount) return null;

  const date = extractDate(text) || new Date();
  const merchant = extractMerchant(text);
  const keywords = findRiskKeywords(text);

  return {
    id: generateId(),
    amount,
    merchant,
    date,
    rawText: text.trim(),
    isAutoDebit: keywords.length > 0,
    keywords,
  };
}

export function parseBulkSMS(text: string): Transaction[] {
  // Split by newlines, treating each line or double-newline block as a separate SMS
  const blocks = text
    .split(/\n{2,}/)
    .flatMap((block) => {
      // If block contains multiple SMS-like entries, split further
      const lines = block.split(/\n/).filter((l) => l.trim().length > 10);
      return lines.length > 1 ? lines : [block];
    })
    .filter((b) => b.trim().length > 10);

  const transactions: Transaction[] = [];
  for (const block of blocks) {
    const tx = parseSMS(block);
    if (tx) transactions.push(tx);
  }
  return transactions;
}

export function detectSubscriptions(transactions: Transaction[]): Subscription[] {
  // Group by merchant
  const groups: Record<string, Transaction[]> = {};
  for (const tx of transactions) {
    const key = tx.merchant.toLowerCase();
    if (!groups[key]) groups[key] = [];
    groups[key].push(tx);
  }

  const subscriptions: Subscription[] = [];

  for (const [, txs] of Object.entries(groups)) {
    if (txs.length < 2) {
      // Single transaction — check if it has auto-debit keywords
      if (txs[0].isAutoDebit) {
        subscriptions.push({
          merchant: txs[0].merchant,
          amount: txs[0].amount,
          frequency: "unknown",
          transactions: txs,
          nextExpectedDate: null,
          yearlyCost: txs[0].amount * 12,
          isActive: true,
          riskLevel: "moderate",
        });
      }
      continue;
    }

    // Sort by date
    const sorted = [...txs].sort((a, b) => a.date.getTime() - b.date.getTime());
    const avgAmount = sorted.reduce((s, t) => s + t.amount, 0) / sorted.length;

    // Check if amounts are similar (within 20%)
    const amountsSimilar = sorted.every(
      (t) => Math.abs(t.amount - avgAmount) / avgAmount < 0.2
    );

    if (!amountsSimilar) continue;

    // Calculate average interval
    let totalDays = 0;
    for (let i = 1; i < sorted.length; i++) {
      const diff = (sorted[i].date.getTime() - sorted[i - 1].date.getTime()) / (1000 * 60 * 60 * 24);
      totalDays += diff;
    }
    const avgInterval = totalDays / (sorted.length - 1);

    let frequency: "monthly" | "yearly" | "unknown" = "unknown";
    if (avgInterval >= 25 && avgInterval <= 35) frequency = "monthly";
    else if (avgInterval >= 340 && avgInterval <= 400) frequency = "yearly";

    const lastDate = sorted[sorted.length - 1].date;
    let nextExpectedDate: Date | null = null;
    if (frequency === "monthly") {
      nextExpectedDate = new Date(lastDate);
      nextExpectedDate.setMonth(nextExpectedDate.getMonth() + 1);
    } else if (frequency === "yearly") {
      nextExpectedDate = new Date(lastDate);
      nextExpectedDate.setFullYear(nextExpectedDate.getFullYear() + 1);
    }

    const yearlyCost = frequency === "monthly" ? avgAmount * 12 : frequency === "yearly" ? avgAmount : avgAmount * 12;

    const riskLevel: "safe" | "moderate" | "danger" =
      yearlyCost > 5000 ? "danger" : yearlyCost > 1500 ? "moderate" : "safe";

    subscriptions.push({
      merchant: sorted[0].merchant,
      amount: Math.round(avgAmount * 100) / 100,
      frequency,
      transactions: sorted,
      nextExpectedDate,
      yearlyCost: Math.round(yearlyCost * 100) / 100,
      isActive: true,
      riskLevel,
    });
  }

  return subscriptions.sort((a, b) => b.yearlyCost - a.yearlyCost);
}

export function parseCSV(csvText: string): Transaction[] {
  const lines = csvText.split(/\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase();
  const hasHeader = header.includes("amount") || header.includes("date") || header.includes("description");
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const transactions: Transaction[] = [];
  for (const line of dataLines) {
    const cols = line.split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/).map((c) => c.replace(/^"|"$/g, "").trim());
    if (cols.length < 2) continue;

    // Try to extract from columns
    const fullText = cols.join(" ");
    const tx = parseSMS(fullText);
    if (tx) transactions.push(tx);
  }
  return transactions;
}
