"use client"

import { useState, useRef, useEffect } from "react"
import { Send, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { ChatMessage } from "./chat-message"
import { isChatAllowed } from "@/lib/rate-limit"
import { validateChatMessage } from "@/lib/validation"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
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
  const [isFocused, setIsFocused] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasInitialized = useRef(false)
  const messageIdCounter = useRef(0)

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

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    // Validate message content
    const validation = validateChatMessage(content)
    if (!validation.isValid) {
      setError(`📝 ${validation.error}`)
      return
    }

    // Check rate limiting
    const rateLimitCheck = isChatAllowed()
    if (!rateLimitCheck.allowed) {
      setError(`⏱️ Limite de mensagens atingido. Tente novamente em ${rateLimitCheck.resetTime} segundos.`)
      return
    }

    // Use sanitized content
    const sanitizedContent = validation.sanitized || content.trim()

    const userMessage: Message = {
      id: generateUniqueId(),
      role: "user",
      content: sanitizedContent,
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)
    setError(null)

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: sanitizedContent }
          ],
          teams: selectedTeams || [],
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Erro de conexão'
        
        try {
          const errorText = await response.text()
          if (response.status === 429) {
            errorMessage = '⏱️ Muitas requisições. Tente novamente em alguns segundos.'
          } else if (response.status === 503) {
            errorMessage = '🚧 Serviço temporariamente indisponível. Tente novamente mais tarde.'
          } else if (response.status === 500) {
            errorMessage = '⚠️ Erro interno do servidor. Nossa equipe foi notificada.'
          } else if (response.status === 401) {
            errorMessage = '🔑 Erro de autenticação. Verifique a configuração da API.'
          } else {
            errorMessage = errorText || `Erro HTTP ${response.status}`
          }
        } catch {
          errorMessage = `Erro de rede (${response.status}). Verifique sua conexão.`
        }
        
        throw new Error(errorMessage)
      }

      if (!response.body) {
        throw new Error('🔌 Resposta vazia do servidor. Tente novamente.')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ""

      const assistantMessage: Message = {
        id: generateUniqueId(),
        role: "assistant",
        content: "",
      }

      setMessages(prev => [...prev, assistantMessage])

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          assistantContent += chunk

          setMessages(prev => prev.map(msg => 
            msg.id === assistantMessage.id 
              ? { ...msg, content: assistantContent }
              : msg
          ))
        }

        // Verificar se a resposta está vazia
        if (!assistantContent.trim()) {
          throw new Error('🤖 Resposta vazia da IA. Tente reformular sua pergunta.')
        }

      } catch (streamError) {
        console.error('Stream error:', streamError)
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessage.id))
        throw new Error('📡 Erro na transmissão de dados. Tente novamente.')
      }

    } catch (error) {
      console.error('Chat error:', error)
      let userFriendlyMessage = 'Erro desconhecido'
      
      if (error instanceof TypeError) {
        userFriendlyMessage = '🌐 Erro de rede. Verifique sua conexão com a internet.'
      } else if (error instanceof Error) {
        userFriendlyMessage = error.message
      }
      
      setError(userFriendlyMessage)
      
      // Remover a mensagem do usuário se houve erro
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    
    // Auto-resize textarea
    const textarea = e.target
    textarea.style.height = 'auto'
    textarea.style.height = Math.min(textarea.scrollHeight, 128) + 'px'
  }

  useEffect(() => {
    if (initialQuestion && !hasInitialized.current) {
      hasInitialized.current = true
      setInput(initialQuestion)
      // Enviar automaticamente a pergunta inicial
      setTimeout(() => {
        sendMessage(initialQuestion)
      }, 500)
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
          {messages.length === 0 && !isLoading && (
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
          
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
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

          {error && (
            <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl px-5 py-4 max-w-[85%] backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5">
                    <span className="text-red-400 text-sm">!</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm leading-relaxed">{error}</p>
                    <div className="flex gap-2 mt-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => {
                          setError(null)
                          if (messages.length > 0 && messages[messages.length - 1]?.role === 'user') {
                            // Tentar reenviar a última mensagem do usuário
                            const lastUserMessage = messages[messages.length - 1]
                            setMessages(prev => prev.slice(0, -1)) // Remove a última mensagem
                            setTimeout(() => sendMessage(lastUserMessage.content), 500)
                          }
                        }}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs h-7"
                        disabled={isLoading}
                      >
                        🔄 Tentar novamente
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setError(null)}
                        className="text-red-400/70 hover:text-red-300 text-xs h-7"
                      >
                        ✕ Fechar
                      </Button>
                    </div>
                  </div>
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
          <div className="chat-input-container">
            <div className="chat-input-wrapper">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Digite sua pergunta sobre apostas esportivas..."
                className={`chat-textarea ${isFocused ? 'focused' : ''}`}
                rows={1}
                disabled={isLoading}
              />
              {input && (
                <div className="char-counter">
                  {input.length}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className={`chat-send-button ${!input.trim() || isLoading ? 'disabled' : 'enabled'}`}
            >
              <Send size={20} strokeWidth={2} />
            </button>
          </div>
          {/* Desktop help text */}
          <div className="mt-2 text-xs text-white/50 text-center hidden sm:block">
            Pressione Enter para enviar • Shift + Enter para quebrar linha
          </div>
          {/* Mobile help text */}
          <div className="mt-2 text-xs text-white/50 text-center block sm:hidden">
            Toque no ícone para enviar sua mensagem
          </div>
        </div>
      </div>
    </div>
  )
}