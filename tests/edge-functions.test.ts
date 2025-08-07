import { describe, it, expect } from "@jest/globals";

// Mock Supabase Edge Function environment
const SUPABASE_URL = "https://kbgkmqvceyjnrqdzrbnm.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZ2ttcXZjZXlqbnJxZHpyYm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzI0MDI4NDEsImV4cCI6MjA0Nzk3ODg0MX0.wEeO7wJKUi1JNrmNDWOFKG_I6WQAfkkzBdPGW4LnT9Y";

interface ValidateStockRequest {
  ticker?: string;
}

interface AnalyzeSentimentRequest {
  ticker?: string;
  companyName?: string;
}

describe("Validate Stock Function", () => {
  const baseUrl = `${SUPABASE_URL}/functions/v1/validate-stock`;

  const makeRequest = async (payload: ValidateStockRequest) => {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    return {
      status: response.status,
      data: await response.json(),
    };
  };

  it("should validate a valid stock ticker", async () => {
    const result = await makeRequest({ ticker: "AAPL" });

    expect(result.status).toBe(200);
    expect(result.data.isValid).toBe(true);
    expect(result.data.ticker).toBe("AAPL");
    expect(result.data.price).toBeDefined();
    expect(typeof result.data.price).toBe("number");
  });

  it("should reject an invalid stock ticker", async () => {
    const result = await makeRequest({ ticker: "INVALID123" });

    expect(result.status).toBe(400);
    expect(result.data.isValid).toBe(false);
    expect(result.data.message).toContain("not a valid stock ticker");
  });

  it("should handle missing ticker parameter", async () => {
    const result = await makeRequest({});

    expect(result.status).toBe(400);
    expect(result.data.error).toContain("required");
  });

  it("should handle empty ticker parameter", async () => {
    const result = await makeRequest({ ticker: "" });

    expect(result.status).toBe(400);
    expect(result.data.error).toContain("required");
  });

  it("should normalize ticker case", async () => {
    const result = await makeRequest({ ticker: "aapl" });

    expect(result.status).toBe(200);
    expect(result.data.ticker).toBe("AAPL");
  });
});

describe("Analyze Sentiment Function", () => {
  const baseUrl = `${SUPABASE_URL}/functions/v1/analyze-sentiment`;

  const makeRequest = async (payload: AnalyzeSentimentRequest) => {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${ANON_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    return {
      status: response.status,
      data: await response.json(),
    };
  };

  it("should analyze sentiment for a valid stock ticker", async () => {
    const result = await makeRequest({
      ticker: "AAPL",
      companyName: "Apple Inc",
    });

    expect(result.status).toBe(200);
    expect(result.data.sentiment).toMatch(/^(bullish|bearish|neutral)$/);
    expect(result.data.confidence).toBeGreaterThanOrEqual(0);
    expect(result.data.confidence).toBeLessThanOrEqual(100);
    expect(result.data.explanation).toBeDefined();
    expect(result.data.currentSituation).toBeDefined();
    expect(result.data.futureOutlook).toBeDefined();
    expect(Array.isArray(result.data.keyFactors)).toBe(true);
    expect(Array.isArray(result.data.news)).toBe(true);
  });

  it("should reject invalid stock ticker", async () => {
    const result = await makeRequest({
      ticker: "INVALID999",
      companyName: "Invalid Company",
    });

    expect(result.status).toBe(400);
    expect(result.data.error).toContain("Invalid stock ticker");
  });

  it("should handle missing required parameters", async () => {
    const result = await makeRequest({});

    expect(result.status).toBe(500);
  });

  it("should return proper momentum values", async () => {
    const result = await makeRequest({
      ticker: "MSFT",
      companyName: "Microsoft Corporation",
    });

    if (result.status === 200) {
      expect(result.data.momentum).toMatch(
        /^(strong_positive|positive|neutral|negative|strong_negative)$/
      );
    }
  });

  it("should include risk factors and opportunities", async () => {
    const result = await makeRequest({
      ticker: "TSLA",
      companyName: "Tesla Inc",
    });

    if (result.status === 200) {
      expect(Array.isArray(result.data.riskFactors)).toBe(true);
      expect(Array.isArray(result.data.opportunities)).toBe(true);
      expect(result.data.riskFactors.length).toBeGreaterThan(0);
      expect(result.data.opportunities.length).toBeGreaterThan(0);
    }
  });
});

describe("Integration Tests", () => {
  it("should work end-to-end: validate then analyze", async () => {
    // First validate the stock
    const validateResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/validate-stock`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({ ticker: "AAPL" }),
      }
    );

    const validateData = await validateResponse.json();
    expect(validateResponse.status).toBe(200);
    expect(validateData.isValid).toBe(true);

    // Then analyze sentiment
    const analyzeResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/analyze-sentiment`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ANON_KEY}`,
        },
        body: JSON.stringify({
          ticker: "AAPL",
          companyName: "Apple Inc",
        }),
      }
    );

    const analyzeData = await analyzeResponse.json();
    expect(analyzeResponse.status).toBe(200);
    expect(analyzeData.sentiment).toBeDefined();
  });
});
