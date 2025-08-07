import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, TrendingDown, Minus, BarChart3, Newspaper, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SentimentData {
  ticker: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  momentum: string;
  price: number;
  change: number;
  changePercent: string;
  high: number;
  low: number;
  volume: number;
  explanation: string;
  keyFactors?: string[];
  news: Array<{
    title: string;
    description: string;
    url: string;
    publishedAt: string;
    source: string;
  }>;
}

const StockAnalyzer = () => {
  const [ticker, setTicker] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SentimentData | null>(null);
  const { toast } = useToast();

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
    
    try {
      // First validate the stock
      const { data: validationResult, error: validationError } = await supabase.functions.invoke('validate-stock', {
        body: { ticker: ticker.trim().toUpperCase() }
      });

      if (validationError) {
        throw new Error('Failed to validate stock');
      }

      if (!validationResult.isValid) {
        toast({
          title: "Invalid Stock Symbol",
          description: validationResult.message || "Please check the ticker symbol and try again.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // If valid, analyze sentiment
      const { data: sentimentResult, error: sentimentError } = await supabase.functions.invoke('analyze-sentiment', {
        body: { 
          ticker: validationResult.ticker,
          companyName: validationResult.ticker // We'll use ticker as company name for now
        }
      });

      if (sentimentError) {
        throw new Error('Failed to analyze sentiment');
      }

      // Combine the results
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
        keyFactors: sentimentResult.keyFactors,
        news: sentimentResult.news || []
      };
      
      setData(combinedData);
      
      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${validationResult.ticker}`,
      });
      
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Error",
        description: "Failed to analyze stock. Please check your API keys and try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return <TrendingUp className="w-5 h-5" />;
      case 'bearish': return <TrendingDown className="w-5 h-5" />;
      default: return <Minus className="w-5 h-5" />;
    }
  };

  const getSentimentVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish': return 'bullish';
      case 'bearish': return 'bearish';
      default: return 'neutral';
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
              onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
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
                <Badge variant={getSentimentVariant(data.sentiment)} className="px-4 py-2 text-base">
                  {getSentimentIcon(data.sentiment)}
                  {data.sentiment.toUpperCase()}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BarChart3 className="w-4 h-4" />
                    Current Price
                  </div>
                  <div className="text-2xl font-bold">${data.price.toFixed(2)}</div>
                  <div className={`text-sm ${data.change >= 0 ? 'text-bullish' : 'text-bearish'}`}>
                    {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent})
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Momentum
                  </div>
                  <div className="text-2xl font-bold">{data.momentum}</div>
                  <div className="text-sm text-muted-foreground">Market trend</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Brain className="w-4 h-4" />
                    Confidence
                  </div>
                  <div className="text-2xl font-bold">{data.confidence}%</div>
                  <div className="text-sm text-muted-foreground">AI analysis</div>
                </div>
              </div>
            </Card>

            {/* AI Explanation */}
            <Card className="p-6 bg-gradient-glass border-card-border backdrop-blur-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Brain className="w-5 h-5 text-primary" />
                AI Analysis
              </h3>
              <p className="text-foreground leading-relaxed">{data.explanation}</p>
            </Card>

            {/* News Headlines */}
            <Card className="p-6 bg-gradient-glass border-card-border backdrop-blur-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-primary" />
                Recent News
              </h3>
              <div className="space-y-3">
                {data.news.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-card/30 rounded-lg hover:bg-card/40 transition-colors">
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
                      <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {data.news.length === 0 && (
                  <p className="text-muted-foreground text-center py-4">No recent news available</p>
                )}
              </div>
            </Card>
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
                Fetching price data, news sentiment, and generating AI insights...
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StockAnalyzer;