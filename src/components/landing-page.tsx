"use client"

import { useState, useEffect } from "react"
import { ChevronRight } from "lucide-react"
import { TeamLogo } from "@/components/team-logos"

interface Team {
  id: string
  name: string
}

interface QuestionCard {
  id: string
  question: string
}

const teams: Team[] = [
  { id: "corinthians", name: "Corinthians" },
  { id: "flamengo", name: "Flamengo" },
  { id: "sao-paulo", name: "São Paulo" },
  { id: "santos", name: "Santos" },
  { id: "palmeiras", name: "Palmeiras" },
  { id: "atletico-mg", name: "Atlético-MG" },
  { id: "bragantino", name: "Bragantino" },
  { id: "botafogo", name: "Botafogo" },
  { id: "vitoria", name: "Vitória" },
  { id: "vasco", name: "Vasco" },
  { id: "sport", name: "Sport" },
  { id: "fluminense", name: "Fluminense" },
  { id: "gremio", name: "Grêmio" },
  { id: "cruzeiro", name: "Cruzeiro" },
]

// Função para gerar pergunta personalizada por time
const getTeamSpecificQuestion = (teamName: string): string => {
  return `Quais são as melhores oportunidades de apostas para os próximos jogos do ${teamName}? Analise o desempenho recente, estatísticas e odds mais vantajosas.`
}

const questionCards: QuestionCard[] = [
  {
    id: "sao-paulo-market",
    question: "Qual melhor mercado para apostar nos próximos jogos do São Paulo?"
  },
  {
    id: "depay-goal",
    question: "Qual a probabilidade do Depay fazer um gol no próximo jogo?"
  },
  {
    id: "betbuilder",
    question: "Qual a melhor aposta para o campeonato brasileiro?"
  }
]

const inputSuggestions = [
  "Analise as odds dos próximos jogos do Brasileirão",
  "Qual time tem melhor desempenho jogando em casa?",
  "Estatísticas de gols dos últimos 5 jogos",
  "Melhores mercados para apostar no final de semana",
  "Como está o retrospecto entre esses times?",
  "Quais jogadores estão em boa fase de gols?",
  "Análise de over/under para os próximos jogos",
  "Previsões para os próximos confrontos importantes"
]

interface LandingPageProps {
  onSendMessage: (message: string, selectedTeams: string[]) => void
}

export function LandingPage({ onSendMessage }: LandingPageProps) {
  const [selectedTeams, setSelectedTeams] = useState<string[]>([])
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0)
  const [teamsPerView, setTeamsPerView] = useState(7)
  const [inputQuestion, setInputQuestion] = useState("")
  const [isInputFocused, setIsInputFocused] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [inputRef, setInputRef] = useState<HTMLTextAreaElement | null>(null)
  const [hasSelectedSuggestion, setHasSelectedSuggestion] = useState(false)
  const [isSelectingSuggestion, setIsSelectingSuggestion] = useState(false)
  const [processingCards, setProcessingCards] = useState<Set<string>>(new Set())
  
  const defaultPlaceholder = "Quais as melhores oportunidades para a próxima semana?"
  
  // Determinar pergunta a ser enviada (input do usuário ou placeholder padrão)
  const questionToSend = inputQuestion.trim() || defaultPlaceholder
  const isButtonDisabled = !questionToSend
  


  const handleTeamSelect = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    )
  }

  const handleTeamClick = (teamId: string) => {
    const team = teams.find(t => t.id === teamId)
    if (team) {
      const question = getTeamSpecificQuestion(team.name)
      onSendMessage(question, [teamId])
    }
  }

  const handleScrollRight = () => {
    setCurrentTeamIndex(prev => 
      Math.min(teams.length - teamsPerView, prev + 1)
    )
  }

  const handleSubmit = () => {
    if (questionToSend) {
      onSendMessage(questionToSend, selectedTeams)
    }
  }

  const handleInputFocus = () => {
    setIsInputFocused(true)
    setShowSuggestions(true)
    
    // Manter o texto atual, mas permitir edição
    // Se for o texto padrão, permitir que seja substituído
  }

  const handleInputBlur = () => {
    // Se estamos selecionando uma sugestão, não processar o blur
    if (isSelectingSuggestion) {
      return
    }
    
    setIsInputFocused(false)
    
    // Delay para permitir clique nas sugestões
    setTimeout(() => {
      setShowSuggestions(false)
      
      // Só restaurar placeholder se realmente vazio E não foi selecionado
      if (!inputQuestion.trim() && !hasSelectedSuggestion) {
        setInputQuestion(defaultPlaceholder)
        setHasSelectedSuggestion(false)
      }
    }, 200)
  }

  const handleSuggestionSelect = (suggestion: string) => {
    // Imediatamente bloquear qualquer blur
    setIsSelectingSuggestion(true)
    
    // Aplicar todos os estados de uma vez usando batch
    setInputQuestion(suggestion)
    setHasSelectedSuggestion(true)
    setShowSuggestions(false)
    setIsInputFocused(false)
    
    // Usar requestAnimationFrame para garantir que React processou os states
    requestAnimationFrame(() => {
      inputRef?.blur()
      
      // Liberar flag após um ciclo
      requestAnimationFrame(() => {
        setIsSelectingSuggestion(false)
      })
    })
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInputQuestion(value)
    
    // Reset suggestion state quando usuário digita
    if (hasSelectedSuggestion) {
      setHasSelectedSuggestion(false)
    }
  }

  // Adjust teams per view based on screen size
  const getTeamsPerView = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth >= 1024) return 7
      if (window.innerWidth >= 768) return 5
      return 3
    }
    return 7
  }

  useEffect(() => {
    const handleResize = () => {
      setTeamsPerView(getTeamsPerView())
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="content-stretch flex flex-col items-start justify-start relative size-full">
      <div className="bg-[#000000] box-border content-stretch flex flex-col h-[1024px] items-center justify-between overflow-clip pb-10 pt-20 px-10 relative shrink-0 w-full">
        <div className="content-stretch flex flex-col gap-12 items-center justify-start relative shrink-0 w-full">
          <div className="text-title-figma text-center w-full">
            <p className="text-[200px]">SportsGPT</p>
          </div>
          <div className={`flex flex-wrap items-center justify-start max-w-[53.125rem] rounded-3xl w-full relative sports-gpt-container ${isInputFocused ? 'input-focused' : ''}`}>
            <div aria-hidden="true" className="absolute border-figma inset-0 pointer-events-none rounded-3xl" />
            <div className="flex-1 flex flex-col gap-8 relative">
              <div className="text-question-figma w-full relative">

                
                <textarea
                  ref={setInputRef}
                  value={inputQuestion}
                  onChange={handleInputChange}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className={`
                    w-full bg-transparent border-none outline-none resize-none overflow-hidden
                    text-white placeholder:text-white/60 text-[26px] font-normal tracking-[-0.32px]
                    transition-all duration-300 ease-out
                    ${isInputFocused ? 'input-focused' : ''}
                    ${hasSelectedSuggestion ? 'text-from-suggestion' : ''}
                  `}
                  rows={2}
                  placeholder={defaultPlaceholder}
                />
                
                {/* Sugestões animadas */}
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-50">
                    <div className="suggestion-container bg-black/30 backdrop-blur-lg border border-white/10 rounded-2xl p-3 space-y-1">
                      {inputSuggestions
                        .filter(suggestion => suggestion !== inputQuestion)
                        .slice(0, 3)
                        .map((suggestion, index) => (
                          <button
                            key={`suggestion-${suggestion.replace(/[^a-zA-Z0-9]/g, '')}-${index}`}
                            onMouseDown={(e) => {
                              e.preventDefault()
                              
                              // Prevenir cliques duplos para esta sugestão específica
                              const suggestionId = `suggestion-${suggestion.replace(/[^a-zA-Z0-9]/g, '')}-${index}`
                              if (processingCards.has(suggestionId)) return
                              
                              // Adicionar sugestão ao set de processamento
                              setProcessingCards(prev => new Set(prev).add(suggestionId))
                              handleSuggestionSelect(suggestion)
                              
                              // Reset após delay
                              setTimeout(() => {
                                setProcessingCards(prev => {
                                  const newSet = new Set(prev)
                                  newSet.delete(suggestionId)
                                  return newSet
                                })
                              }, 1000)
                            }}
                            className="suggestion-btn w-full text-left p-3 rounded-xl"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            {suggestion}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="content-stretch flex gap-[19px] items-center justify-start relative shrink-0 w-full">
                <div className="basis-0 grow h-[70.722px] min-h-px min-w-px overflow-clip relative shrink-0">
                  <div 
                    className="absolute content-stretch flex gap-4 items-center justify-start left-0 top-0 transition-transform duration-500 ease-out" 
                    style={{ transform: `translateX(-${currentTeamIndex * (70.575 + 16)}px)` }}
                  >
                    {teams.map((team) => (
                      <TeamLogo
                        key={team.id}
                        teamId={team.id}
                        isSelected={selectedTeams.includes(team.id)}
                        onClick={() => handleTeamClick(team.id)}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-center relative shrink-0">
                  <div className="bg-[#ffffff] box-border content-stretch flex gap-2.5 items-center justify-center p-[8px] relative rounded-xl">
                    <button
                      onClick={handleScrollRight}
                      disabled={currentTeamIndex >= teams.length - teamsPerView}
                      className="scroll-button flex items-center justify-center relative shrink-0 size-6 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="chevron-icon h-4 w-4 text-black" />
                    </button>
                  </div>
                </div>
                <div className="bg-[#ffffff] box-border content-stretch flex h-[41px] items-center justify-center px-3 py-2 relative rounded-3xl shrink-0 w-[105px] send-button">
                  <button
                    onClick={handleSubmit}
                    disabled={isButtonDisabled}
                    className="text-button-figma disabled:opacity-50 disabled:cursor-not-allowed w-full h-full"
                  >
                    <p className="leading-[16px] whitespace-pre">Enviar</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="content-stretch flex gap-[24px] items-center justify-start relative shrink-0 w-full">
          {questionCards.map((card) => (
            <div
              key={card.id}
              onMouseDown={(e) => {
                e.preventDefault()
                
                // Prevenir cliques duplos para este card específico
                if (processingCards.has(card.id)) return
                
                // Adicionar card ao set de processamento
                setProcessingCards(prev => new Set(prev).add(card.id))
                onSendMessage(card.question, selectedTeams)
                
                // Reset após delay
                setTimeout(() => {
                  setProcessingCards(prev => {
                    const newSet = new Set(prev)
                    newSet.delete(card.id)
                    return newSet
                  })
                }, 1000)
              }}
              className="flex-1 rounded-3xl relative cursor-pointer text-left question-card"
              style={{ 
                height: '10.5625rem', /* 169px - altura fixa do card */
                minHeight: '10.5625rem',
                padding: '2rem 1.5rem',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.16)',
                background: 'transparent',
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'flex-start'
              }}
            >
              <p className="text-question-figma leading-[normal] w-full text-left">
                {card.question}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
