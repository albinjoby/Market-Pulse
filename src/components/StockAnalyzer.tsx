import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Newspaper,
  Brain,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RawJsonViewer from "@/components/RawJsonViewer";
import SparklineChart from "@/components/SparklineChart";

interface SentimentData {
  ticker: string;
  sentiment: "bullish" | "bearish" | "neutral";
  confidence: number;
  momentum: string;
  price: number;
  change: number;
  changePercent: string;
  high: number;
  low: number;
  volume: number;
  explanation: string;
  currentSituation?: string;
  futureOutlook?: string;
  keyFactors?: string[];
  riskFactors?: string[];
  opportunities?: string[];
  news: Array<{
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: string;
    sentiment?: "positive" | "negative" | "neutral";
  }>;
}

const StockAnalyzer = () => {
  const [ticker, setTicker] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SentimentData | null>(null);
  const { toast } = useToast();

  // Simple function to analyze individual news sentiment
  const analyzeNewsSentiment = (
    title: string,
    description: string
  ): "positive" | "negative" | "neutral" => {
    const text = `${title} ${description}`.toLowerCase();

    const positiveWords = [
      "growth",
      "profit",
      "revenue",
      "increase",
      "strong",
      "beat",
      "positive",
      "upgrade",
      "buy",
      "investment",
      "gains",
      "surge",
      "boost",
      "bullish",
    ];
    const negativeWords = [
      "decline",
      "loss",
      "decrease",
      "weak",
      "miss",
      "negative",
      "downgrade",
      "sell",
      "concern",
      "warning",
      "drop",
      "fall",
      "bearish",
      "crash",
    ];

    const positiveCount = positiveWords.filter((word) =>
      text.includes(word)
    ).length;
    const negativeCount = negativeWords.filter((word) =>
      text.includes(word)
    ).length;

    if (positiveCount > negativeCount) return "positive";
    if (negativeCount > positiveCount) return "negative";
    return "neutral";
  };

  const getSentimentBadge = (
    sentiment: "positive" | "negative" | "neutral"
  ) => {
    const config = {
      positive: {
        label: "Positive",
        className: "bg-green-500/20 text-green-400 border-green-500/30",
      },
      negative: {
        label: "Negative",
        className: "bg-red-500/20 text-red-400 border-red-500/30",
      },
      neutral: {
        label: "Neutral",
        className: "bg-gray-500/20 text-gray-400 border-gray-500/30",
      },
    };

    const { label, className } = config[sentiment];
    return (
      <Badge variant="outline" className={className}>
        {label}
      </Badge>
    );
  };

  const handleAnalyze = async () => {
    if (!ticker.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid stock ticker symbol",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log("Starting analysis for ticker:", ticker.trim().toUpperCase());

    try {
      // First validate the stock
      console.log("Calling validate-stock function...");
      const { data: validationResult, error: validationError } =
        await supabase.functions.invoke("validate-stock", {
          body: { ticker: ticker.trim().toUpperCase() },
        });

      console.log("Validation result:", validationResult);
      console.log("Validation error:", validationError);

      if (validationError) {
        console.error("Validation error:", validationError);
        throw new Error(
          `Validation failed: ${validationError.message || validationError}`
        );
      }

      if (!validationResult.isValid) {
        toast({
          title: "Invalid Stock Symbol",
          description:
            validationResult.message ||
            "Please check the ticker symbol and try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // If valid, analyze sentiment
      console.log("Calling analyze-sentiment function...");
      const { data: sentimentResult, error: sentimentError } =
        await supabase.functions.invoke("analyze-sentiment", {
          body: {
            ticker: validationResult.ticker,
            companyName: validationResult.ticker, // We'll use ticker as company name for now
          },
        });

      console.log("Sentiment result:", sentimentResult);
      console.log("Sentiment error:", sentimentError);

      if (sentimentError) {
        console.error("Sentiment analysis error:", sentimentError);
        throw new Error(
          `Sentiment analysis failed: ${
            sentimentError.message || sentimentError
          }`
        );
      }

      // Combine the results
      console.log("Combining results...");
      const combinedData: SentimentData = {
        ticker: validationResult.ticker,
        price: validationResult.price,
        change: validationResult.change,
        changePercent: validationResult.changePercent,
        high: validationResult.high,
        low: validationResult.low,
        volume: validationResult.volume,
        sentiment: sentimentResult.sentiment,
        confidence: sentimentResult.confidence,
        momentum: sentimentResult.momentum,
        explanation: sentimentResult.explanation,
        currentSituation: sentimentResult.currentSituation,
        futureOutlook: sentimentResult.futureOutlook,
        keyFactors: sentimentResult.keyFactors,
        riskFactors: sentimentResult.riskFactors,
        opportunities: sentimentResult.opportunities,
        news: sentimentResult.news || [],
      };

      console.log("Combined data:", combinedData);
      setData(combinedData);

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${validationResult.ticker}`,
      });
    } catch (error) {
      console.error("Analysis error:", error);

      let errorMessage = "Failed to analyze stock. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("Validation failed")) {
          errorMessage =
            "Unable to fetch stock data. Please check the ticker symbol and try again.";
        } else if (error.message.includes("Sentiment analysis failed")) {
          errorMessage =
            "Stock data retrieved but sentiment analysis failed. Please try again.";
        } else if (
          error.message.includes("NetworkError") ||
          error.message.includes("fetch")
        ) {
          errorMessage =
            "Network error. Please check your internet connection and try again.";
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return <TrendingUp className="w-5 h-5" />;
      case "bearish":
        return <TrendingDown className="w-5 h-5" />;
      default:
        return <Minus className="w-5 h-5" />;
    }
  };

  const getSentimentVariant = (sentiment: string) => {
    switch (sentiment) {
      case "bullish":
        return "bullish";
      case "bearish":
        return "bearish";
      default:
        return "neutral";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Market Pulse
          </h1>
          <p className="text-muted-foreground text-lg">
            AI-powered stock sentiment analysis and market insights
          </p>
        </div>

        {/* Input Section */}
        <Card className="p-6 bg-gradient-glass border-card-border backdrop-blur-md">
          <div className="flex gap-4">
            <Input
              placeholder="Enter stock ticker (e.g., AAPL, TSLA, MSFT)"
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyPress={(e) => e.key === "Enter" && handleAnalyze()}
              className="flex-1 h-12 bg-card/50 border-card-border text-lg"
              disabled={loading}
            />
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              variant="default"
              size="lg"
              className="min-w-[120px]"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </Card>

        {/* Results */}
        {data && (
          <div className="space-y-6 animate-slide-up">
            {/* Sentiment Overview */}
            <Card className="p-6 bg-gradient-glass border-card-border backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">{data.ticker}</h2>
                <Badge
                  variant={getSentimentVariant(data.sentiment)}
                  className="px-4 py-2 text-base"
                >
                  {getSentimentIcon(data.sentiment)}
                  {data.sentiment.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <BarChart3 className="w-4 h-4" />
                      Current Price
                    </div>
                    {/* Sparkline Chart with simulated trend data */}
                    <SparklineChart
                      data={[
                        data.price * 0.95,
                        data.price * 0.98,
                        data.price * 0.97,
                        data.price * 1.02,
                        data.price,
                      ]}
                      color={data.change >= 0 ? "#10b981" : "#ef4444"}
                      width={80}
                      height={30}
                    />
                  </div>
                  <div className="text-2xl font-bold">
                    ${data.price.toFixed(2)}
                  </div>
                  <div
                    className={`text-sm ${
                      data.change >= 0 ? "text-bullish" : "text-bearish"
                    }`}
                  >
                    {data.change >= 0 ? "+" : ""}
                    {data.change.toFixed(2)} ({data.changePercent})
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Momentum
                  </div>
                  <div className="text-2xl font-bold">{data.momentum}</div>
                  <div className="text-sm text-muted-foreground">
                    Market trend
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Brain className="w-4 h-4" />
                    Confidence
                  </div>
                  <div className="text-2xl font-bold">{data.confidence}%</div>
                  <div className="text-sm text-muted-foreground">
                    AI analysis
                  </div>
                </div>
              </div>
            </Card>

            {/* AI Explanation */}
            <Card className="p-6 bg-gradient-glass border-card-border backdrop-blur-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Analysis
              </h3>

              {/* Main Analysis */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2">
                    Overall Assessment
                  </h4>
                  <p className="text-foreground leading-relaxed">
                    {data.explanation}
                  </p>
                </div>

                {/* Current Situation */}
                {data.currentSituation && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Current Market Situation
                    </h4>
                    <p className="text-foreground/80 leading-relaxed">
                      {data.currentSituation}
                    </p>
                  </div>
                )}

                {/* Future Outlook */}
                {data.futureOutlook && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Future Outlook
                    </h4>
                    <p className="text-foreground/80 leading-relaxed">
                      {data.futureOutlook}
                    </p>
                  </div>
                )}

                {/* Risk Factors */}
                {data.riskFactors && data.riskFactors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Risk Factors
                    </h4>
                    <div className="space-y-1">
                      {data.riskFactors.map((risk, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 flex-shrink-0" />
                          <span className="text-sm text-foreground/70">
                            {risk}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Opportunities */}
                {data.opportunities && data.opportunities.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">
                      Opportunities
                    </h4>
                    <div className="space-y-1">
                      {data.opportunities.map((opportunity, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                          <span className="text-sm text-foreground/70">
                            {opportunity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* News Headlines */}
            <Card className="p-6 bg-gradient-glass border-card-border backdrop-blur-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                Recent News
              </h3>
              <div className="space-y-3">
                {data.news.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 bg-card/30 rounded-lg hover:bg-card/40 transition-colors"
                  >
                    <div className="w-2 h-2 rounded-full mt-2 bg-primary" />
                    <div className="flex-1">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:text-primary transition-colors"
                      >
                        {item.title}
                      </a>
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>
                          {new Date(item.publishedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {data.news.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">
                    No recent news available
                  </p>
                )}
              </div>
            </Card>

            {/* Raw JSON Viewer */}
            <RawJsonViewer data={data} title="Raw Analysis Data" />
          </div>
        )}

        {loading && (
          <Card className="p-8 bg-gradient-glass border-card-border backdrop-blur-md">
            <div className="text-center space-y-4">
              <div className="animate-pulse-glow">
                <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 shadow-glow" />
              </div>
              <h3 className="text-xl font-semibold">Analyzing {ticker}</h3>
              <p className="text-muted-foreground">
                Fetching price data, news sentiment, and generating AI
                insights...
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Financial Disclaimer */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted-foreground/60">
          Note: Market Pulse is not a financial advisor
        </p>
      </div>
    </div>
  );
};

export default StockAnalyzer;
