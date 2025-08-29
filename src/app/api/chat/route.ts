import { openai, SPORTS_SYSTEM_PROMPT } from '@/lib/openai'
import { validateMessages, validateTeams, validateRateLimit } from '@/lib/validation'

export async function POST(req: Request) {
  try {
    const { messages, teams = [] } = await req.json()
    
    // Validate input data
    const messagesValidation = validateMessages(messages)
    if (!messagesValidation.isValid) {
      console.warn('❌ Messages validation failed:', messagesValidation.error)
      return new Response(messagesValidation.error || 'Mensagens inválidas', { status: 400 })
    }

    const teamsValidation = validateTeams(teams)
    if (!teamsValidation.isValid) {
      console.warn('❌ Teams validation failed:', teamsValidation.error)
      return new Response(teamsValidation.error || 'Times inválidos', { status: 400 })
    }

    // Simple rate limiting check (could be enhanced with Redis/database)
    const userAgent = req.headers.get('user-agent') || 'unknown'
    console.log('🌐 Request from:', userAgent.substring(0, 100))
    
    // Construir contexto personalizado com times selecionados
    let systemPrompt = SPORTS_SYSTEM_PROMPT
    
    if (teams.length > 0) {
      systemPrompt += `\n\nTimes em foco nesta conversa: ${teams.join(', ')}\nContextualize suas respostas considerando especificamente estes times quando relevante.`
    }

    console.log('🤖 Iniciando chat com OpenAI...')
    console.log('Teams:', teams)
    console.log('Messages count:', messages.length)

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    console.log('✅ OpenAI response received, starting stream...')

    // Create a custom streaming response
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        console.log('🚀 Stream started')
        try {
          for await (const chunk of response) {
            const content = chunk.choices[0]?.delta?.content || ''
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }
          console.log('✅ Stream completed')
        } catch (error) {
          console.error('❌ Stream error:', error)
          controller.error(error)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
    
  } catch (error: any) {
    console.error('❌ Chat API Error:', error)
    
    // Tratamento específico de erros da OpenAI
    if (error.code === 'rate_limit_exceeded') {
      return new Response('Muitas requisições. Tente novamente em alguns segundos.', { 
        status: 429,
        headers: { 'Retry-After': '60' }
      })
    }
    
    if (error.code === 'insufficient_quota') {
      return new Response('Cota da API excedida. Tente novamente mais tarde.', { 
        status: 503 
      })
    }
    
    if (error.code === 'invalid_api_key') {
      return new Response('Erro de configuração da API', { status: 500 })
    }
    
    return new Response('Erro interno do servidor. Tente novamente.', { 
      status: 500 
    })
  }
}

