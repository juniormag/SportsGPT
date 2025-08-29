# 📡 API Reference - SportsGPT

## 🌐 Base URL
```
Production: https://sportsgpt.vercel.app/api
Development: http://localhost:3000/api
```

## 🔐 Autenticação

Atualmente o sistema opera sem autenticação obrigatória, mas suporta identificação opcional de usuário para analytics e histórico.

```typescript
// Headers opcionais
{
  "X-User-ID": "user_123",
  "X-Session-ID": "session_456"
}
```

## 📊 Endpoints

### **POST /api/chat**

Endpoint principal para conversas com o SportsGPT.

#### **Request**
```typescript
interface ChatRequest {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
  }>
  teams?: string[]           // IDs dos times selecionados
  sessionId?: string         // ID da sessão (para histórico)
  userId?: string           // ID do usuário (para analytics)
  options?: {
    temperature?: number     // 0.1-1.0 (padrão: baseado no contexto)
    maxTokens?: number      // Máximo de tokens (padrão: baseado na complexidade)
    stream?: boolean        // Stream response (padrão: true)
  }
}
```

#### **Response (Streaming)**
```typescript
// Content-Type: text/plain; charset=utf-8
// Transfer-Encoding: chunked

"Olá! " +
"Vou analisar " +
"as oportunidades " +
"de apostas para " +
"os times selecionados..."
```

#### **Response (Error)**
```typescript
interface ErrorResponse {
  error: string
  code: 'RATE_LIMIT' | 'INVALID_INPUT' | 'SERVER_ERROR' | 'QUOTA_EXCEEDED'
  message: string
  retryAfter?: number  // seconds (para rate limit)
}
```

#### **Exemplo**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -H "X-User-ID: user_123" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Quais as melhores apostas para o próximo jogo do Flamengo?"
      }
    ],
    "teams": ["flamengo"],
    "sessionId": "session_456"
  }'
```

---

### **GET /api/teams**

Retorna dados dos times disponíveis.

#### **Request**
```typescript
// Query parameters (opcionais)
{
  league?: 'serie-a' | 'serie-b' | 'estaduais'
  search?: string      // Busca por nome
  limit?: number       // Máximo de resultados (padrão: 50)
}
```

#### **Response**
```typescript
interface TeamsResponse {
  teams: Array<{
    id: string
    name: string
    fullName: string
    league: string
    state: string
    colors: {
      primary: string
      secondary: string
    }
    recentForm?: {
      wins: number
      draws: number
      losses: number
    }
  }>
  total: number
}
```

#### **Exemplo**
```bash
curl "http://localhost:3000/api/teams?league=serie-a&limit=20"
```

---

### **GET /api/teams/[teamId]**

Retorna dados detalhados de um time específico.

#### **Response**
```typescript
interface TeamDetailResponse {
  id: string
  name: string
  fullName: string
  league: string
  founded: number
  stadium: string
  capacity: number
  state: string
  rivals: string[]
  colors: {
    primary: string
    secondary: string
  }
  recentForm: {
    wins: number
    draws: number
    losses: number
    goalsFor: number
    goalsAgainst: number
  }
  keyPlayers: Array<{
    name: string
    position: string
    goals?: number
    assists?: number
  }>
  homeRecord: {
    played: number
    wins: number
    draws: number
    losses: number
  }
  awayRecord: {
    played: number
    wins: number
    draws: number
    losses: number
  }
}
```

---

### **GET /api/analytics/metrics**

Retorna métricas do sistema (requer permissões de admin).

#### **Request**
```typescript
// Query parameters
{
  timeframe: '24h' | '7d' | '30d'
  metrics?: string[]  // Métricas específicas
}
```

#### **Response**
```typescript
interface MetricsResponse {
  timeframe: string
  totalChats: number
  averageResponseTime: number
  cacheHitRate: number
  userSatisfaction: number
  popularTeams: Array<{
    team: string
    mentions: number
  }>
  questionTypes: Array<{
    type: string
    count: number
  }>
  tokenUsage: {
    total: number
    cost: number
  }
}
```

---

### **POST /api/analytics/feedback**

Coleta feedback do usuário sobre respostas.

#### **Request**
```typescript
interface FeedbackRequest {
  sessionId: string
  messageId: string
  feedback: 'positive' | 'negative'
  reason?: string
  userId?: string
}
```

#### **Response**
```typescript
interface FeedbackResponse {
  success: boolean
  message: string
}
```

---

### **GET /api/cache/stats**

Retorna estatísticas do cache (debug/admin).

#### **Response**
```typescript
interface CacheStatsResponse {
  totalEntries: number
  hitRate: number
  topQuestions: Array<{
    question: string
    hits: number
  }>
  storage: {
    used: string
    limit: string
  }
}
```

---

## 🔄 WebSocket Events (Futuro)

Para features em tempo real como odds ao vivo.

### **Connection**
```javascript
const ws = new WebSocket('wss://sportsgpt.vercel.app/ws')
```

### **Events**
```typescript
// Odds update
{
  type: 'odds_update',
  data: {
    match: 'flamengo-vs-palmeiras',
    odds: {
      home: 2.1,
      draw: 3.2,
      away: 3.8
    }
  }
}

// Live match events
{
  type: 'match_event',
  data: {
    match: 'flamengo-vs-palmeiras',
    event: 'goal',
    team: 'flamengo',
    player: 'Gabigol',
    minute: 78
  }
}
```

---

## 📝 Rate Limiting

### **Limites por Endpoint**

| Endpoint | Limite | Window |
|----------|--------|--------|
| `/api/chat` | 10 req/min | Por IP |
| `/api/teams` | 100 req/min | Por IP |
| `/api/analytics/feedback` | 20 req/min | Por usuário |

### **Headers de Rate Limit**
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1640995200
```

### **Rate Limit Response**
```typescript
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMIT",
  "message": "Too many requests. Try again in 30 seconds.",
  "retryAfter": 30
}
```

---

## 🚨 Error Codes

| Code | HTTP Status | Descrição |
|------|-------------|-----------|
| `INVALID_INPUT` | 400 | Dados de entrada inválidos |
| `UNAUTHORIZED` | 401 | Autenticação necessária |
| `FORBIDDEN` | 403 | Acesso negado |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `RATE_LIMIT` | 429 | Muitas requisições |
| `SERVER_ERROR` | 500 | Erro interno do servidor |
| `QUOTA_EXCEEDED` | 503 | Cota da OpenAI excedida |

---

## 📊 Status Monitoring

### **GET /api/health**

Health check do sistema.

#### **Response**
```typescript
interface HealthResponse {
  status: 'healthy' | 'degraded' | 'down'
  timestamp: string
  services: {
    database: 'up' | 'down'
    cache: 'up' | 'down'
    openai: 'up' | 'down'
  }
  performance: {
    responseTime: number
    uptime: number
  }
}
```

---

## 🔧 SDK (Futuro)

### **JavaScript/TypeScript SDK**
```typescript
import { SportsGPTClient } from '@sportsgpt/sdk'

const client = new SportsGPTClient({
  apiKey: 'your-api-key',
  baseURL: 'https://sportsgpt.vercel.app/api'
})

// Chat
const response = await client.chat({
  message: 'Analise o próximo jogo do Flamengo',
  teams: ['flamengo'],
  stream: true
})

// Teams
const teams = await client.getTeams({
  league: 'serie-a'
})
```

### **Python SDK**
```python
from sportsgpt import SportsGPTClient

client = SportsGPTClient(api_key="your-api-key")

# Chat
response = client.chat(
    message="Analise o próximo jogo do Flamengo",
    teams=["flamengo"],
    stream=True
)

# Teams
teams = client.get_teams(league="serie-a")
```

---

## 📝 Changelog

### **v1.3.0 - Current**
- ✅ Chat streaming implementado
- ✅ Sistema de cache inteligente
- ✅ Analytics básicos
- ✅ Suporte a times brasileiros

### **v1.4.0 - Planned**
- 🔄 Histórico de conversas
- 🔄 Export de análises
- 🔄 WebSocket para dados ao vivo
- 🔄 SDK oficial

### **v1.5.0 - Future**
- 📋 Autenticação completa
- 📋 Planos premium
- 📋 API pública
- 📋 Webhooks

---

Esta API está sendo desenvolvida seguindo as 4 fases documentadas e será expandida conforme novas features são implementadas! 🚀

