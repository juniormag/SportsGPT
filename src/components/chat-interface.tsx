"use client"

import { useState, useRef, useEffect } from "react"
import { Send, ArrowLeft, Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface Message {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  isAnimating?: boolean
}

interface ChatInterfaceProps {
  initialQuestion?: string
  selectedTeams?: string[]
  onBack: () => void
}

// Mapeamento dos logos dos times
const teamLogos = {
  corinthians: "/logos/clubes/corinthians.svg",
  flamengo: "/logos/clubes/flamengo.svg",
  "sao-paulo": "/logos/clubes/sao-paulo.svg",
  santos: "/logos/clubes/santos.svg",
  palmeiras: "/logos/clubes/palmeiras.svg",
  "atletico-mg": "/logos/clubes/atletico-mg.svg",
  bragantino: "/logos/clubes/bragantino.svg",
  botafogo: "/logos/clubes/botafogo.svg",
  vitoria: "/logos/clubes/vitoria.svg",
  vasco: "/logos/clubes/vasco.svg",
  sport: "/logos/clubes/sport.svg",
  fluminense: "/logos/clubes/fluminense.svg",
  gremio: "/logos/clubes/gremio.svg",
  cruzeiro: "/logos/clubes/cruzeiro.svg",
}

export function ChatInterface({ initialQuestion, selectedTeams, onBack }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [isFocused, setIsFocused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messageIdCounter = useRef(0)
  const hasInitialized = useRef(false)

  const generateUniqueId = () => {
    messageIdCounter.current += 1
    return `msg-${Date.now()}-${messageIdCounter.current}`
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getTeamSpecificAnalysis = (teamName: string, teamId: string): string => {
    // Análises personalizadas por time
    const teamAnalyses = {
      'corinthians': `🏟️ Análise Especializada - ${teamName}

⚡ Próximos Jogos & Oportunidades:

1. Vitória do Corinthians vs Fortaleza (Casa) - Odd: 1.65
   - 85% de aproveitamento na Neo Química Arena
   - Depay em grande fase: 8 gols nos últimos 6 jogos

2. Over 1.5 gols do Corinthians - Odd: 2.10
   - Média de 2.1 gols por jogo em casa
   - Ataque mais efetivo com Yuri Alberto + Depay

3. Ambos marcam vs Santos - Odd: 1.80
   - Defesa ainda em ajuste (7 gols sofridos em 5 jogos)
   - Santos sempre marca contra grandes

🎯 Betbuilder Recomendado: Vitória Corinthians + Depay marca + Over 2.5 (Odd: 4.20)`,

      'flamengo': `🔴⚫ Análise Especializada - ${teamName}

🔥 Próximos Jogos & Oportunidades:

1. Vitória do Flamengo vs Vasco (Casa) - Odd: 1.45
   - Invencibilidade no Maracanã: 12 jogos
   - Gabigol voltou a marcar (4 gols em 3 jogos)

2. Over 2.5 gols no clássico - Odd: 1.90
   - Média de 3.4 gols nos últimos confrontos
   - Pedro + Gabigol = dupla mais letal do Brasil

3. Flamengo vence ambos os tempos - Odd: 2.80
   - Time costuma decidir jogos cedo
   - 70% dos jogos ganhos por 2+ gols

🎯 Betbuilder Recomendado: Vitória Flamengo + Pedro marca + Menos 3 cartões (Odd: 3.85)`,

      'palmeiras': `🟢 Análise Especializada - ${teamName}

🏆 Próximos Jogos & Oportunidades:

1. Vitória do Palmeiras vs Red Bull Bragantino - Odd: 1.70
   - 80% de vitórias contra times da parte de baixo
   - Estêvão em grande momento: 6 assistências

2. Under 2.5 gols - Odd: 1.95
   - Defesa mais sólida: apenas 8 gols sofridos
   - Jogo tradicionalmente pegado

3. Raphael Veiga marca - Odd: 2.60
   - Artilheiro da equipe em 2024
   - Especialista em cobranças

🎯 Betbuilder Recomendado: Vitória Palmeiras + Under 2.5 + Veiga marca (Odd: 5.10)`,

      'sao-paulo': `🔴🔵⚪ Análise Especializada - ${teamName}

⚡ Próximos Jogos & Oportunidades:

1. Vitória do São Paulo vs Juventude (Casa) - Odd: 1.85
   - Morumbis como fortaleza: 75% aproveitamento
   - Lucas Moura inspirado: 5 gols em 4 jogos

2. Over 1.5 gols São Paulo - Odd: 1.75
   - Ataque mais entrosado com chegada de Calleri
   - Média de 1.8 gols por jogo em casa

3. São Paulo não perde + Over 1.5 - Odd: 1.60
   - Apenas 1 derrota nos últimos 8 jogos
   - Time equilibrado entre defesa e ataque

🎯 Betbuilder Recomendado: Vitória São Paulo + Lucas marca + Menos 4 cartões (Odd: 4.45)`
    }

    return teamAnalyses[teamId as keyof typeof teamAnalyses] || 
           `📊 Análise Especializada - ${teamName}

⚡ Em desenvolvimento...

Estou preparando uma análise completa e personalizada para o ${teamName}! 

No momento, posso oferecer análises detalhadas para os principais times do brasileirão: Corinthians, Flamengo, Palmeiras e São Paulo.

🔜 Em breve teremos análises específicas para todos os times, incluindo:
   - Estatísticas de desempenho recente
   - Odds e mercados recomendados  
   - Análise tática e de jogadores
   - Betbuilders personalizados

Enquanto isso, posso ajudar com análises gerais ou perguntas sobre apostas esportivas!`
  }

  const simulateAIResponse = (userMessage: string): string => {
    // Detectar se é uma pergunta específica de um time
    const isTeamSpecific = selectedTeams?.length === 1
    const teamId = isTeamSpecific ? selectedTeams[0] : null
    const teamName = teamId ? teamId.charAt(0).toUpperCase() + teamId.slice(1).replace('-', ' ') : null
    
    // Respostas personalizadas por time
    if (userMessage.toLowerCase().includes("oportunidades") && isTeamSpecific) {
      return getTeamSpecificAnalysis(teamName!, teamId!)
    }
    
    // Resposta geral para oportunidades
    if (userMessage.toLowerCase().includes("oportunidades")) {
      return `Com base na análise dos próximos jogos${selectedTeams?.length ? ` dos times selecionados` : ""}, aqui estão as melhores oportunidades para apostar:

🎯 Principais Recomendações:

1. Over 2.5 gols - Palmeiras vs Flamengo (Odd: 1.85)
   - Histórico mostra média de 3.2 gols nos últimos confrontos
   
2. Vitória do Corinthians vs Santos (Odd: 2.10)
   - Time mandante com 80% de aproveitamento em casa
   
3. Ambos marcam - São Paulo vs Atlético-MG (Odd: 1.70)
   - Ambas equipes marcaram em 6 dos últimos 8 jogos

💡 Dica Especial: Combine essas apostas em um betbuilder para odds mais atrativas!

Gostaria de mais detalhes sobre alguma dessas oportunidades?`
    }
    
    if (userMessage.toLowerCase().includes("depay")) {
      return `📊 Análise: Memphis Depay marcar gol

Probabilidade estimada: 65%

Fatores considerados:
- Média de 0.8 gols por jogo na temporada
- 12 gols em 15 jogos pelo Corinthians
- Histórico contra o próximo adversário: 3 gols em 4 confrontos

Odds recomendadas:
- Depay marcar a qualquer momento: 1.75
- Depay primeiro gol: 4.50
- Depay 2+ gols: 8.00

Contexto tático: O time tem jogado com Depay mais próximo da área, aumentando suas chances de finalização.

Quer que eu analise outros mercados do Depay?`
    }
    
    if (userMessage.toLowerCase().includes("betbuilder") || userMessage.toLowerCase().includes("brasileiro")) {
      return `🏆 Melhor BetBuilder - Campeonato Brasileiro

Combinação Recomendada (Odd: 4.85):

1. Palmeiras vence vs Atlético-GO (1.45)
2. Over 1.5 gols no jogo (1.25)
3. Raphael Veiga marca (2.30)
4. Menos de 4 cartões (1.15)

Por que essa combinação:
- Palmeiras tem 85% de vitórias contra times da zona de rebaixamento
- Veiga é o artilheiro da equipe com média de 0.6 gols/jogo
- Jogos do Palmeiras têm média baixa de cartões (2.3 por jogo)

Alternativa mais conservadora (Odd: 2.90):
- Palmeiras ou empate + Over 0.5 gols + Menos de 6 escanteios

Qual estratégia prefere: mais arriscada ou conservadora?`
    }

    if (userMessage.toLowerCase().includes("são paulo") || userMessage.toLowerCase().includes("sao paulo")) {
      return `⚽ Análise: Melhores mercados - São Paulo

Próximos 3 jogos:
1. São Paulo vs Fortaleza (Casa)
2. Athletico-PR vs São Paulo (Fora) 
3. São Paulo vs Palmeiras (Casa)

Mercados mais lucrativos:

🎯 Vitória São Paulo vs Fortaleza (Odd: 1.95)
- 70% de aproveitamento em casa
- Fortaleza com 3 derrotas seguidas fora

📈 Over 2.5 gols vs Athletico-PR (Odd: 2.10)
- Athletico tem a pior defesa como mandante
- São Paulo marcou em 8 dos últimos 10 jogos

🔥 Lucas marcar em qualquer jogo (Odd: 2.40)
- Artilheiro da equipe com 18 gols
- Média de 0.75 gols por jogo

Estratégia recomendada: Aposte na vitória contra times mais fracos e explore mercados de gols nos jogos equilibrados.

Quer análise detalhada de algum jogo específico?`
    }

    return `Obrigado pela sua pergunta! Como assistente de apostas esportivas, estou aqui para ajudar com análises e recomendações.

Posso fornecer informações sobre:
- Análises de jogos e mercados
- Estatísticas de times e jogadores  
- Estratégias de apostas
- Odds e probabilidades

Como posso ajudar você com suas apostas esportivas hoje?`
  }

  const handleSendMessage = async (messageContent?: string, isInitial = false) => {
    const content = messageContent || input.trim()
    if (!content) return

    const userMessage: Message = {
      id: generateUniqueId(),
      type: "user",
      content,
      timestamp: new Date(),
      isAnimating: true
    }

    setMessages(prev => [...prev, userMessage])
    if (!isInitial) {
      setInput("")
      // Auto-resize textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
    setIsLoading(true)

    // Remove animation after a short delay
    setTimeout(() => {
      setMessages(prev => prev.map(msg => 
        msg.id === userMessage.id ? { ...msg, isAnimating: false } : msg
      ))
    }, 300)

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: generateUniqueId(),
        type: "assistant",
        content: simulateAIResponse(content),
        timestamp: new Date(),
        isAnimating: true
      }
      setMessages(prev => [...prev, aiResponse])
      setIsLoading(false)
      
      // Remove animation after a short delay
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === aiResponse.id ? { ...msg, isAnimating: false } : msg
        ))
      }, 300)
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px'
  }

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  useEffect(() => {
    if (initialQuestion && !hasInitialized.current) {
      hasInitialized.current = true
      handleSendMessage(initialQuestion, true)
    }
  }, [])

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="border-b border-white/10 p-4 backdrop-blur-sm bg-black/80 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-white hover:bg-white/15 hover:text-white hover:scale-105 transition-all duration-200 flex-shrink-0 rounded-xl"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold tracking-tight">SportsGPT</h1>
          
          {/* Logo do time quando há apenas um time selecionado */}
          {selectedTeams?.length === 1 && (
            <div className="flex items-center gap-3 ml-3">
              <div className="w-9 h-9 flex items-center justify-center bg-white/8 rounded-full border border-white/10 p-1.5">
                {teamLogos[selectedTeams[0] as keyof typeof teamLogos] && (
                  <Image
                    src={teamLogos[selectedTeams[0] as keyof typeof teamLogos]}
                    alt={`Logo ${selectedTeams[0]}`}
                    width={24}
                    height={24}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              <span className="text-sm text-white/90 font-medium hidden sm:block">
                {selectedTeams[0].charAt(0).toUpperCase() + selectedTeams[0].slice(1).replace('-', ' ')}
              </span>
            </div>
          )}
          
          {selectedTeams?.length && selectedTeams.length > 1 && (
            <div className="ml-auto text-sm text-white/70 hidden sm:block font-medium">
              {selectedTeams.length} times selecionados
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-6 px-2 sm:px-0">
          {messages.length === 0 && (
            <div className="text-center py-16 text-white/60">
              <div className="max-w-md mx-auto space-y-6 animate-in fade-in-0 duration-500">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm border border-white/10 flex items-center justify-center mx-auto shadow-lg animate-in zoom-in-50 duration-700 delay-200">
                  <Send className="h-10 w-10 text-white/60" />
                </div>
                <div className="space-y-3 animate-in slide-in-from-bottom-4 duration-600 delay-400">
                  <h2 className="text-xl font-semibold text-white/90 tracking-tight">Pronto para apostar com inteligência?</h2>
                  <p className="text-sm leading-relaxed text-white/70">Faça sua pergunta sobre apostas esportivas e receba análises personalizadas baseadas nos seus times favoritos.</p>
                </div>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} group ${
                message.isAnimating ? 'animate-in slide-in-from-bottom-2 duration-500 ease-out' : ''
              }`}
              style={{ animationDelay: message.isAnimating ? `${index * 100}ms` : '0ms' }}
            >
              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-5 py-4 relative transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${
                  message.type === 'user'
                    ? 'bg-gradient-to-br from-white to-white/95 text-black shadow-lg hover:shadow-xl hover:scale-[1.02] border border-white/20'
                    : 'bg-gradient-to-br from-white/8 to-white/4 text-white backdrop-blur-sm border border-white/5 hover:from-white/10 hover:to-white/6 hover:border-white/10 hover:shadow-lg'
                }`}
                style={{
                  boxShadow: message.type === 'user' 
                    ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)'
                    : '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.02)'
                }}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-[15px] font-normal">{message.content}</div>
                <div className="flex items-center justify-between mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <div className={`text-xs font-medium tracking-wide ${
                    message.type === 'user' ? 'text-black/50' : 'text-white/50'
                  }`}>
                    {message.timestamp.toLocaleTimeString('pt-BR', { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                  {message.type === 'assistant' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(message.content, message.id)}
                      className={`h-7 w-7 p-0 rounded-lg transition-all duration-300 hover:bg-white/20 hover:scale-110 active:scale-95 ${
                        copiedMessageId === message.id 
                          ? 'opacity-100 bg-green-500/20' 
                          : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      {copiedMessageId === message.id ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 fade-in-0 duration-500">
              <div 
                className="bg-gradient-to-br from-white/8 to-white/4 text-white rounded-2xl px-5 py-4 backdrop-blur-sm border border-white/5 shadow-lg"
                style={{
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.02)'
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2.5 h-2.5 bg-white/70 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-[15px] text-white/90 font-normal tracking-tight leading-relaxed">SportsGPT está digitando...</span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 p-4 backdrop-blur-sm bg-black/80">
        <div className="max-w-4xl mx-auto px-2 sm:px-0">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Digite sua pergunta sobre apostas esportivas..."
                className={`w-full bg-white/8 border rounded-2xl px-4 py-3 text-white placeholder:text-white/60 resize-none focus:outline-none transition-all duration-200 min-h-[52px] max-h-32 leading-relaxed ${
                  isFocused 
                    ? 'border-white/30 bg-white/12 focus:ring-2 focus:ring-white/10 shadow-lg' 
                    : 'border-white/20 hover:border-white/25 hover:bg-white/10'
                }`}
                rows={1}
                disabled={isLoading}
              />
              {input && (
                <div className="absolute bottom-2 right-2 text-xs text-white/40 font-mono">
                  {input.length}
                </div>
              )}
            </div>
            <Button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading}
              className={`bg-gradient-to-br from-white to-white/95 text-black hover:from-white hover:to-white/98 hover:scale-105 active:scale-95 rounded-xl p-3 h-[56px] min-w-[56px] transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) border border-white/20 ${
                !input.trim() || isLoading 
                  ? 'opacity-50 cursor-not-allowed hover:scale-100 from-white/70 to-white/60' 
                  : 'hover:shadow-xl shadow-lg'
              }`}
              style={{
                boxShadow: (!input.trim() || isLoading) 
                  ? '0 4px 16px rgba(0, 0, 0, 0.1)'
                  : '0 8px 32px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.2)'
              }}
            >
              <Send className={`h-5 w-5 transition-all duration-300 ${
                input.trim() && !isLoading ? 'group-hover:translate-x-0.5 group-hover:scale-110' : ''
              }`} />
            </Button>
          </div>
          <div className="mt-2 text-xs text-white/50 text-center">
            Pressione Enter para enviar • Shift + Enter para quebrar linha
          </div>
        </div>
      </div>
    </div>
  )
}
