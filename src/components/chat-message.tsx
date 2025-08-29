import { useState } from "react"
import { Copy, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

interface ChatMessageProps {
  message: Message
}

export function ChatMessage({ message }: ChatMessageProps) {
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const isUser = message.role === 'user'

  const copyToClipboard = async (text: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedMessageId(messageId)
      setTimeout(() => setCopiedMessageId(null), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-500 ease-out`}>
      <div
        className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-5 py-4 relative transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) ${
          isUser
            ? 'bg-gradient-to-br from-white to-white/95 text-black shadow-lg hover:shadow-xl hover:scale-[1.02] border border-white/20'
            : 'bg-gradient-to-br from-white/8 to-white/4 text-white backdrop-blur-sm border border-white/5 hover:from-white/10 hover:to-white/6 hover:border-white/10 hover:shadow-lg'
        }`}
        style={{
          boxShadow: isUser 
            ? '0 8px 32px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            : '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.02)'
        }}
      >
        <div className="whitespace-pre-wrap leading-relaxed text-[15px] font-normal">
          {message.content}
        </div>
        <div className="flex items-center justify-between mt-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className={`text-xs font-medium tracking-wide ${
            isUser ? 'text-black/50' : 'text-white/50'
          }`}>
            {new Date().toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
          {!isUser && (
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
  )
}
