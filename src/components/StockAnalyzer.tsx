import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, TrendingUp, TrendingDown, Minus, BarChart3, Newspaper, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SentimentData {
  ticker: string;
  sentiment: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  momentum: number;
  price: number;
  change: number;
  changePercent: number;
  explanation: string;
  news: {
    headline: string;
    sentiment: string;
    url: string;
  }[];
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
    
    // Simulate API call with mock data
    setTimeout(() => {
      const mockData: SentimentData = {
        ticker: ticker.toUpperCase(),
        sentiment: Math.random() > 0.5 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral',
        confidence: Math.floor(Math.random() * 30) + 70,
        momentum: (Math.random() - 0.5) * 10,
        price: Math.random() * 200 + 50,
        change: (Math.random() - 0.5) * 20,
        changePercent: (Math.random() - 0.5) * 8,
        explanation: `Based on recent market trends and technical analysis, ${ticker.toUpperCase()} shows ${Math.random() > 0.5 ? 'strong' : 'moderate'} momentum indicators. The stock has been ${Math.random() > 0.5 ? 'outperforming' : 'tracking with'} market expectations, with ${Math.random() > 0.5 ? 'positive' : 'mixed'} sentiment from recent news coverage.`,
        news: [
          { headline: `${ticker.toUpperCase()} Reports Strong Q4 Earnings`, sentiment: 'positive', url: '#' },
          { headline: `Analysts Upgrade ${ticker.toUpperCase()} Price Target`, sentiment: 'positive', url: '#' },
          { headline: `Market Volatility Affects ${ticker.toUpperCase()} Trading`, sentiment: 'neutral', url: '#' },
        ]
      };
      setData(mockData);
      setLoading(false);
    }, 2000);
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
                    {data.change >= 0 ? '+' : ''}{data.change.toFixed(2)} ({data.changePercent.toFixed(2)}%)
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Momentum Score
                  </div>
                  <div className="text-2xl font-bold">{data.momentum.toFixed(1)}</div>
                  <div className="text-sm text-muted-foreground">5-day average</div>
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
                  <div key={index} className="flex items-start gap-3 p-3 bg-card/30 rounded-lg">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      item.sentiment === 'positive' ? 'bg-bullish' :
                      item.sentiment === 'negative' ? 'bg-bearish' : 'bg-neutral'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{item.headline}</p>
                      <p className="text-sm text-muted-foreground capitalize">{item.sentiment} sentiment</p>
                    </div>
                  </div>
                ))}
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