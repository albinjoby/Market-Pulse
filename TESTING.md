# Market Pulse - API Testing Guide

This file contains sample API calls and testing instructions for the Market Pulse application.

## 🚀 Quick Test

1. **Start the development server:**

   ```bash
   npm run dev
   ```

2. **Open the application:**
   Navigate to `http://localhost:8081` in your browser

3. **Test with sample tickers:**
   - AAPL (Apple Inc.)
   - TSLA (Tesla Inc.)
   - MSFT (Microsoft Corporation)
   - GOOGL (Alphabet Inc.)
   - AMZN (Amazon.com Inc.)

## 📡 Direct API Testing

### Validate Stock Endpoint

```bash
curl -X POST 'https://kbgkmqvceyjnrqdzrbnm.supabase.co/functions/v1/validate-stock' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZ2ttcXZjZXlqbnJxZHpyYm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjkwNzIsImV4cCI6MjA3MDE0NTA3Mn0.a9f3VWGB-Sq0jIC_gtW_wBBvaBLssQMW7XE9Q4MFoS0' \
  -d '{"ticker": "AAPL"}'
```

**Expected Response:**

```json
{
  "isValid": true,
  "ticker": "AAPL",
  "price": 182.52,
  "change": 2.34,
  "changePercent": "+1.30%",
  "high": 185.0,
  "low": 181.0,
  "volume": 45678900
}
```

### Analyze Sentiment Endpoint

```bash
curl -X POST 'https://kbgkmqvceyjnrqdzrbnm.supabase.co/functions/v1/analyze-sentiment' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtiZ2ttcXZjZXlqbnJxZHpyYm5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1NjkwNzIsImV4cCI6MjA3MDE0NTA3Mn0.a9f3VWGB-Sq0jIC_gtW_wBBvaBLssQMW7XE9Q4MFoS0' \
  -d '{"ticker": "AAPL", "companyName": "Apple Inc"}'
```

**Expected Response:**

```json
{
  "sentiment": "bullish",
  "confidence": 78,
  "momentum": "positive",
  "explanation": "Apple shows strong quarterly performance with increased iPhone sales and positive analyst upgrades. The company's expansion into AI and services continues to drive investor confidence.",
  "keyFactors": [
    "Strong quarterly earnings",
    "iPhone demand resilience",
    "AI integration progress"
  ],
  "news": [
    {
      "title": "Apple Reports Record Q4 Revenue",
      "description": "Apple Inc. announced record quarterly revenue driven by strong iPhone and services performance.",
      "url": "https://example.com/news/1",
      "publishedAt": "2025-08-07T10:30:00Z",
      "source": "Reuters"
    }
  ],
  "timestamp": "2025-08-07T12:45:00.123Z"
}
```

## 🧪 Testing Scenarios

### Valid Stocks

- **AAPL**: Should show bullish/neutral sentiment with iPhone and services news
- **TSLA**: Often volatile sentiment based on EV market and Elon Musk news
- **MSFT**: Generally stable with cloud and AI-related positive sentiment
- **GOOGL**: Mixed sentiment based on advertising market and AI competition

### Invalid Stocks

- **INVALID**: Should return helpful error message with suggestions
- **XYZ123**: Should trigger AI-generated helpful response

### Edge Cases

- **Empty input**: Should show validation error
- **Special characters**: Should be handled gracefully
- **Very long ticker**: Should be validated and rejected

## 🔧 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure you're using the correct Supabase URL and API keys
2. **API Rate Limits**:
   - Alpha Vantage: 5 calls per minute (free tier)
   - News API: 1000 requests per day (free tier)
   - OpenAI: Based on your plan
3. **Caching**: Data is cached for 10-15 minutes, so repeated requests return cached results

### Debug Mode

Add `?debug=true` to the frontend URL to see additional logging:

```
http://localhost:8081/?debug=true
```

## 📊 Performance Metrics

- **Stock Validation**: ~1-2 seconds (or instant if cached)
- **Sentiment Analysis**: ~3-5 seconds (includes news fetch + AI analysis)
- **Cache Hit Rate**: Should be >70% in normal usage
- **Error Rate**: Should be <5% with proper API keys

## 🔒 Security Checklist

- ✅ API keys stored as Supabase secrets (not in frontend)
- ✅ CORS configured for specific domains
- ✅ Input validation on all endpoints
- ✅ Rate limiting implemented
- ✅ No sensitive data exposed in responses

## 🚀 Production Deployment

For production deployment:

1. Update CORS origins in Supabase functions
2. Set production environment variables
3. Enable rate limiting
4. Configure monitoring and logging
5. Set up SSL certificates
6. Configure CDN for static assets

---

**Built with ❤️ using React, TypeScript, Supabase, and AI**
