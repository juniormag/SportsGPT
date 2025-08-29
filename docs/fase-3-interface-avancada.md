# 🎨 Fase 3: Interface Avançada

**Duração estimada:** 2-3 semanas  
**Objetivo:** Melhorar UX do chat e adicionar features avançadas

## 🎯 Objetivos da Fase

- ✅ Implementar chat streaming avançado com indicadores visuais
- ✅ Adicionar sistema de histórico e persistência
- ✅ Criar features de export e compartilhamento
- ✅ Implementar modo escuro/claro e personalização
- ✅ Adicionar atalhos e comandos rápidos

## 📋 Checklist de Implementação

### **3.1 Chat Streaming Avançado**

#### **components/enhanced-chat-interface.tsx**
```typescript
'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageSquare, Mic, MicOff, Copy, Share, Download } from 'lucide-react'

interface EnhancedChatInterfaceProps {
  selectedTeams: string[]
  initialQuestion?: string
  onBack: () => void
}

export function EnhancedChatInterface({ selectedTeams, initialQuestion, onBack }: EnhancedChatInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [typingSpeed, setTypingSpeed] = useState(50) // ms per character
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: '/api/chat',
    body: {
      teams: selectedTeams,
    },
    initialMessages: initialQuestion ? [{
      id: 'initial',
      role: 'user',
      content: initialQuestion,
    }] : [],
  })

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  return (
    <div className="flex flex-col h-full bg-black text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onBack}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            ←
          </button>
          <div>
            <h2 className="font-semibold">SportsGPT Chat</h2>
            {selectedTeams.length > 0 && (
              <p className="text-sm text-white/60">
                Focado em: {selectedTeams.join(', ')}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <ChatOptionsMenu messages={messages} />
          {isLoading && (
            <button 
              onClick={stop}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition-colors"
            >
              Parar
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatMessage 
                message={message} 
                isTyping={isLoading && index === messages.length - 1 && message.role === 'assistant'}
                onCopy={() => navigator.clipboard.writeText(message.content)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center space-x-3 text-white/60"
          >
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <span>Analisando dados esportivos...</span>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <QuickActions onAction={(action) => handleQuickAction(action, selectedTeams)} />

      {/* Input */}
      <ChatInput
        value={input}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        isLoading={isLoading}
        isRecording={isRecording}
        onToggleRecording={() => setIsRecording(!isRecording)}
      />
    </div>
  )
}
```

#### **components/chat-message.tsx (Enhanced)**
```typescript
import { Message } from 'ai'
import { Copy, ThumbsUp, ThumbsDown, Share } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface ChatMessageProps {
  message: Message
  isTyping?: boolean
  onCopy: () => void
  onFeedback?: (type: 'positive' | 'negative') => void
}

export function ChatMessage({ message, isTyping, onCopy, onFeedback }: ChatMessageProps) {
  const [showActions, setShowActions] = useState(false)
  const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)
  const isUser = message.role === 'user'
  
  const handleFeedback = (type: 'positive' | 'negative') => {
    setFeedback(type)
    onFeedback?.(type)
  }
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`max-w-[85%] group ${isUser ? 'order-1' : 'order-2'}`}>
        {/* Message bubble */}
        <motion.div
          className={`rounded-2xl p-4 ${
            isUser
              ? 'bg-white text-black'
              : 'bg-white/10 text-white border border-white/20'
          }`}
          layout
        >
          {isTyping ? (
            <TypingAnimation content={message.content} />
          ) : (
            <MessageContent content={message.content} />
          )}
        </motion.div>
        
        {/* Actions */}
        <AnimatePresence>
          {showActions && !isUser && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex items-center space-x-2 mt-2 ml-2"
            >
              <button
                onClick={onCopy}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Copiar"
              >
                <Copy size={14} />
              </button>
              
              <button
                onClick={() => handleFeedback('positive')}
                className={`p-1.5 rounded-lg transition-colors ${
                  feedback === 'positive' ? 'bg-green-600/20 text-green-400' : 'hover:bg-white/10'
                }`}
                title="Útil"
              >
                <ThumbsUp size={14} />
              </button>
              
              <button
                onClick={() => handleFeedback('negative')}
                className={`p-1.5 rounded-lg transition-colors ${
                  feedback === 'negative' ? 'bg-red-600/20 text-red-400' : 'hover:bg-white/10'
                }`}
                title="Não útil"
              >
                <ThumbsDown size={14} />
              </button>
              
              <button
                onClick={() => {/* Share logic */}}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
                title="Compartilhar"
              >
                <Share size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function TypingAnimation({ content }: { content: string }) {
  const [displayedContent, setDisplayedContent] = useState('')
  
  useEffect(() => {
    if (content.length === 0) return
    
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1))
        currentIndex++
      } else {
        clearInterval(interval)
      }
    }, 30) // 30ms per character for smooth typing
    
    return () => clearInterval(interval)
  }, [content])
  
  return (
    <div className="whitespace-pre-wrap">
      {displayedContent}
      <span className="animate-pulse">|</span>
    </div>
  )
}
```

### **3.2 Sistema de Histórico**

#### **lib/chat-history.ts**
```typescript
import { kv } from '@vercel/kv'

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  teams: string[]
  createdAt: string
  updatedAt: string
  metadata?: {
    totalTokens?: number
    avgResponseTime?: number
    userSatisfaction?: number
  }
}

export class ChatHistoryManager {
  private static getUserKey(userId: string) {
    return `chat_history:${userId}`
  }
  
  static async saveChatSession(userId: string, session: ChatSession): Promise<void> {
    const key = this.getUserKey(userId)
    const existingSessions = await this.getChatHistory(userId)
    
    const updatedSessions = [
      session,
      ...existingSessions.filter(s => s.id !== session.id)
    ].slice(0, 50) // Manter apenas últimas 50 conversas
    
    await kv.set(key, JSON.stringify(updatedSessions))
  }
  
  static async getChatHistory(userId: string): Promise<ChatSession[]> {
    const key = this.getUserKey(userId)
    const data = await kv.get(key)
    
    if (!data) return []
    
    try {
      return JSON.parse(data as string)
    } catch {
      return []
    }
  }
  
  static async deleteChatSession(userId: string, sessionId: string): Promise<void> {
    const sessions = await this.getChatHistory(userId)
    const updated = sessions.filter(s => s.id !== sessionId)
    
    const key = this.getUserKey(userId)
    await kv.set(key, JSON.stringify(updated))
  }
  
  static generateSessionTitle(messages: Message[]): string {
    const firstUserMessage = messages.find(m => m.role === 'user')?.content || ''
    
    if (firstUserMessage.length <= 50) return firstUserMessage
    
    // Extrair temas principais
    const keywords = firstUserMessage.toLowerCase()
    
    if (keywords.includes('odd') || keywords.includes('aposta')) {
      return 'Análise de Apostas'
    }
    if (keywords.includes('confronto') || keywords.includes('vs')) {
      return 'Comparação de Times'
    }
    if (keywords.includes('estatística') || keywords.includes('desempenho')) {
      return 'Análise Estatística'
    }
    
    return firstUserMessage.slice(0, 47) + '...'
  }
}
```

#### **components/chat-history-sidebar.tsx**
```typescript
export function ChatHistorySidebar({ userId, onSelectSession, onNewChat }: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    loadHistory()
  }, [userId])
  
  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const history = await ChatHistoryManager.getChatHistory(userId)
      setSessions(history)
    } catch (error) {
      console.error('Error loading chat history:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const deleteSession = async (sessionId: string) => {
    try {
      await ChatHistoryManager.deleteChatSession(userId, sessionId)
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }
  
  return (
    <div className="w-80 bg-black/50 border-r border-white/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <button
          onClick={onNewChat}
          className="w-full bg-white text-black py-2 px-4 rounded-lg hover:bg-white/90 transition-colors"
        >
          + Nova Conversa
        </button>
      </div>
      
      {/* History */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-white/5 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center text-white/60 py-8">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-30" />
            <p>Nenhuma conversa ainda</p>
            <p className="text-sm">Comece fazendo uma pergunta!</p>
          </div>
        ) : (
          sessions.map(session => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="group relative"
            >
              <button
                onClick={() => onSelectSession(session)}
                className="w-full text-left p-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="font-medium text-sm truncate">{session.title}</div>
                <div className="text-xs text-white/60 mt-1">
                  {new Date(session.createdAt).toLocaleDateString('pt-BR')}
                  {session.teams.length > 0 && (
                    <span className="ml-2">• {session.teams.join(', ')}</span>
                  )}
                </div>
              </button>
              
              <button
                onClick={() => deleteSession(session.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-600/20 rounded transition-all"
              >
                🗑️
              </button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}
```

### **3.3 Export e Compartilhamento**

#### **lib/export-utils.ts**
```typescript
export interface ExportOptions {
  format: 'pdf' | 'md' | 'txt' | 'json'
  includeMetadata: boolean
  includeTeamData: boolean
}

export class ChatExporter {
  static async exportChat(session: ChatSession, options: ExportOptions): Promise<Blob> {
    switch (options.format) {
      case 'md':
        return this.exportAsMarkdown(session, options)
      case 'txt':
        return this.exportAsText(session, options)
      case 'json':
        return this.exportAsJSON(session, options)
      case 'pdf':
        return this.exportAsPDF(session, options)
      default:
        throw new Error('Formato não suportado')
    }
  }
  
  private static exportAsMarkdown(session: ChatSession, options: ExportOptions): Blob {
    let content = `# ${session.title}\n\n`
    
    if (options.includeMetadata) {
      content += `**Data:** ${new Date(session.createdAt).toLocaleString('pt-BR')}\n`
      content += `**Times:** ${session.teams.join(', ')}\n`
      content += `**Total de mensagens:** ${session.messages.length}\n\n`
    }
    
    content += `---\n\n`
    
    session.messages.forEach((message, index) => {
      const role = message.role === 'user' ? '👤 Usuário' : '🤖 SportsGPT'
      content += `## ${role}\n\n${message.content}\n\n`
    })
    
    if (options.includeTeamData) {
      content += `---\n\n## Dados dos Times\n\n`
      // Adicionar dados dos times usados na conversa
    }
    
    return new Blob([content], { type: 'text/markdown' })
  }
  
  private static exportAsJSON(session: ChatSession, options: ExportOptions): Blob {
    const data = {
      ...session,
      exportedAt: new Date().toISOString(),
      options
    }
    
    return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  }
  
  static generateShareableLink(session: ChatSession): string {
    // Gerar link compartilhável (implementar com serviço de short URLs)
    const encodedData = btoa(JSON.stringify({
      title: session.title,
      messages: session.messages.slice(0, 10), // Limitar para evitar URLs muito grandes
      teams: session.teams
    }))
    
    return `${window.location.origin}/shared/${encodedData}`
  }
}
```

### **3.4 Comandos Rápidos e Atalhos**

#### **components/quick-actions.tsx**
```typescript
const QUICK_ACTIONS = [
  {
    id: 'analyze-next-games',
    label: 'Próximos Jogos',
    icon: '📅',
    action: (teams: string[]) => 
      teams.length > 0 
        ? `Analise os próximos jogos de ${teams.join(' e ')}`
        : 'Quais são os jogos mais importantes da próxima rodada?'
  },
  {
    id: 'best-bets',
    label: 'Melhores Apostas',
    icon: '💰',
    action: (teams: string[]) => 
      teams.length > 0
        ? `Quais as melhores apostas para os jogos de ${teams.join(' e ')}?`
        : 'Quais as melhores oportunidades de apostas para hoje?'
  },
  {
    id: 'team-stats',
    label: 'Estatísticas',
    icon: '📊',
    action: (teams: string[]) =>
      teams.length > 0
        ? `Mostre as estatísticas detalhadas de ${teams.join(' e ')}`
        : 'Quais times estão com melhor desempenho?'
  },
  {
    id: 'odds-analysis',
    label: 'Análise de Odds',
    icon: '🎯',
    action: (teams: string[]) =>
      'Analise as odds mais vantajosas disponíveis agora'
  }
]

export function QuickActions({ onAction }: { onAction: (message: string) => void }) {
  return (
    <div className="px-4 py-2 border-t border-white/10">
      <div className="flex space-x-2 overflow-x-auto">
        {QUICK_ACTIONS.map(action => (
          <button
            key={action.id}
            onClick={() => onAction(action.action([]))}
            className="flex items-center space-x-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg whitespace-nowrap transition-colors"
          >
            <span>{action.icon}</span>
            <span className="text-sm">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
```

## 📊 Métricas da Fase 3

### **KPIs de Sucesso**
- ✅ Streaming visual implementado
- ✅ Histórico de conversas funcional
- ✅ Export em múltiplos formatos
- ✅ Comandos rápidos utilizáveis
- ✅ Feedback do usuário coletado
- ✅ Performance de UX > 90% satisfação

### **Testes de UX**
- [ ] Fluidez do streaming de mensagens
- [ ] Persistência do histórico
- [ ] Funcionalidade de export
- [ ] Responsividade em mobile
- [ ] Acessibilidade (keyboard navigation)

## 🎯 Critérios de Conclusão

A Fase 3 está concluída quando:

1. ✅ **Interface de chat avançada** totalmente funcional
2. ✅ **Sistema de histórico** persistindo conversas
3. ✅ **Export e compartilhamento** implementados
4. ✅ **Comandos rápidos** funcionando
5. ✅ **Feedback do usuário** sendo coletado
6. ✅ **Performance de UX** otimizada

## 🚀 Próxima Fase

Após completar a Fase 3, avançar para [Fase 4: Otimização e Analytics](./fase-4-otimizacao-analytics.md), onde iremos:

- Implementar cache inteligente
- Adicionar analytics detalhados
- Otimizar performance e custos
- Implementar A/B testing
- Preparar para produção

