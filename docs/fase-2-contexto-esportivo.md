# ⚽ Fase 2: Contexto Esportivo

**Duração estimada:** 2-3 semanas  
**Objetivo:** Especializar o ChatGPT para apostas esportivas brasileiras

## 🎯 Objetivos da Fase

- ✅ Implementar sistema avançado de prompts
- ✅ Criar knowledge base de times brasileiros
- ✅ Integrar dados históricos e estatísticas
- ✅ Personalizar respostas por contexto esportivo

## 📋 Checklist de Implementação

### **2.1 Sistema de Prompts Especializado**

#### **lib/prompts.ts**
```typescript
export const SPORTS_PROMPTS = {
  base: `Você é SportsGPT, um especialista em apostas esportivas brasileiras com 15+ anos de experiência.

CARACTERÍSTICAS:
- Analista técnico profissional
- Conhecimento profundo do futebol brasileiro
- Foco em estatísticas e dados concretos
- Sempre responsável sobre apostas

DIRETRIZES:
- Use dados estatísticos reais quando possível
- Explique o raciocínio por trás das análises
- Inclua disclaimers sobre riscos
- Seja objetivo e direto
- Evite palpites sem fundamentação`,

  analysis: `Forneça análises técnicas baseadas em:
- Forma atual dos times
- Histórico de confrontos diretos
- Performance em casa vs fora
- Estatísticas de gols, cartões, escanteios
- Lesões e suspensões relevantes
- Contexto do campeonato`,

  betting: `Para recomendações de apostas, considere:
- Odds disponíveis e value betting
- Mercados mais seguros vs arriscados
- Bankroll management
- ROI histórico de tipos de aposta
- Sempre inclua disclaimer de responsabilidade`,

  teams: `Conhecimento específico sobre times brasileiros:
- Série A, B, C e principais estaduais
- Estilo de jogo e táticas
- Elenco atual e principais jogadores
- Performance recente e tendências`,
}

export function buildPrompt(
  type: keyof typeof SPORTS_PROMPTS,
  context: {
    teams?: string[]
    question?: string
    additionalContext?: string
  }
) {
  let prompt = SPORTS_PROMPTS.base + '\n\n' + SPORTS_PROMPTS[type]
  
  if (context.teams?.length) {
    prompt += `\n\nTIMES EM FOCO: ${context.teams.join(', ')}`
    prompt += '\nContextualize sua resposta considerando especificamente estes times.'
  }
  
  if (context.additionalContext) {
    prompt += `\n\nCONTEXTO ADICIONAL: ${context.additionalContext}`
  }
  
  return prompt
}
```

### **2.2 Knowledge Base de Times**

#### **lib/teams-data.ts**
```typescript
export interface TeamData {
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
  keyPlayers: {
    name: string
    position: string
    goals?: number
    assists?: number
  }[]
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

export const TEAMS_DATABASE: Record<string, TeamData> = {
  'flamengo': {
    id: 'flamengo',
    name: 'Flamengo',
    fullName: 'Clube de Regatas do Flamengo',
    league: 'Série A',
    founded: 1895,
    stadium: 'Maracanã',
    capacity: 78838,
    state: 'Rio de Janeiro',
    rivals: ['fluminense', 'botafogo', 'vasco'],
    colors: {
      primary: '#E31414',
      secondary: '#000000'
    },
    recentForm: {
      wins: 8,
      draws: 1,
      losses: 1,
      goalsFor: 22,
      goalsAgainst: 8
    },
    keyPlayers: [
      { name: 'Gabigol', position: 'Atacante', goals: 15, assists: 3 },
      { name: 'Arrascaeta', position: 'Meia', goals: 8, assists: 12 },
      { name: 'Bruno Henrique', position: 'Atacante', goals: 12, assists: 5 }
    ],
    homeRecord: { played: 19, wins: 14, draws: 3, losses: 2 },
    awayRecord: { played: 19, wins: 11, draws: 4, losses: 4 }
  },
  
  'palmeiras': {
    id: 'palmeiras',
    name: 'Palmeiras',
    fullName: 'Sociedade Esportiva Palmeiras',
    league: 'Série A',
    founded: 1914,
    stadium: 'Allianz Parque',
    capacity: 43713,
    state: 'São Paulo',
    rivals: ['corinthians', 'sao-paulo', 'santos'],
    colors: {
      primary: '#006837',
      secondary: '#FFFFFF'
    },
    recentForm: {
      wins: 7,
      draws: 2,
      losses: 1,
      goalsFor: 19,
      goalsAgainst: 7
    },
    keyPlayers: [
      { name: 'Rony', position: 'Atacante', goals: 13, assists: 4 },
      { name: 'Raphael Veiga', position: 'Meia', goals: 11, assists: 8 },
      { name: 'Dudu', position: 'Atacante', goals: 9, assists: 6 }
    ],
    homeRecord: { played: 19, wins: 13, draws: 4, losses: 2 },
    awayRecord: { played: 19, wins: 10, draws: 5, losses: 4 }
  }
  
  // Adicionar todos os outros times...
}

export function getTeamData(teamId: string): TeamData | null {
  return TEAMS_DATABASE[teamId] || null
}

export function getTeamContext(teamIds: string[]): string {
  const teams = teamIds.map(id => getTeamData(id)).filter(Boolean)
  
  if (teams.length === 0) return ''
  
  let context = 'DADOS DOS TIMES:\n\n'
  
  teams.forEach(team => {
    context += `${team.name} (${team.fullName}):\n`
    context += `- Liga: ${team.league}\n`
    context += `- Estádio: ${team.stadium} (${team.capacity.toLocaleString()} lugares)\n`
    context += `- Estado: ${team.state}\n`
    context += `- Rivais: ${team.rivals.join(', ')}\n`
    context += `- Forma recente: ${team.recentForm.wins}V ${team.recentForm.draws}E ${team.recentForm.losses}D\n`
    context += `- Gols: ${team.recentForm.goalsFor} feitos, ${team.recentForm.goalsAgainst} sofridos\n`
    context += `- Casa: ${team.homeRecord.wins}V ${team.homeRecord.draws}E ${team.homeRecord.losses}D\n`
    context += `- Fora: ${team.awayRecord.wins}V ${team.awayRecord.draws}E ${team.awayRecord.losses}D\n`
    context += `- Artilheiros: ${team.keyPlayers.map(p => `${p.name} (${p.goals || 0} gols)`).join(', ')}\n\n`
  })
  
  return context
}
```

### **2.3 Sistema de Análise de Contexto**

#### **lib/context-analyzer.ts**
```typescript
export interface QuestionContext {
  type: 'analysis' | 'betting' | 'comparison' | 'prediction' | 'general'
  teams: string[]
  markets: string[]
  timeframe: 'next-game' | 'next-round' | 'season' | 'general'
  complexity: 'simple' | 'intermediate' | 'advanced'
}

export function analyzeQuestion(question: string, selectedTeams: string[]): QuestionContext {
  const q = question.toLowerCase()
  
  // Detectar tipo de pergunta
  let type: QuestionContext['type'] = 'general'
  
  if (q.includes('odd') || q.includes('aposta') || q.includes('mercado')) {
    type = 'betting'
  } else if (q.includes('análise') || q.includes('estatística') || q.includes('desempenho')) {
    type = 'analysis'
  } else if (q.includes('vs') || q.includes('contra') || q.includes('comparar')) {
    type = 'comparison'
  } else if (q.includes('próximo') || q.includes('previsão') || q.includes('resultado')) {
    type = 'prediction'
  }
  
  // Detectar mercados mencionados
  const markets: string[] = []
  const marketKeywords = {
    'over': ['over', 'acima', 'mais de', 'gols'],
    'under': ['under', 'abaixo', 'menos de'],
    '1x2': ['vitória', 'empate', 'derrota', '1x2'],
    'btts': ['ambos marcam', 'btts', 'gol dos dois'],
    'handicap': ['handicap', 'empate anulado'],
    'escanteios': ['escanteio', 'corner'],
    'cartoes': ['cartão', 'amarelo', 'vermelho']
  }
  
  Object.entries(marketKeywords).forEach(([market, keywords]) => {
    if (keywords.some(keyword => q.includes(keyword))) {
      markets.push(market)
    }
  })
  
  // Detectar timeframe
  let timeframe: QuestionContext['timeframe'] = 'general'
  if (q.includes('próximo jogo') || q.includes('próxima partida')) {
    timeframe = 'next-game'
  } else if (q.includes('próxima rodada') || q.includes('final de semana')) {
    timeframe = 'next-round'
  } else if (q.includes('temporada') || q.includes('campeonato')) {
    timeframe = 'season'
  }
  
  // Detectar complexidade
  const complexity: QuestionContext['complexity'] = 
    markets.length > 2 || q.length > 100 ? 'advanced' :
    markets.length > 0 || selectedTeams.length > 1 ? 'intermediate' : 'simple'
  
  return {
    type,
    teams: selectedTeams,
    markets,
    timeframe,
    complexity
  }
}
```

### **2.4 API Atualizada com Contexto**

#### **app/api/chat/route.ts (Atualizada)**
```typescript
import { buildPrompt } from '@/lib/prompts'
import { getTeamContext, analyzeQuestion } from '@/lib/context-analyzer'
import { openai } from '@/lib/openai'
import { OpenAIStream, StreamingTextResponse } from 'ai'

export async function POST(req: Request) {
  try {
    const { messages, teams = [] } = await req.json()
    const lastMessage = messages[messages.length - 1]?.content || ''
    
    // Analisar contexto da pergunta
    const context = analyzeQuestion(lastMessage, teams)
    
    // Buscar dados dos times
    const teamContext = getTeamContext(teams)
    
    // Construir prompt especializado
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
    
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      ...modelParams,
    })

    const stream = OpenAIStream(response, {
      onStart: async () => {
        // Log analytics
        console.log('Chat started:', { context, teams })
      },
      onCompletion: async (completion) => {
        // Save to analytics
        console.log('Chat completed:', { completion: completion.slice(0, 100) + '...' })
      },
    })
    
    return new StreamingTextResponse(stream)
    
  } catch (error) {
    console.error('Chat API Error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
```

### **2.5 Histórico de Confrontos**

#### **lib/matches-history.ts**
```typescript
export interface MatchResult {
  date: string
  homeTeam: string
  awayTeam: string
  homeScore: number
  awayScore: number
  competition: string
  venue: string
}

export function getHeadToHead(team1: string, team2: string): MatchResult[] {
  // Retornar últimos 10 confrontos entre os times
  // Em produção, isso viria de uma API ou banco de dados
  return MATCHES_DATABASE.filter(match => 
    (match.homeTeam === team1 && match.awayTeam === team2) ||
    (match.homeTeam === team2 && match.awayTeam === team1)
  ).slice(-10)
}

export function getMatchContext(teams: string[]): string {
  if (teams.length !== 2) return ''
  
  const [team1, team2] = teams
  const history = getHeadToHead(team1, team2)
  
  if (history.length === 0) return ''
  
  let context = `HISTÓRICO DE CONFRONTOS (${team1} vs ${team2}):\n\n`
  
  const team1Wins = history.filter(m => 
    (m.homeTeam === team1 && m.homeScore > m.awayScore) ||
    (m.awayTeam === team1 && m.awayScore > m.homeScore)
  ).length
  
  const draws = history.filter(m => m.homeScore === m.awayScore).length
  const team2Wins = history.length - team1Wins - draws
  
  context += `Últimos ${history.length} jogos: ${team1Wins}V ${draws}E ${team2Wins}D para ${team1}\n\n`
  
  context += 'RESULTADOS RECENTES:\n'
  history.reverse().slice(0, 5).forEach(match => {
    context += `${match.date}: ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam} (${match.competition})\n`
  })
  
  return context + '\n'
}
```

## 🎯 Features Avançadas

### **2.6 Sugestões Inteligentes**

```typescript
// components/smart-suggestions.tsx
export function SmartSuggestions({ teams, onSelect }: SmartSuggestionsProps) {
  const suggestions = useMemo(() => {
    if (teams.length === 0) return DEFAULT_SUGGESTIONS
    
    if (teams.length === 1) {
      return [
        `Análise do desempenho recente do ${teams[0]}`,
        `Melhores mercados para apostar no ${teams[0]}`,
        `Estatísticas de gols do ${teams[0]} em casa`,
        `Histórico do ${teams[0]} contra times grandes`
      ]
    }
    
    if (teams.length === 2) {
      return [
        `Análise do confronto ${teams[0]} vs ${teams[1]}`,
        `Histórico de confrontos diretos`,
        `Qual time tem vantagem no próximo jogo?`,
        `Melhores odds para este clássico`
      ]
    }
    
    return [
      `Compare o desempenho destes ${teams.length} times`,
      `Qual time está em melhor fase?`,
      `Ranking de força entre estes times`,
      `Análise dos próximos jogos destes times`
    ]
  }, [teams])
  
  return (
    <div className="space-y-2">
      {suggestions.map((suggestion, index) => (
        <button
          key={index}
          onClick={() => onSelect(suggestion)}
          className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          {suggestion}
        </button>
      ))}
    </div>
  )
}
```

## 📊 Métricas da Fase 2

### **KPIs de Sucesso**
- ✅ Prompts especializados funcionando
- ✅ Knowledge base integrada
- ✅ Análise de contexto precisa
- ✅ Respostas 80% mais relevantes
- ✅ Sugestões inteligentes por contexto

### **Testes de Qualidade**
- [ ] Perguntas sobre times específicos
- [ ] Análises de confrontos diretos
- [ ] Recomendações de apostas
- [ ] Comparações entre múltiplos times
- [ ] Contexto histórico sendo usado

## 🎯 Critérios de Conclusão

A Fase 2 está concluída quando:

1. ✅ **Sistema de prompts especializado** implementado
2. ✅ **Knowledge base de times** funcionando
3. ✅ **Análise de contexto** precisa
4. ✅ **Integração com dados históricos** ativa
5. ✅ **Qualidade das respostas** significativamente melhor
6. ✅ **Sugestões inteligentes** baseadas em contexto

## 🚀 Próxima Fase

Após completar a Fase 2, avançar para [Fase 3: Interface Avançada](./fase-3-interface-avancada.md), onde iremos:

- Implementar chat streaming avançado
- Adicionar histórico de conversas
- Criar features de export e compartilhamento
- Melhorar significativamente a UX do chat

