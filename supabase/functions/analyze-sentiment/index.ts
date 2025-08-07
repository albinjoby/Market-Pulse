import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Type definitions
interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: { name: string };
}

interface NewsResponse {
  articles: NewsArticle[];
}

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const newsApiKey = Deno.env.get("NEWS_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// In-memory cache with TTL
const cache = new Map();
const NEWS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes for news
const SENTIMENT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes for sentiment analysis

function getCachedData(key: string, ttl: number) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl) {
    console.log(`Cache hit for: ${key}`);
    return cached.data;
  }
  if (cached) {
    cache.delete(key); // Remove expired entry
  }
  return null;
}

function setCachedData(key: string, data: unknown) {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
  console.log(`Cached data for: ${key}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, companyName } = await req.json();

    const normalizedTicker = ticker.trim().toUpperCase();
    console.log(`Analyzing sentiment for: ${normalizedTicker}`);

    // First validate the stock ticker using the validate-stock function
    console.log(`Validating ticker: ${normalizedTicker}`);

    try {
      const validateResponse = await fetch(
        `https://kbgkmqvceyjnrqdzrbnm.supabase.co/functions/v1/validate-stock`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZ2ttcXZjZXlqbnJxZHpyYm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MDI4NDEsImV4cCI6MjA0Nzk3ODg0MX0.wEeO7wJKUi1JNrmNDWOFKG_I6WQAfkkzBdPGW4LnT9Y`,
          },
          body: JSON.stringify({ ticker: normalizedTicker }),
        }
      );

      console.log(`Validation response status: ${validateResponse.status}`);
      const stockData = await validateResponse.json();
      console.log(`Validation response:`, stockData);

      // Check if the stock is invalid
      if (!validateResponse.ok || stockData.isValid === false) {
        console.log(`Invalid ticker detected: ${normalizedTicker}`);
        return new Response(
          JSON.stringify({
            error: "Invalid stock ticker",
            message:
              stockData.message ||
              `Ticker '${normalizedTicker}' is not a valid stock symbol`,
          }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      console.log(`Stock validation successful for: ${normalizedTicker}`);
    } catch (validationError) {
      console.error(`Validation error:`, validationError);
      // Continue with analysis if validation fails (fallback mode)
      console.log(`Continuing with analysis despite validation error`);
    }

    // Check sentiment cache first
    const sentimentCacheKey = `sentiment_${normalizedTicker}`;
    const cachedSentiment = getCachedData(
      sentimentCacheKey,
      SENTIMENT_CACHE_TTL
    );
    if (cachedSentiment) {
      return new Response(JSON.stringify(cachedSentiment), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check news cache
    const newsCacheKey = `news_${normalizedTicker}`;
    let newsArticles = getCachedData(newsCacheKey, NEWS_CACHE_TTL);

    if (!newsArticles) {
      // Fetch recent news about the stock
      const newsResponse = await fetch(
        `https://newsapi.org/v2/everything?q=${normalizedTicker} OR "${companyName}"&sortBy=publishedAt&pageSize=10&apiKey=${newsApiKey}`
      );
      const newsData: NewsResponse = await newsResponse.json();

      newsArticles = [];
      if (newsData.articles && newsData.articles.length > 0) {
        newsArticles = newsData.articles
          .slice(0, 5)
          .map((article: NewsArticle) => ({
            title: article.title,
            description: article.description,
            url: article.url,
            publishedAt: article.publishedAt,
            source: article.source.name,
          }));
      }

      // Cache news data
      setCachedData(newsCacheKey, newsArticles);
    }

    // Prepare news content for AI analysis
    const newsContent = newsArticles
      .map(
        (article: { title: string; description: string }) =>
          `Title: ${article.title}\nDescription: ${article.description}`
      )
      .join("\n\n");

    // Use AI to analyze sentiment
    const aiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAIApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are a senior financial analyst AI with expertise in market analysis and stock valuation. Analyze the sentiment around a stock based on recent news and provide comprehensive insights. 

Respond with a JSON object containing:
- sentiment: "bullish", "bearish", or "neutral"
- confidence: number between 0-100 (how confident you are in your analysis)
- momentum: "strong_positive", "positive", "neutral", "negative", "strong_negative"
- explanation: detailed 4-6 sentence explanation of your analysis including current market position
- currentSituation: 3-4 sentence summary of the stock's current market situation and recent performance
- futureOutlook: 3-4 sentence prediction about the stock's potential future performance (next 3-6 months)
- keyFactors: array of 3-5 key factors influencing the sentiment
- riskFactors: array of 2-3 potential risks to consider
- opportunities: array of 2-3 potential opportunities or catalysts

Provide detailed, professional analysis while being realistic about uncertainties in financial markets.`,
            },
            {
              role: "user",
              content: `Analyze the sentiment for ${normalizedTicker} (${companyName}) based on this recent news:\n\n${
                newsContent ||
                "No recent news available - provide general market analysis for this stock based on its industry sector and market position."
              }

Please provide a comprehensive analysis including current market situation, future outlook, and detailed reasoning behind your sentiment assessment.`,
            },
          ],
          max_tokens: 1000,
          temperature: 0.2,
        }),
      }
    );

    const aiData = await aiResponse.json();
    let analysis;

    try {
      const content = aiData.choices[0].message.content;
      console.log("Raw AI response:", content);

      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        analysis = JSON.parse(content);
      }

      // Validate the required fields
      if (
        !analysis.sentiment ||
        !analysis.confidence ||
        !analysis.explanation ||
        !analysis.currentSituation ||
        !analysis.futureOutlook
      ) {
        throw new Error("Invalid AI response structure");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error(
        "AI response content:",
        aiData.choices?.[0]?.message?.content
      );

      // Enhanced fallback based on news content
      let fallbackSentiment = "neutral";
      let fallbackConfidence = 60;
      let fallbackExplanation = `Analysis for ${normalizedTicker} shows mixed market conditions based on available data. The stock appears to be trading within normal market parameters without clear directional bias. Current market sentiment suggests cautious optimism with investors awaiting more definitive catalysts. Overall assessment indicates a balanced risk-reward profile at current levels.`;
      let fallbackCurrentSituation = `${normalizedTicker} is currently experiencing typical market volatility with trading patterns consistent with broader market movements. The stock's recent performance reflects general market sentiment rather than company-specific developments. Technical indicators suggest the stock is consolidating within its recent trading range.`;
      let fallbackFutureOutlook = `Looking ahead, ${normalizedTicker}'s performance will likely depend on broader market conditions and sector-specific developments. The stock may continue to trade sideways until clearer fundamental catalysts emerge. Investors should monitor upcoming earnings reports and industry trends for directional signals.`;

      if (newsContent && newsContent.length > 0) {
        // Simple keyword-based fallback analysis
        const positiveKeywords = [
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
          "expansion",
          "partnership",
          "innovation",
        ];
        const negativeKeywords = [
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
          "risk",
          "challenge",
          "pressure",
        ];

        const lowerNews = newsContent.toLowerCase();
        const positiveCount = positiveKeywords.filter((word) =>
          lowerNews.includes(word)
        ).length;
        const negativeCount = negativeKeywords.filter((word) =>
          lowerNews.includes(word)
        ).length;

        if (positiveCount > negativeCount + 1) {
          fallbackSentiment = "bullish";
          fallbackConfidence = 75;
          fallbackExplanation = `Recent news for ${normalizedTicker} indicates positive market sentiment with multiple favorable developments. The company appears to be benefiting from strong fundamentals and positive investor sentiment. Key developments suggest potential for continued growth and market outperformance. The overall narrative supports a constructive investment thesis.`;
          fallbackCurrentSituation = `${normalizedTicker} is currently experiencing positive momentum driven by favorable news flow and market developments. The stock has benefited from investor optimism and appears well-positioned relative to peers. Recent corporate actions and market reception indicate strong underlying business fundamentals.`;
          fallbackFutureOutlook = `The positive sentiment surrounding ${normalizedTicker} suggests potential for continued outperformance in the near term. Strong fundamentals and favorable market conditions could drive further upside. However, investors should remain cautious of market volatility and monitor key performance metrics for sustained growth trajectory.`;
        } else if (negativeCount > positiveCount + 1) {
          fallbackSentiment = "bearish";
          fallbackConfidence = 75;
          fallbackExplanation = `Recent news for ${normalizedTicker} suggests bearish sentiment with concerning market indicators and negative developments. The company appears to be facing headwinds that could impact near-term performance. Current market conditions and company-specific challenges present risks to the investment thesis. Caution is warranted given the negative sentiment and potential for further volatility.`;
          fallbackCurrentSituation = `${normalizedTicker} is currently facing challenging market conditions with negative news flow impacting investor sentiment. The stock has experienced pressure from unfavorable developments and may continue to underperform until conditions improve. Market concerns appear to be weighing on valuation and trading activity.`;
          fallbackFutureOutlook = `The negative sentiment surrounding ${normalizedTicker} suggests potential for continued underperformance in the near term. Investors may remain cautious until the company addresses current challenges and demonstrates improved fundamentals. Recovery prospects depend on management's ability to navigate current headwinds and restore market confidence.`;
        } else {
          fallbackExplanation = `${normalizedTicker} shows neutral sentiment with balanced market indicators from recent news analysis. The stock appears to be in a consolidation phase with mixed signals from recent developments. Market sentiment reflects uncertainty about near-term direction. Investors appear to be taking a wait-and-see approach pending clearer fundamental catalysts.`;
        }
      }

      analysis = {
        sentiment: fallbackSentiment,
        confidence: fallbackConfidence,
        momentum:
          fallbackSentiment === "bullish"
            ? "positive"
            : fallbackSentiment === "bearish"
            ? "negative"
            : "neutral",
        explanation: fallbackExplanation,
        currentSituation: fallbackCurrentSituation,
        futureOutlook: fallbackFutureOutlook,
        keyFactors: newsContent
          ? [
              "Recent news sentiment analysis",
              "Market development indicators",
              "Investment community response",
              "Sector performance trends",
            ]
          : [
              "Limited recent news availability",
              "General market conditions",
              "Historical performance patterns",
              "Sector comparison metrics",
            ],
        riskFactors: [
          "Market volatility and external factors",
          "Sector-specific regulatory changes",
          "Economic uncertainty impacts",
        ],
        opportunities: [
          "Potential market recovery scenarios",
          "Industry growth opportunities",
          "Strategic positioning advantages",
        ],
      };
    }

    const result = {
      ...analysis,
      news: newsArticles,
      timestamp: new Date().toISOString(),
    };

    // Cache the sentiment result
    setCachedData(sentimentCacheKey, result);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-sentiment function:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to analyze sentiment",
        sentiment: "neutral",
        confidence: 0,
        explanation:
          "Error occurred during analysis - unable to process request",
        currentSituation: "Analysis unavailable due to technical error",
        futureOutlook: "Unable to provide outlook due to processing error",
        keyFactors: ["Technical error encountered"],
        riskFactors: ["System availability risk"],
        opportunities: ["Retry analysis when system is available"],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
