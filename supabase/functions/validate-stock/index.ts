import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const alphaVantageApiKey = Deno.env.get('ALPHA_VANTAGE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ticker } = await req.json();
    
    if (!ticker) {
      return new Response(JSON.stringify({ error: 'Ticker symbol is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Validating ticker: ${ticker}`);

    // First check with Alpha Vantage to see if stock exists
    const stockResponse = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${alphaVantageApiKey}`
    );
    const stockData = await stockResponse.json();
    
    // Check if the response contains valid stock data
    const globalQuote = stockData['Global Quote'];
    const isValidStock = globalQuote && globalQuote['01. symbol'] && globalQuote['05. price'];

    if (!isValidStock) {
      // Use AI to provide a helpful response for invalid ticker
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
              content: 'You are a helpful financial assistant. When a user provides an invalid stock ticker, provide a brief, helpful response suggesting they check the spelling or provide a valid ticker symbol. Keep it under 50 words.'
            },
            {
              role: 'user',
              content: `The ticker "${ticker}" doesn't appear to be a valid stock symbol. Please provide a helpful response.`
            }
          ],
          max_tokens: 100,
          temperature: 0.7,
        }),
      });

      const aiData = await aiResponse.json();
      const message = aiData.choices[0].message.content;

      return new Response(JSON.stringify({ 
        isValid: false, 
        message,
        suggestion: "Please check the ticker symbol and try again."
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If valid, return stock info
    const price = parseFloat(globalQuote['05. price']);
    const change = parseFloat(globalQuote['09. change']);
    const changePercent = globalQuote['10. change percent'];

    return new Response(JSON.stringify({
      isValid: true,
      ticker: globalQuote['01. symbol'],
      price: price,
      change: change,
      changePercent: changePercent,
      high: parseFloat(globalQuote['03. high']),
      low: parseFloat(globalQuote['04. low']),
      volume: parseInt(globalQuote['06. volume'])
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in validate-stock function:', error);
    return new Response(JSON.stringify({ error: 'Failed to validate stock' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});