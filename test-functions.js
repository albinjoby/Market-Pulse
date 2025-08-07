// Simple test script to debug the Supabase functions
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://kbgkmqvceyjnrqdzrbnm.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZ2ttcXZjZXlqbnJxZHpyYm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjkwNzIsImV4cCI6MjA3MDE0NTA3Mn0.a9f3VWGB-Sq0jIC_gtW_wBBvaBLssQMW7XE9Q4MFoS0";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testFunctions() {
  console.log("Testing Supabase functions...");

  try {
    // Test validate-stock
    console.log("\n1. Testing validate-stock function:");
    const { data: validationResult, error: validationError } =
      await supabase.functions.invoke("validate-stock", {
        body: { ticker: "AAPL" },
      });

    console.log("Validation result:", validationResult);
    console.log("Validation error:", validationError);

    if (validationError) {
      console.error("Validation failed:", validationError);
      return;
    }

    if (!validationResult.isValid) {
      console.error("Stock is not valid:", validationResult);
      return;
    }

    // Test analyze-sentiment
    console.log("\n2. Testing analyze-sentiment function:");
    const { data: sentimentResult, error: sentimentError } =
      await supabase.functions.invoke("analyze-sentiment", {
        body: {
          ticker: validationResult.ticker,
          companyName: "Apple Inc",
        },
      });

    console.log("Sentiment result:", sentimentResult);
    console.log("Sentiment error:", sentimentError);

    if (sentimentError) {
      console.error("Sentiment analysis failed:", sentimentError);
      return;
    }

    console.log("\n✅ All tests passed!");
    console.log("Combined data would be:", {
      ticker: validationResult.ticker,
      price: validationResult.price,
      sentiment: sentimentResult.sentiment,
      confidence: sentimentResult.confidence,
      explanation: sentimentResult.explanation,
    });
  } catch (error) {
    console.error("Test failed with error:", error);
  }
}

testFunctions();
