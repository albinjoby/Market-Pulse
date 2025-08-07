import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const newsApiKey = Deno.env.get('NEWS_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker, companyName } = await req.json();
    
    console.log(`Analyzing sentiment for: ${ticker}`);

    // Fetch recent news about the stock
    const newsResponse = await fetch(
      `https://newsapi.org/v2/everything?q=${ticker} OR "${companyName}"&sortBy=publishedAt&pageSize=10&apiKey=${newsApiKey}`
    );
    const newsData = await newsResponse.json();

    let newsArticles = [];
    if (newsData.articles && newsData.articles.length > 0) {
      newsArticles = newsData.articles.slice(0, 5).map(article => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name
      }));
    }

    // Prepare news content for AI analysis
    const newsContent = newsArticles.map(article => 
      `Title: ${article.title}\nDescription: ${article.description}`
    ).join('\n\n');

    // Use AI to analyze sentiment
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a financial analyst AI. Analyze the sentiment around a stock based on recent news. Respond with a JSON object containing:
            - sentiment: "bullish", "bearish", or "neutral"
            - confidence: number between 0-100
            - momentum: "strong_positive", "positive", "neutral", "negative", "strong_negative"
            - explanation: brief 2-3 sentence explanation of your analysis
            - keyFactors: array of 2-3 key factors influencing the sentiment`
          },
          {
            role: 'user',
            content: `Analyze the sentiment for ${ticker} (${companyName}) based on this recent news:\n\n${newsContent || 'No recent news available - provide general market analysis for this stock.'}`
          }
        ],
        max_tokens: 500,
        temperature: 0.3,
      }),
    });

    const aiData = await aiResponse.json();
    let analysis;
    
    try {
      analysis = JSON.parse(aiData.choices[0].message.content);
    } catch {
      // Fallback if AI doesn't return valid JSON
      analysis = {
        sentiment: 'neutral',
        confidence: 50,
        momentum: 'neutral',
        explanation: 'Unable to determine sentiment from available data.',
        keyFactors: ['Limited data available', 'Market conditions unclear']
      };
    }

    return new Response(JSON.stringify({
      ...analysis,
      news: newsArticles,
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-sentiment function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to analyze sentiment',
      sentiment: 'neutral',
      confidence: 0,
      explanation: 'Error occurred during analysis'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});