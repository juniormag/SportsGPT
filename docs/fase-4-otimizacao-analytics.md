# 📈 Fase 4: Otimização e Analytics

**Duração estimada:** 1-2 semanas  
**Objetivo:** Performance, analytics e preparação para produção

## 🎯 Objetivos da Fase

- ✅ Implementar cache inteligente para reduzir custos
- ✅ Adicionar analytics detalhados e métricas
- ✅ Otimizar performance e tempo de resposta
- ✅ Implementar A/B testing para melhorias
- ✅ Preparar sistema para produção

## 📋 Checklist de Implementação

### **4.1 Sistema de Cache Inteligente**

#### **lib/cache-manager.ts**
```typescript
import { kv } from '@vercel/kv'
import { createHash } from 'crypto'

export interface CacheEntry {
  content: string
  metadata: {
    teams: string[]
    questionType: string
    confidence: number
    createdAt: string
    expiresAt: string
    hitCount: number
  }
}

export class IntelligentCache {
  private static TTL = {
    // TTL baseado no tipo de pergunta
    'general': 24 * 60 * 60, // 24 horas
    'team-stats': 6 * 60 * 60, // 6 horas
    'betting': 2 * 60 * 60, // 2 horas
    'live-odds': 30 * 60, // 30 minutos
    'match-prediction': 4 * 60 * 60, // 4 horas
  }
  
  static generateCacheKey(prompt: string, teams: string[], context: any): string {
    const normalizedPrompt = prompt.toLowerCase().trim()
    const sortedTeams = [...teams].sort()
    const contextString = JSON.stringify(context)
    
    const combined = `${normalizedPrompt}:${sortedTeams.join(',')}:${contextString}`
    return createHash('md5').update(combined).digest('hex')
  }
  
  static async get(cacheKey: string): Promise<CacheEntry | null> {
    try {
      const cached = await kv.get(`cache:${cacheKey}`)
      if (!cached) return null
      
      const entry = JSON.parse(cached as string) as CacheEntry
      
      // Verificar se expirou
      if (new Date() > new Date(entry.metadata.expiresAt)) {
        await this.delete(cacheKey)
        return null
      }
      
      // Incrementar hit count
      entry.metadata.hitCount++
      await kv.set(`cache:${cacheKey}`, JSON.stringify(entry))
      
      return entry
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }
  
  static async set(
    cacheKey: string, 
    content: string, 
    metadata: Omit<CacheEntry['metadata'], 'createdAt' | 'expiresAt' | 'hitCount'>
  ): Promise<void> {
    try {
      const ttl = this.TTL[metadata.questionType as keyof typeof this.TTL] || this.TTL.general
      const now = new Date()
      const expiresAt = new Date(now.getTime() + ttl * 1000)
      
      const entry: CacheEntry = {
        content,
        metadata: {
          ...metadata,
          createdAt: now.toISOString(),
          expiresAt: expiresAt.toISOString(),
          hitCount: 0
        }
      }
      
      await kv.set(`cache:${cacheKey}`, JSON.stringify(entry), {
        ex: ttl
      })
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }
  
  static async delete(cacheKey: string): Promise<void> {
    try {
      await kv.del(`cache:${cacheKey}`)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }
  
  static async getStats(): Promise<{
    totalEntries: number
    hitRate: number
    topQuestions: Array<{ question: string; hits: number }>
  }> {
    try {
      const keys = await kv.keys('cache:*')
      const entries = await Promise.all(
        keys.map(key => kv.get(key))
      )
      
      const validEntries = entries
        .filter(Boolean)
        .map(entry => JSON.parse(entry as string) as CacheEntry)
      
      const totalHits = validEntries.reduce((sum, entry) => sum + entry.metadata.hitCount, 0)
      const totalRequests = validEntries.length + totalHits
      
      const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0
      
      const topQuestions = validEntries
        .sort((a, b) => b.metadata.hitCount - a.metadata.hitCount)
        .slice(0, 10)
        .map(entry => ({
          question: entry.content.slice(0, 100) + '...',
          hits: entry.metadata.hitCount
        }))
      
      return {
        totalEntries: validEntries.length,
        hitRate,
        topQuestions
      }
    } catch (error) {
      console.error('Cache stats error:', error)
      return { totalEntries: 0, hitRate: 0, topQuestions: [] }
    }
  }
}
```

### **4.2 Sistema de Analytics**

#### **lib/analytics.ts**
```typescript
export interface AnalyticsEvent {
  id: string
  type: 'chat_started' | 'message_sent' | 'response_received' | 'feedback_given' | 'session_ended'
  userId: string
  sessionId: string
  timestamp: string
  data: Record<string, any>
}

export interface ChatMetrics {
  responseTime: number
  tokenUsage: {
    prompt: number
    completion: number
    total: number
  }
  cacheHit: boolean
  userSatisfaction?: 'positive' | 'negative'
  teams: string[]
  questionType: string
}

export class AnalyticsManager {
  static async trackEvent(event: Omit<AnalyticsEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const analyticsEvent: AnalyticsEvent = {
        ...event,
        id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString()
      }
      
      // Store no KV (em produção, usar analytics service dedicado)
      await kv.lpush('analytics:events', JSON.stringify(analyticsEvent))
      
      // Manter apenas os últimos 10k eventos
      await kv.ltrim('analytics:events', 0, 9999)
      
      // Analytics em tempo real (opcional)
      await this.updateRealTimeMetrics(analyticsEvent)
      
    } catch (error) {
      console.error('Analytics tracking error:', error)
    }
  }
  
  static async getChatMetrics(timeframe: '24h' | '7d' | '30d' = '24h'): Promise<{
    totalChats: number
    averageResponseTime: number
    cacheHitRate: number
    userSatisfaction: number
    popularTeams: Array<{ team: string; mentions: number }>
    questionTypes: Array<{ type: string; count: number }>
    tokenUsage: { total: number; cost: number }
  }> {
    try {
      const events = await this.getEventsInTimeframe(timeframe)
      
      const chatEvents = events.filter(e => e.type === 'response_received')
      const feedbackEvents = events.filter(e => e.type === 'feedback_given')
      
      // Calcular métricas
      const totalChats = chatEvents.length
      const averageResponseTime = chatEvents.reduce((sum, e) => 
        sum + (e.data.metrics?.responseTime || 0), 0
      ) / totalChats || 0
      
      const cacheHits = chatEvents.filter(e => e.data.metrics?.cacheHit).length
      const cacheHitRate = totalChats > 0 ? (cacheHits / totalChats) * 100 : 0
      
      const positiveFeedback = feedbackEvents.filter(e => 
        e.data.feedback === 'positive'
      ).length
      const userSatisfaction = feedbackEvents.length > 0 
        ? (positiveFeedback / feedbackEvents.length) * 100 
        : 0
      
      // Teams mais populares
      const teamMentions = new Map<string, number>()
      chatEvents.forEach(event => {
        const teams = event.data.metrics?.teams || []
        teams.forEach((team: string) => {
          teamMentions.set(team, (teamMentions.get(team) || 0) + 1)
        })
      })
      
      const popularTeams = Array.from(teamMentions.entries())
        .map(([team, mentions]) => ({ team, mentions }))
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 10)
      
      // Tipos de pergunta
      const questionTypeCounts = new Map<string, number>()
      chatEvents.forEach(event => {
        const type = event.data.metrics?.questionType || 'unknown'
        questionTypeCounts.set(type, (questionTypeCounts.get(type) || 0) + 1)
      })
      
      const questionTypes = Array.from(questionTypeCounts.entries())
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
      
      // Uso de tokens e custo
      const totalTokens = chatEvents.reduce((sum, e) => 
        sum + (e.data.metrics?.tokenUsage?.total || 0), 0
      )
      
      // Custo aproximado (GPT-3.5-turbo: $0.002/1K tokens)
      const cost = (totalTokens / 1000) * 0.002
      
      return {
        totalChats,
        averageResponseTime,
        cacheHitRate,
        userSatisfaction,
        popularTeams,
        questionTypes,
        tokenUsage: { total: totalTokens, cost }
      }
    } catch (error) {
      console.error('Error getting chat metrics:', error)
      return {
        totalChats: 0,
        averageResponseTime: 0,
        cacheHitRate: 0,
        userSatisfaction: 0,
        popularTeams: [],
        questionTypes: [],
        tokenUsage: { total: 0, cost: 0 }
      }
    }
  }
  
  private static async getEventsInTimeframe(timeframe: string): Promise<AnalyticsEvent[]> {
    const events = await kv.lrange('analytics:events', 0, -1)
    const now = new Date()
    
    const timeframeHours = {
      '24h': 24,
      '7d': 24 * 7,
      '30d': 24 * 30
    }[timeframe] || 24
    
    const cutoff = new Date(now.getTime() - timeframeHours * 60 * 60 * 1000)
    
    return events
      .map(event => JSON.parse(event as string) as AnalyticsEvent)
      .filter(event => new Date(event.timestamp) > cutoff)
  }
  
  private static async updateRealTimeMetrics(event: AnalyticsEvent): Promise<void> {
    // Atualizar métricas em tempo real para dashboard
    const key = `metrics:realtime:${new Date().toISOString().split('T')[0]}`
    
    await kv.hincrby(key, `${event.type}_count`, 1)
    await kv.expire(key, 7 * 24 * 60 * 60) // 7 dias
  }
}
```

### **4.3 API Otimizada com Cache e Analytics**

#### **app/api/chat/route.ts (Final)**
```typescript
import { buildPrompt, analyzeQuestion } from '@/lib/prompts'
import { getTeamContext } from '@/lib/teams-data'
import { IntelligentCache } from '@/lib/cache-manager'
import { AnalyticsManager } from '@/lib/analytics'
import { openai } from '@/lib/openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'

export async function POST(req: Request) {
  const startTime = Date.now()
  let sessionId = ''
  let userId = ''
  
  try {
    const { messages, teams = [], sessionId: reqSessionId, userId: reqUserId } = await req.json()
    sessionId = reqSessionId || `session_${Date.now()}`
    userId = reqUserId || 'anonymous'
    
    const lastMessage = messages[messages.length - 1]?.content || ''
    
    // Track chat started
    await AnalyticsManager.trackEvent({
      type: 'chat_started',
      userId,
      sessionId,
      data: { teams, question: lastMessage }
    })
    
    // Analisar contexto
    const context = analyzeQuestion(lastMessage, teams)
    const teamContext = getTeamContext(teams)
    
    // Tentar cache primeiro
    const cacheKey = IntelligentCache.generateCacheKey(
      lastMessage, 
      teams, 
      { type: context.type, timeframe: context.timeframe }
    )
    
    const cached = await IntelligentCache.get(cacheKey)
    
    if (cached && cached.metadata.confidence > 0.8) {
      // Retornar resposta do cache
      const responseTime = Date.now() - startTime
      
      await AnalyticsManager.trackEvent({
        type: 'response_received',
        userId,
        sessionId,
        data: {
          metrics: {
            responseTime,
            cacheHit: true,
            teams,
            questionType: context.type,
            tokenUsage: { prompt: 0, completion: 0, total: 0 }
          }
        }
      })
      
      // Simular streaming para consistência de UX
      const stream = new ReadableStream({
        start(controller) {
          const chunks = cached.content.split(' ')
          let i = 0
          
          const interval = setInterval(() => {
            if (i < chunks.length) {
              controller.enqueue(new TextEncoder().encode(chunks[i] + ' '))
              i++
            } else {
              controller.close()
              clearInterval(interval)
            }
          }, 50) // 50ms por palavra
        }
      })
      
      return new StreamingTextResponse(stream)
    }
    
    // Construir prompt
    const systemPrompt = buildPrompt(context.type, {
      teams,
      question: lastMessage,
      additionalContext: teamContext
    })
    
    // Ajustar parâmetros baseado na complexidade
    const modelParams = {
      simple: { temperature: 0.3, max_tokens: 500 },
      intermediate: { temperature: 0.5, max_tokens: 800 },
      advanced: { temperature: 0.7, max_tokens: 1200 }
    }[context.complexity]
    
    // Chamar OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      ...modelParams,
    })

    let completionContent = ''
    let tokenUsage = { prompt: 0, completion: 0, total: 0 }
    
    const stream = OpenAIStream(response, {
      onStart: async () => {
        console.log('Stream started')
      },
      onToken: async (token: string) => {
        completionContent += token
      },
      onCompletion: async (completion: string) => {
        const responseTime = Date.now() - startTime
        
        // Estimar uso de tokens (em produção, usar usage real da API)
        tokenUsage = {
          prompt: Math.ceil(systemPrompt.length / 4),
          completion: Math.ceil(completion.length / 4),
          total: Math.ceil((systemPrompt.length + completion.length) / 4)
        }
        
        // Salvar no cache se a resposta for boa
        if (completion.length > 50 && !completion.includes('erro')) {
          await IntelligentCache.set(cacheKey, completion, {
            teams,
            questionType: context.type,
            confidence: 0.9 // Alta confiança para respostas da OpenAI
          })
        }
        
        // Track resposta recebida
        await AnalyticsManager.trackEvent({
          type: 'response_received',
          userId,
          sessionId,
          data: {
            metrics: {
              responseTime,
              tokenUsage,
              cacheHit: false,
              teams,
              questionType: context.type
            }
          }
        })
      },
    })
    
    return new StreamingTextResponse(stream)
    
  } catch (error) {
    console.error('Chat API Error:', error)
    
    // Track erro
    await AnalyticsManager.trackEvent({
      type: 'chat_started', // Usar tipo existente
      userId,
      sessionId,
      data: { error: error.message, timestamp: Date.now() - startTime }
    })
    
    return new Response('Internal Server Error', { status: 500 })
  }
}
```

### **4.4 Dashboard de Analytics**

#### **components/analytics-dashboard.tsx**
```typescript
'use client'

import { useState, useEffect } from 'react'
import { AnalyticsManager } from '@/lib/analytics'
import { IntelligentCache } from '@/lib/cache-manager'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AnalyticsDashboard() {
  const [metrics, setMetrics] = useState(null)
  const [cacheStats, setCacheStats] = useState(null)
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h')
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    loadMetrics()
  }, [timeframe])
  
  const loadMetrics = async () => {
    setLoading(true)
    try {
      const [chatMetrics, cacheMetrics] = await Promise.all([
        AnalyticsManager.getChatMetrics(timeframe),
        IntelligentCache.getStats()
      ])
      
      setMetrics(chatMetrics)
      setCacheStats(cacheMetrics)
    } catch (error) {
      console.error('Error loading metrics:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (loading) {
    return <div className="p-8">Carregando analytics...</div>
  }
  
  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <select 
          value={timeframe} 
          onChange={(e) => setTimeframe(e.target.value as any)}
          className="bg-black border border-white/20 rounded-lg px-3 py-2"
        >
          <option value="24h">Últimas 24h</option>
          <option value="7d">Últimos 7 dias</option>
          <option value="30d">Últimos 30 dias</option>
        </select>
      </div>
      
      {/* KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          title="Total de Chats" 
          value={metrics.totalChats.toLocaleString()} 
          trend="+12%" 
        />
        <MetricCard 
          title="Tempo de Resposta" 
          value={`${metrics.averageResponseTime.toFixed(0)}ms`} 
          trend="-5%" 
        />
        <MetricCard 
          title="Cache Hit Rate" 
          value={`${metrics.cacheHitRate.toFixed(1)}%`} 
          trend="+8%" 
        />
        <MetricCard 
          title="Satisfação" 
          value={`${metrics.userSatisfaction.toFixed(1)}%`} 
          trend="+3%" 
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Times Mais Populares</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.popularTeams.slice(0, 8).map((team, index) => (
                <div key={team.team} className="flex justify-between items-center">
                  <span className="capitalize">{team.team}</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="bg-white/20 h-2 rounded"
                      style={{ 
                        width: `${(team.mentions / metrics.popularTeams[0].mentions) * 100}px` 
                      }}
                    />
                    <span className="text-sm text-white/60">{team.mentions}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tipos de Pergunta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.questionTypes.map((type, index) => (
                <div key={type.type} className="flex justify-between items-center">
                  <span className="capitalize">{type.type}</span>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="bg-blue-600/60 h-2 rounded"
                      style={{ 
                        width: `${(type.count / metrics.questionTypes[0].count) * 100}px` 
                      }}
                    />
                    <span className="text-sm text-white/60">{type.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Custos */}
      <Card>
        <CardHeader>
          <CardTitle>Uso de Tokens e Custos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-2xl font-bold">
                {metrics.tokenUsage.total.toLocaleString()}
              </div>
              <div className="text-white/60">Total de Tokens</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                ${metrics.tokenUsage.cost.toFixed(4)}
              </div>
              <div className="text-white/60">Custo Total</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {cacheStats.totalEntries}
              </div>
              <div className="text-white/60">Entradas em Cache</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ title, value, trend }: { title: string; value: string; trend: string }) {
  const isPositive = trend.startsWith('+')
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/60 text-sm">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

### **4.5 A/B Testing**

#### **lib/ab-testing.ts**
```typescript
export interface ABTest {
  id: string
  name: string
  variants: {
    control: any
    treatment: any
  }
  allocation: number // % for treatment (0-100)
  isActive: boolean
  metrics: string[]
}

export class ABTestManager {
  private static tests: ABTest[] = [
    {
      id: 'prompt_style_v1',
      name: 'Prompt Style Test',
      variants: {
        control: { style: 'formal', temperature: 0.5 },
        treatment: { style: 'casual', temperature: 0.7 }
      },
      allocation: 50,
      isActive: true,
      metrics: ['user_satisfaction', 'response_time']
    }
  ]
  
  static getVariant(testId: string, userId: string): 'control' | 'treatment' {
    const test = this.tests.find(t => t.id === testId && t.isActive)
    if (!test) return 'control'
    
    // Hash consistente baseado no userId
    const hash = this.hashUserId(userId)
    const bucket = hash % 100
    
    return bucket < test.allocation ? 'treatment' : 'control'
  }
  
  static async trackConversion(
    testId: string, 
    userId: string, 
    metric: string, 
    value: number
  ): Promise<void> {
    const variant = this.getVariant(testId, userId)
    
    await kv.hincrby(`ab_test:${testId}:${variant}:${metric}`, 'total', value)
    await kv.hincrby(`ab_test:${testId}:${variant}:${metric}`, 'count', 1)
  }
  
  private static hashUserId(userId: string): number {
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}
```

## 📊 Métricas da Fase 4

### **KPIs de Sucesso**
- ✅ Cache hit rate > 30%
- ✅ Redução de custos em 40%
- ✅ Tempo de resposta < 2s
- ✅ Dashboard analytics funcional
- ✅ A/B tests rodando
- ✅ Sistema preparado para produção

### **Monitoramento**
- [ ] Performance de cache
- [ ] Custos de API controlados
- [ ] Analytics em tempo real
- [ ] A/B tests com resultados
- [ ] Logs de erro organizados

## 🎯 Critérios de Conclusão

A Fase 4 está concluída quando:

1. ✅ **Sistema de cache** reduzindo custos significativamente
2. ✅ **Analytics completos** com dashboard funcional
3. ✅ **Performance otimizada** para produção
4. ✅ **A/B testing** implementado e rodando
5. ✅ **Monitoramento** completo em lugar
6. ✅ **Sistema preparado** para escalar

## 🚀 Produção

Após completar todas as 4 fases, o sistema estará pronto para:

- **Deploy em produção** com confiança
- **Escalar** para muitos usuários
- **Monitorar** performance e custos
- **Iterar** baseado em dados reais
- **Evoluir** com novas features

O SportsGPT estará totalmente funcional como um assistente especializado em apostas esportivas! 🎉

