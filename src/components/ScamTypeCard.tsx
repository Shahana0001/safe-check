import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ScamTypeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

const ScamTypeCard = ({ icon: Icon, title, description }: ScamTypeCardProps) => {
  return (
    <Card className="p-4 text-center hover:border-primary/50 transition-colors border-border/50 bg-card/30">
      <Icon className="h-8 w-8 text-primary mx-auto mb-3" />
      <h3 className="font-semibold text-sm mb-1 text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </Card>
  );
};

export default ScamTypeCard;
