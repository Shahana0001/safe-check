import { cn } from "@/lib/utils";

interface RiskMeterProps {
  score: number | null;
  className?: string;
}

const RiskMeter = ({ score, className }: RiskMeterProps) => {
  const getRiskColor = (score: number) => {
    if (score <= 25) return "bg-green-500";
    if (score <= 50) return "bg-yellow-500";
    if (score <= 75) return "bg-orange-500";
    return "bg-red-500";
  };

  const getRiskLabel = (score: number) => {
    if (score <= 25) return { text: "Low Risk", color: "text-green-500" };
    if (score <= 50) return { text: "Medium Risk", color: "text-yellow-500" };
    if (score <= 75) return { text: "High Risk", color: "text-orange-500" };
    return { text: "Critical Risk", color: "text-red-500" };
  };

  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-muted-foreground">Risk Level</span>
        {score !== null && (
          <span className={cn("text-sm font-bold", getRiskLabel(score).color)}>
            {getRiskLabel(score).text}
          </span>
        )}
      </div>
      
      {/* Meter Background */}
      <div className="relative h-4 w-full rounded-full bg-muted overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-500 via-yellow-500 via-orange-500 to-red-500 opacity-20" />
        
        {/* Fill */}
        {score !== null && (
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700 ease-out",
              getRiskColor(score)
            )}
            style={{ width: `${score}%` }}
          />
        )}
      </div>

      {/* Scale Labels */}
      <div className="flex justify-between mt-1 text-xs text-muted-foreground">
        <span>0% Safe</span>
        <span>50%</span>
        <span>100% Danger</span>
      </div>

      {/* Score Display */}
      {score !== null && (
        <div className="mt-4 text-center">
          <span className="text-5xl font-bold text-foreground">{score}</span>
          <span className="text-2xl text-muted-foreground">%</span>
        </div>
      )}

      {score === null && (
        <div className="mt-4 text-center text-muted-foreground">
          <p className="text-sm">Paste content above to see risk score</p>
        </div>
      )}
    </div>
  );
};

export default RiskMeter;
