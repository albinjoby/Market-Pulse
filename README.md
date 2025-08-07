# � Market Pulse AI - Advanced Stock Sentiment Analysis Platform

![Market Pulse AI](https://img.shields.io/badge/Market%20Pulse%20AI-v2.0-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Edge%20Functions-3ECF8E?style=for-the-badge&logo=supabase)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=for-the-badge&logo=openai)

A sophisticated AI-powered stock sentiment analysis platform that provides real-time market insights by combining technical analysis, news sentiment, and AI-driven predictions. Built with modern web technologies and production-ready infrastructure.

## Preview

![Image](https://github.com/user-attachments/assets/33ba68b7-34dd-49fb-8a70-29de396cfd7f)

## ✨ Core Features

### 🔍 **Smart Stock Analysis**

- **Real-time Stock Validation**: Validates ticker symbols using Alpha Vantage API
- **Live Price Data**: Current price, change percentage, volume, high/low data
- **Historical Trends**: Price momentum analysis with sparkline visualization
- **Market Metrics**: Comprehensive stock performance indicators

### 📰 **News Sentiment Analysis**

- **Latest Headlines**: Fetches 5 most recent news articles per stock
- **Individual Article Sentiment**: AI analysis for each news piece
- **Aggregated Sentiment**: Overall market sentiment calculation
- **Source Attribution**: News from reputable financial sources

### 🤖 **Advanced AI Analysis**

- **GPT-4o-mini Integration**: Sophisticated AI-powered market analysis
- **Comprehensive Insights**: Current situation, future outlook, risk factors
- **Prediction Models**: AI-driven market trend predictions
- **Confidence Scoring**: Reliability metrics for all predictions

### 🎨 **Modern User Experience**

- **Glassmorphism Design**: Beautiful modern UI with backdrop blur effects
- **Dark/Light Theme**: Seamless theme switching with system preference detection
- **Responsive Layout**: Optimized for desktop, tablet, and mobile
- **Real-time Updates**: Live data refresh with loading states
- **Interactive Charts**: Sparkline price trend visualization
- **Raw Data Viewer**: Expandable JSON data inspection

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm ([Install with nvm](https://github.com/nvm-sh/nvm))
- **Supabase Account** ([Create account](https://supabase.com))
- **API Keys**: OpenAI, Alpha Vantage, News API

### Installation

```bash
# Clone the repository
git clone https://github.com/albinjoby/ticker-pulse-ai.git
cd ticker-pulse-ai

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env.local

# Start development server
npm run dev
```

### Environment Configuration

Create your `.env.local` file with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys (Set these as Supabase secrets)
OPENAI_API_KEY=your_openai_api_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
NEWS_API_KEY=your_news_api_key
```

### Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)
2. **Install Supabase CLI**:
   ```bash
   npm install -g supabase
   ```
3. **Login and link project**:
   ```bash
   supabase login
   supabase link --project-ref your-project-ref
   ```
4. **Deploy edge functions**:
   ```bash
   supabase functions deploy validate-stock
   supabase functions deploy analyze-sentiment
   ```
5. **Set API secrets**:
   ```bash
   supabase secrets set OPENAI_API_KEY=your_key
   supabase secrets set ALPHA_VANTAGE_API_KEY=your_key
   supabase secrets set NEWS_API_KEY=your_key
   ```

## 🏗️ Architecture

### Frontend Stack

- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.19 for fast development and builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui
- **State Management**: TanStack Query for server state
- **Charts**: Recharts for data visualization
- **Routing**: React Router DOM for navigation

### Backend Infrastructure

- **Runtime**: Deno on Supabase Edge Functions
- **Deployment**: Cloudflare Workers worldwide distribution
- **Caching**: In-memory caching with TTL for performance
- **Error Handling**: Comprehensive error management and fallbacks

### External APIs

- **OpenAI GPT-4o-mini**: Advanced sentiment analysis and predictions
- **Alpha Vantage**: Real-time stock data and validation
- **News API**: Latest financial news and headlines

## 📡 API Endpoints

### Stock Validation

```http
POST /functions/v1/validate-stock
Content-Type: application/json

{
  "ticker": "AAPL"
}
```

**Response:**

```json
{
  "isValid": true,
  "data": {
    "symbol": "AAPL",
    "name": "Apple Inc",
    "price": 182.52,
    "change": 2.34,
    "changePercent": "+1.30%",
    "volume": 45234567,
    "high": 185.0,
    "low": 180.5,
    "previousClose": 180.18
  }
}
```

### Sentiment Analysis

```http
POST /functions/v1/analyze-sentiment
Content-Type: application/json

{
  "ticker": "AAPL",
  "companyName": "Apple Inc"
}
```

**Response:**

```json
{
  "ticker": "AAPL",
  "companyName": "Apple Inc",
  "sentiment": "bullish",
  "confidence": 78,
  "overallSentiment": "bullish",
  "stockData": {
    "price": 182.52,
    "change": 2.34,
    "changePercent": "+1.30%",
    "volume": 45234567,
    "momentum": "positive"
  },
  "analysis": {
    "currentSituation": "Strong quarterly performance with record revenue...",
    "futureOutlook": "Positive momentum expected to continue...",
    "riskFactors": ["Market volatility", "Regulatory concerns"],
    "opportunities": ["AI integration", "Services growth"],
    "recommendation": "BUY",
    "targetPrice": 195.0,
    "timeHorizon": "3-6 months"
  },
  "newsArticles": [
    {
      "title": "Apple Reports Record Q4 Revenue",
      "description": "Apple Inc. announced record quarterly revenue...",
      "url": "https://example.com/news",
      "publishedAt": "2025-08-07T10:30:00Z",
      "source": "Reuters",
      "sentiment": "bullish",
      "sentimentScore": 0.8
    }
  ],
  "metadata": {
    "analysisTimestamp": "2025-08-07T14:30:00Z",
    "cacheStatus": "fresh",
    "processingTime": 1.2
  }
}
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking

# Testing
npm run test             # Run Jest tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate test coverage report
```

### Project Structure

```
ticker-pulse-ai/
├── src/
│   ├── components/              # React components
│   │   ├── StockAnalyzer.tsx   # Main analysis component
│   │   ├── SparklineChart.tsx  # Price trend visualization
│   │   ├── RawJsonViewer.tsx   # Data inspection component
│   │   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   │   └── ui/                 # shadcn/ui components
│   ├── hooks/                  # Custom React hooks
│   │   ├── use-mobile.tsx      # Mobile detection
│   │   ├── use-toast.ts        # Toast notifications
│   │   └── useThemeToggle.ts   # Theme management
│   ├── pages/                  # Route components
│   │   ├── Index.tsx           # Home page
│   │   └── NotFound.tsx        # 404 page
│   ├── integrations/           # External service integrations
│   │   └── supabase/           # Supabase client & types
│   ├── lib/                    # Utility functions
│   └── styles/                 # CSS and styling
├── supabase/
│   ├── functions/              # Edge functions
│   │   ├── validate-stock/     # Stock validation service
│   │   └── analyze-sentiment/  # AI sentiment analysis
│   └── config.toml             # Supabase configuration
├── tests/                      # Test suites
│   ├── edge-functions.test.ts  # API endpoint tests
│   └── setup.ts                # Test configuration
├── k8s/                        # Kubernetes manifests
│   ├── deployment.yaml         # Application deployment
│   └── service.yaml            # Load balancer service
├── .github/
│   └── workflows/
│       └── ci-cd.yml           # GitHub Actions pipeline
└── public/                     # Static assets
```

## 🧪 Testing

### Test Stock Tickers

Try these popular stocks to test the system:

**Technology:**

- **AAPL** - Apple Inc.
- **MSFT** - Microsoft Corporation
- **GOOGL** - Alphabet Inc.
- **META** - Meta Platforms Inc.
- **TSLA** - Tesla Inc.

**Finance:**

- **JPM** - JPMorgan Chase & Co.
- **BAC** - Bank of America Corp.
- **WFC** - Wells Fargo & Company

**Healthcare:**

- **JNJ** - Johnson & Johnson
- **PFE** - Pfizer Inc.

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch
```

## 🚀 Deployment

### Docker Deployment

```bash
# Build Docker image
docker build -t market-pulse-ai .

# Run container
docker run -p 3000:3000 market-pulse-ai
```

### Kubernetes Deployment

```bash
# Apply Kubernetes manifests
kubectl apply -f k8s/

# Check deployment status
kubectl get pods
kubectl get services
```

### CI/CD Pipeline

The project includes a complete GitHub Actions workflow:

- **Linting**: ESLint code quality checks
- **Testing**: Jest test suite execution
- **Building**: Production build verification
- **Type Checking**: TypeScript validation
- **Deployment**: Automated deployment to staging/production

## ⚙️ Configuration

### Caching Strategy

The edge functions implement intelligent caching:

- **Stock Data**: 10 minutes TTL
- **News Articles**: 15 minutes TTL
- **Sentiment Analysis**: 5 minutes TTL

### Rate Limits

**API Limits (Free Tiers):**

- Alpha Vantage: 5 calls per minute, 500 calls per day
- News API: 1,000 requests per day
- OpenAI: Varies by plan (pay-per-use)

### Performance Optimizations

- **Edge Function Caching**: Reduces API calls and improves response times
- **React Query**: Client-side caching and background updates
- **Code Splitting**: Lazy loading for optimal bundle sizes
- **Image Optimization**: Compressed assets and modern formats

## 🛡️ Security

### Data Protection

- All API keys stored as encrypted Supabase secrets
- No sensitive data exposed to the frontend
- CORS configuration for authorized domains only
- Input validation and sanitization on all endpoints

### Error Handling

- Graceful degradation for API failures
- Comprehensive error boundaries in React
- Fallback responses for offline scenarios
- User-friendly error messages

## 🎨 Theme System

### Design Tokens

- **Color Palette**: Carefully crafted for financial data visualization
- **Typography**: Optimized for readability and hierarchy
- **Spacing**: Consistent spatial relationships
- **Animation**: Smooth transitions and micro-interactions

### Accessibility

- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader optimization
- High contrast mode support

## 📊 Monitoring & Analytics

### Performance Metrics

- API response times
- Cache hit rates
- Error rates and types
- User engagement metrics

### Logging

- Structured logging in edge functions
- Client-side error tracking
- Performance monitoring
- API usage analytics

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes**: Follow our coding standards
4. **Add tests**: Ensure your code is well-tested
5. **Commit changes**: `git commit -m 'Add amazing feature'`
6. **Push to branch**: `git push origin feature/amazing-feature`
7. **Open a Pull Request**: Include a detailed description

### Development Guidelines

- Use TypeScript for type safety
- Follow the existing code style
- Write comprehensive tests
- Update documentation as needed
- Ensure accessibility compliance

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Alpha Vantage](https://www.alphavantage.co/)** - Real-time stock market data
- **[News API](https://newsapi.org/)** - Financial news and headlines
- **[OpenAI](https://openai.com/)** - AI-powered sentiment analysis
- **[Supabase](https://supabase.com/)** - Backend infrastructure and edge functions
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful UI components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Recharts](https://recharts.org/)** - Data visualization library

## 📈 Roadmap

### Upcoming Features

- **Portfolio Tracking**: Multi-stock portfolio analysis
- **Technical Indicators**: RSI, MACD, Bollinger Bands
- **Social Sentiment**: Twitter/Reddit sentiment integration
- **Mobile App**: React Native mobile application
- **Real-time Alerts**: Price and sentiment notifications
- **Advanced Charts**: Candlestick and volume charts

### Performance Improvements

- **WebSocket Integration**: Real-time data streaming
- **Advanced Caching**: Redis for distributed caching
- **CDN Integration**: Global content delivery
- **Database**: Historical data storage and analysis

---

## ⚠️ **IMPORTANT DISCLAIMER**

**Market Pulse AI is for educational and informational purposes only. This platform does NOT provide financial advice, investment recommendations, or trading guidance. All analysis, predictions, and sentiment data should be considered as informational content only.**

**Key Points:**

- 🚫 **Not Financial Advice**: All content is for educational purposes only
- 📊 **Data Analysis Tool**: This is a sentiment analysis and data visualization platform
- 🎯 **Research Purpose**: Use for market research and educational learning
- ⚖️ **Your Responsibility**: Always consult with qualified financial advisors before making investment decisions
- 📈 **Market Risk**: All investments carry risk and past performance does not guarantee future results

**By using Market Pulse AI, you acknowledge that you understand these limitations and will not hold the platform, its creators, or contributors liable for any financial decisions or losses.**

---

**🔥 Built with passion for the financial community | Powered by AI**

![GitHub stars](https://img.shields.io/github/stars/albinjoby/ticker-pulse-ai?style=social)
![GitHub forks](https://img.shields.io/github/forks/albinjoby/ticker-pulse-ai?style=social)
![GitHub issues](https://img.shields.io/github/issues/albinjoby/ticker-pulse-ai)
![GitHub license](https://img.shields.io/github/license/albinjoby/ticker-pulse-ai)

**💬 Questions? Open an issue or reach out to the community!**
