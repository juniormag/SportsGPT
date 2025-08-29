/**
 * Input Validation Utilities
 * Prevent malicious inputs and ensure data quality
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
  sanitized?: string
}

/**
 * Validate and sanitize chat message content
 */
export function validateChatMessage(content: string): ValidationResult {
  // Check if content exists
  if (!content || typeof content !== 'string') {
    return {
      isValid: false,
      error: 'Mensagem é obrigatória'
    }
  }

  // Remove excessive whitespace
  const trimmed = content.trim()
  
  // Check minimum length
  if (trimmed.length < 1) {
    return {
      isValid: false,
      error: 'Mensagem não pode estar vazia'
    }
  }

  // Check maximum length
  if (trimmed.length > 2000) {
    return {
      isValid: false,
      error: 'Mensagem muito longa (máximo 2000 caracteres)'
    }
  }

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /data:\s*text\/html/gi, // Data URLs with HTML
    /vbscript:/gi, // VBScript protocol
    /<iframe\b[^>]*>/gi, // iframes
    /<object\b[^>]*>/gi, // Objects
    /<embed\b[^>]*>/gi, // Embeds
  ]

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Conteúdo contém elementos não permitidos'
      }
    }
  }

  // Check for spam patterns
  const spamPatterns = [
    /(.)\1{10,}/g, // Too many repeated characters
    /https?:\/\/[^\s]+\.(tk|ml|ga|cf|click|download|exe)/gi, // Suspicious URLs
    /\b(CLIQUE|CLICK|BUY|COMPRE|GRATIS|FREE)\b.*\b(AGORA|NOW|AQUI|HERE)\b/gi, // Spam keywords
  ]

  for (const pattern of spamPatterns) {
    if (pattern.test(trimmed)) {
      return {
        isValid: false,
        error: 'Mensagem parece ser spam'
      }
    }
  }

  // Basic sanitization (remove potential HTML/script)
  const sanitized = trimmed
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&(?!(amp|lt|gt|quot|#39);)/g, '&amp;') // Escape unencoded ampersands
    .trim()

  return {
    isValid: true,
    sanitized
  }
}

/**
 * Validate team selection array
 */
export function validateTeams(teams: unknown): ValidationResult {
  if (!Array.isArray(teams)) {
    return {
      isValid: false,
      error: 'Times deve ser uma lista'
    }
  }

  if (teams.length > 10) {
    return {
      isValid: false,
      error: 'Máximo de 10 times permitidos'
    }
  }

  // Validate each team
  const validTeams = [
    'corinthians', 'flamengo', 'sao-paulo', 'santos', 'palmeiras',
    'atletico-mg', 'bragantino', 'botafogo', 'vitoria', 'vasco',
    'sport', 'fluminense', 'gremio', 'cruzeiro'
  ]

  for (const team of teams) {
    if (typeof team !== 'string' || !validTeams.includes(team)) {
      return {
        isValid: false,
        error: `Time inválido: ${team}`
      }
    }
  }

  return {
    isValid: true,
    sanitized: teams as string[]
  }
}

/**
 * Validate messages array for API calls
 */
export function validateMessages(messages: unknown): ValidationResult {
  if (!Array.isArray(messages)) {
    return {
      isValid: false,
      error: 'Mensagens deve ser uma lista'
    }
  }

  if (messages.length === 0) {
    return {
      isValid: false,
      error: 'Pelo menos uma mensagem é obrigatória'
    }
  }

  if (messages.length > 100) {
    return {
      isValid: false,
      error: 'Muitas mensagens na conversa'
    }
  }

  // Validate each message
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i]
    
    if (!msg || typeof msg !== 'object') {
      return {
        isValid: false,
        error: `Mensagem ${i + 1} inválida`
      }
    }

    const { role, content } = msg as any

    if (!['user', 'assistant', 'system'].includes(role)) {
      return {
        isValid: false,
        error: `Papel da mensagem ${i + 1} inválido: ${role}`
      }
    }

    const contentValidation = validateChatMessage(content)
    if (!contentValidation.isValid) {
      return {
        isValid: false,
        error: `Mensagem ${i + 1}: ${contentValidation.error}`
      }
    }
  }

  return {
    isValid: true,
    sanitized: messages
  }
}

/**
 * Rate limiting validation (server-side backup)
 */
export function validateRateLimit(lastRequestTime?: number, minInterval = 2000): ValidationResult {
  if (!lastRequestTime) {
    return { isValid: true }
  }

  const timeSinceLastRequest = Date.now() - lastRequestTime
  
  if (timeSinceLastRequest < minInterval) {
    const waitTime = Math.ceil((minInterval - timeSinceLastRequest) / 1000)
    return {
      isValid: false,
      error: `Aguarde ${waitTime} segundos antes de enviar outra mensagem`
    }
  }

  return { isValid: true }
}
