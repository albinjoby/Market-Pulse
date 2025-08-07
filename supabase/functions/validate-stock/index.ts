import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get("OPENAI_API_KEY");
const alphaVantageApiKey = Deno.env.get("ALPHA_VANTAGE_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// In-memory cache with TTL (10 minutes for stock data)
const cache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes in milliseconds

function getCachedData(key: string) {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log(`Cache hit for: ${key}`);
    return cached.data;
  }
  if (cached) {
    cache.delete(key); // Remove expired entry
  }
  return null;
}

function setCachedData(key: string, data: any) {
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
    const { ticker } = await req.json();

    if (!ticker) {
      return new Response(
        JSON.stringify({ error: "Ticker symbol is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const normalizedTicker = ticker.trim().toUpperCase();
    console.log(`Validating ticker: ${normalizedTicker}`);

    // Check cache first
    const cacheKey = `stock_${normalizedTicker}`;
    const cachedResult = getCachedData(cacheKey);
    if (cachedResult) {
      return new Response(JSON.stringify(cachedResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // First check with Alpha Vantage to see if stock exists
    const stockResponse = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${normalizedTicker}&apikey=${alphaVantageApiKey}`
    );
    const stockData = await stockResponse.json();

    // Check if the response contains valid stock data
    const globalQuote = stockData["Global Quote"];
    const isValidStock =
      globalQuote && globalQuote["01. symbol"] && globalQuote["05. price"];

    if (!isValidStock) {
      // Simple response for invalid ticker without AI dependency
      const message = `"${normalizedTicker}" is not a valid stock ticker. Please check the spelling and try again with a valid symbol like AAPL, MSFT, or TSLA.`;

      const invalidResult = {
        isValid: false,
        message,
        suggestion: "Please check the ticker symbol and try again.",
      };

      return new Response(JSON.stringify(invalidResult), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // If valid, return stock info
    const price = parseFloat(globalQuote["05. price"]);
    const change = parseFloat(globalQuote["09. change"]);
    const changePercent = globalQuote["10. change percent"];

    const validResult = {
      isValid: true,
      ticker: globalQuote["01. symbol"],
      price: price,
      change: change,
      changePercent: changePercent,
      high: parseFloat(globalQuote["03. high"]),
      low: parseFloat(globalQuote["04. low"]),
      volume: parseInt(globalQuote["06. volume"]),
    };

    // Cache the result
    setCachedData(cacheKey, validResult);

    return new Response(JSON.stringify(validResult), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in validate-stock function:", error);
    return new Response(JSON.stringify({ error: "Failed to validate stock" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
