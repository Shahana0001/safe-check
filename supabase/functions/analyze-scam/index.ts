import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Content is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are ScamShield, an expert AI scam detection system. Analyze the provided content for potential scam indicators.

Your task is to:
1. Evaluate the content for scam patterns and red flags
2. Provide a risk score from 0-100 (0 = completely safe, 100 = definite scam)
3. Identify the type of scam if applicable
4. List specific red flags found
5. Provide a clear explanation of why this content is risky or safe
6. Give actionable recommendations

Common scam indicators to look for:
- Urgency pressure ("Act now!", "Limited time!")
- Requests for personal info, OTP, passwords, bank details
- Too-good-to-be-true offers (unrealistic salary, lottery wins)
- Suspicious links or domains
- Poor grammar/spelling (can indicate foreign scammers)
- Impersonation of known companies/government
- Requests for upfront payment or fees
- Emotional manipulation (fear, greed, curiosity)
- Fake job offers with unrealistic pay
- QR code payment requests from strangers
- Customer support asking for remote access

You MUST respond with valid JSON in this exact format:
{
  "riskScore": <number 0-100>,
  "riskLevel": "<low|medium|high|critical>",
  "scamType": "<type of scam or 'Legitimate Content' if safe>",
  "redFlags": ["<flag1>", "<flag2>", ...],
  "explanation": "<2-3 sentences explaining the assessment>",
  "recommendation": "<clear actionable advice>"
}

Risk level mapping:
- 0-25: low (appears legitimate)
- 26-50: medium (some concerns, proceed with caution)
- 51-75: high (likely scam, avoid engaging)
- 76-100: critical (definite scam, do not proceed)`;

    console.log("Analyzing content for scam patterns...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Analyze this content for scam indicators:\n\n${content}` },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    console.log("AI response received:", aiResponse);

    // Parse the JSON response from the AI
    let analysisResult;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = aiResponse.match(/```json\n?([\s\S]*?)\n?```/) || 
                        aiResponse.match(/```\n?([\s\S]*?)\n?```/) ||
                        [null, aiResponse];
      const jsonStr = jsonMatch[1] || aiResponse;
      analysisResult = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Provide a fallback response
      analysisResult = {
        riskScore: 50,
        riskLevel: "medium",
        scamType: "Unable to Determine",
        redFlags: ["Analysis incomplete - please try again"],
        explanation: "We couldn't fully analyze this content. The message structure may be unusual.",
        recommendation: "Exercise caution and verify through official channels before proceeding.",
      };
    }

    // Validate and sanitize the response
    const result = {
      riskScore: Math.min(100, Math.max(0, Number(analysisResult.riskScore) || 50)),
      riskLevel: ["low", "medium", "high", "critical"].includes(analysisResult.riskLevel) 
        ? analysisResult.riskLevel 
        : "medium",
      scamType: String(analysisResult.scamType || "Unknown"),
      redFlags: Array.isArray(analysisResult.redFlags) 
        ? analysisResult.redFlags.map(String).slice(0, 10) 
        : [],
      explanation: String(analysisResult.explanation || "Unable to provide explanation."),
      recommendation: String(analysisResult.recommendation || "Exercise caution with this content."),
    };

    console.log("Analysis complete:", result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-scam function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Analysis failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
