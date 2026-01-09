import { AlertTriangle, CheckCircle, XCircle, Info, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RiskMeter from "./RiskMeter";
import { cn } from "@/lib/utils";

interface AnalysisResultProps {
  result: {
    riskScore: number;
    riskLevel: "low" | "medium" | "high" | "critical";
    scamType: string;
    redFlags: string[];
    explanation: string;
    recommendation: string;
  };
}

const AnalysisResult = ({ result }: AnalysisResultProps) => {
  const getRiskConfig = (level: string) => {
    switch (level) {
      case "low":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bg: "bg-green-500/10",
          border: "border-green-500/30",
          badge: "bg-green-500/20 text-green-600",
        };
      case "medium":
        return {
          icon: Info,
          color: "text-yellow-500",
          bg: "bg-yellow-500/10",
          border: "border-yellow-500/30",
          badge: "bg-yellow-500/20 text-yellow-600",
        };
      case "high":
        return {
          icon: AlertTriangle,
          color: "text-orange-500",
          bg: "bg-orange-500/10",
          border: "border-orange-500/30",
          badge: "bg-orange-500/20 text-orange-600",
        };
      case "critical":
        return {
          icon: XCircle,
          color: "text-red-500",
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          badge: "bg-red-500/20 text-red-600",
        };
      default:
        return {
          icon: Info,
          color: "text-muted-foreground",
          bg: "bg-muted",
          border: "border-border",
          badge: "bg-muted text-muted-foreground",
        };
    }
  };

  const config = getRiskConfig(result.riskLevel);
  const Icon = config.icon;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-500">
      {/* Main Result Card */}
      <Card className={cn("p-6 border-2", config.border, config.bg)}>
        <div className="flex items-start gap-4">
          <div className={cn("p-3 rounded-full", config.bg)}>
            <Icon className={cn("h-8 w-8", config.color)} />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <h3 className="text-xl font-bold text-foreground">
                {result.riskLevel.charAt(0).toUpperCase() + result.riskLevel.slice(1)} Risk Detected
              </h3>
              <Badge className={config.badge}>{result.scamType}</Badge>
            </div>
            <p className="text-muted-foreground">{result.explanation}</p>
          </div>
        </div>
      </Card>

      {/* Risk Meter */}
      <Card className="p-6 border-border/50">
        <RiskMeter score={result.riskScore} />
      </Card>

      {/* Red Flags */}
      {result.redFlags.length > 0 && (
        <Card className="p-6 border-border/50">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <h3 className="text-lg font-semibold text-foreground">Red Flags Identified</h3>
          </div>
          <ul className="space-y-2">
            {result.redFlags.map((flag, index) => (
              <li key={index} className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{flag}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* Recommendation */}
      <Card className="p-6 border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Recommendation</h3>
        </div>
        <p className="text-muted-foreground">{result.recommendation}</p>
      </Card>
    </div>
  );
};

export default AnalysisResult;
