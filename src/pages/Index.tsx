import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle, Zap, Users, Brain, FileSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RiskMeter from "@/components/RiskMeter";
import ScamTypeCard from "@/components/ScamTypeCard";
import AnalysisResult from "@/components/AnalysisResult";

interface AnalysisResponse {
  riskScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  scamType: string;
  redFlags: string[];
  explanation: string;
  recommendation: string;
}

const Index = () => {
  const [content, setContent] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResponse | null>(null);
  const { toast } = useToast();

  const analyzeContent = async () => {
    if (!content.trim()) {
      toast({
        title: "Empty Content",
        description: "Please paste the suspicious content to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-scam", {
        body: { content },
      });

      if (error) {
        if (error.message?.includes("429")) {
          toast({
            title: "Rate Limited",
            description: "Too many requests. Please try again in a moment.",
            variant: "destructive",
          });
        } else if (error.message?.includes("402")) {
          toast({
            title: "Service Unavailable",
            description: "Please try again later.",
            variant: "destructive",
          });
        } else {
          throw error;
        }
        return;
      }

      setResult(data);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: "Could not analyze the content. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const scamTypes = [
    { icon: FileSearch, title: "Job Scams", description: "Fake internships & offers" },
    { icon: AlertTriangle, title: "Phishing", description: "Fake links & messages" },
    { icon: Users, title: "Fake Support", description: "Impostor customer care" },
    { icon: Zap, title: "QR Scams", description: "Malicious QR codes" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Shield className="h-12 w-12 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold text-foreground">
                ScamShield
              </h1>
            </div>
            <p className="text-xl md:text-2xl text-muted-foreground mb-4">
              Check Before You Act
            </p>
            <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto">
              Paste any suspicious message, job offer, or link. Get instant AI-powered 
              risk analysis with clear explanations—before you click or pay.
            </p>
          </div>
        </div>
      </header>

      {/* Main Analysis Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Input Card */}
          <Card className="p-6 md:p-8 mb-8 border-2 border-border/50 bg-card/50 backdrop-blur">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-foreground">
                Paste Suspicious Content
              </h2>
            </div>
            <Textarea
              placeholder="Paste the message, email, job offer, WhatsApp text, or any suspicious content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[180px] text-base mb-4 resize-none"
            />
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Your content is analyzed privately and not stored.
              </p>
              <Button
                onClick={analyzeContent}
                disabled={isAnalyzing}
                size="lg"
                className="w-full sm:w-auto min-w-[180px]"
              >
                {isAnalyzing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Analyze Risk
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Results Section */}
          {result && <AnalysisResult result={result} />}

          {/* Risk Meter Preview (when no result) */}
          {!result && !isAnalyzing && (
            <div className="mb-12">
              <RiskMeter score={null} />
            </div>
          )}

          {/* Scam Types We Detect */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-8 text-foreground">
              Scam Types We Detect
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {scamTypes.map((type, index) => (
                <ScamTypeCard key={index} {...type} />
              ))}
            </div>
          </section>

          {/* Features Section */}
          <section className="mt-16 grid md:grid-cols-3 gap-6">
            <Card className="p-6 text-center border-border/50 bg-card/30">
              <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-foreground">Instant Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Get risk scores in seconds, not hours
              </p>
            </Card>
            <Card className="p-6 text-center border-border/50 bg-card/30">
              <Brain className="h-10 w-10 text-primary mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-foreground">AI Explainability</h3>
              <p className="text-sm text-muted-foreground">
                Understand exactly why something is risky
              </p>
            </Card>
            <Card className="p-6 text-center border-border/50 bg-card/30">
              <Users className="h-10 w-10 text-accent-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2 text-foreground">Family Friendly</h3>
              <p className="text-sm text-muted-foreground">
                Simple enough for students & elders
              </p>
            </Card>
          </section>

          {/* CTA Section */}
          <section className="mt-16 text-center">
            <Card className="p-8 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
              <h2 className="text-2xl font-bold mb-4 text-foreground">
                Stay One Step Ahead of Scammers
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Unlike tools that react after scams happen, ScamShield helps you 
                prevent fraud before you become a victim.
              </p>
              <Badge variant="secondary" className="text-sm px-4 py-2">
                🛡️ Prevention &gt; Detection
              </Badge>
            </Card>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p className="text-sm">
            Built to protect students, families & everyone from digital fraud.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
