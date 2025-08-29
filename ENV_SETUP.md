# 🔧 Configuração de Variáveis de Ambiente

## Arquivo .env.local

Crie um arquivo `.env.local` na raiz do projeto com o seguinte conteúdo:

```env
# 🔑 OpenAI API Configuration
# Obtenha sua chave em: https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-your-openai-key-here

# 🌐 Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Instruções de Setup

1. **Obter API Key da OpenAI:**
   - Acesse [OpenAI Platform](https://platform.openai.com/api-keys)
   - Faça login ou crie uma conta
   - Clique em "Create new secret key"
   - Copie a chave gerada

2. **Configurar Arquivo:**
   ```bash
   # Na raiz do projeto
   cp ENV_SETUP.md .env.local
   # Edite o arquivo e substitua os valores
   ```

3. **Verificar Configuração:**
   ```bash
   npm run dev
   # Verificar se não há erros de API Key no console
   ```

## ⚠️ Segurança

- ✅ `.env.local` está no `.gitignore`
- ✅ Nunca commite chaves de API
- ✅ Use variáveis de ambiente diferentes para produção
- ✅ Monitore uso da API para evitar custos excessivos

## 🛠️ Troubleshooting

- **Erro "OPENAI_API_KEY is required"**: Verifique se o arquivo .env.local existe e contém a chave
- **Erro 401 Unauthorized**: Verifique se a API key está correta
- **Erro 429 Rate Limited**: Aguarde alguns segundos e tente novamente
