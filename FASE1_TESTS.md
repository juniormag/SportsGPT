# ✅ Testes da Fase 1 - Fundação API

## 📋 Checklist de Testes Funcionais

### **1. Setup e Configuração**
- [ ] ✅ Arquivo `.env.local` configurado com `OPENAI_API_KEY`
- [ ] ✅ Servidor Next.js inicia sem erros (`npm run dev`)
- [ ] ✅ API route `/api/chat` responde (verificar no browser: http://localhost:3000/api/chat)
- [ ] ✅ Console não mostra erros de importação ou configuração

### **2. Interface de Chat Básica**
- [ ] ✅ Chat interface renderiza corretamente
- [ ] ✅ Input de mensagem funciona
- [ ] ✅ Botão de envio funciona
- [ ] ✅ Enter envia mensagem
- [ ] ✅ Shift + Enter quebra linha
- [ ] ✅ Auto-resize do textarea funciona
- [ ] ✅ Loading state é exibido durante processamento

### **3. Integração com OpenAI API**
- [ ] ✅ Mensagens são enviadas para a API
- [ ] ✅ Respostas da IA são recebidas
- [ ] ✅ Streaming de respostas funciona
- [ ] ✅ Contexto da conversa é mantido
- [ ] ✅ System prompt é aplicado corretamente
- [ ] ✅ Contexto dos times selecionados é passado

### **4. Tratamento de Erros**
- [ ] ✅ API Key inválida mostra erro apropriado
- [ ] ✅ Rate limiting da OpenAI é tratado (429)
- [ ] ✅ Timeouts de rede são tratados
- [ ] ✅ Erros de servidor são tratados (500)
- [ ] ✅ Respostas vazias são detectadas
- [ ] ✅ Botão "Tentar novamente" funciona
- [ ] ✅ Mensagens de erro são user-friendly

### **5. Rate Limiting e Segurança**
- [ ] ✅ Rate limiting frontend funciona (10 msgs/min)
- [ ] ✅ Validação de entrada bloqueia scripts
- [ ] ✅ Sanitização de conteúdo funciona
- [ ] ✅ Validação de teams funciona
- [ ] ✅ Mensagens muito longas são rejeitadas
- [ ] ✅ Spam é detectado e bloqueado

### **6. Seleção de Times**
- [ ] ✅ Times selecionados aparecem no header
- [ ] ✅ Logo do time é exibido (quando 1 time)
- [ ] ✅ Contador de times é mostrado (quando múltiplos)
- [ ] ✅ Context dos times é passado para API
- [ ] ✅ Respostas consideram os times selecionados

### **7. UX e Interface**
- [ ] ✅ Transições e animações funcionam
- [ ] ✅ Scroll automático para novas mensagens
- [ ] ✅ Botão de copiar mensagens funciona
- [ ] ✅ Timestamps são exibidos
- [ ] ✅ Loading state é intuitivo
- [ ] ✅ Estados vazios são informativos
- [ ] ✅ Responsividade funciona (mobile/desktop)

### **8. Performance**
- [ ] ✅ Tempo de resposta < 3s (primeira mensagem)
- [ ] ✅ Streaming funciona suavemente
- [ ] ✅ Interface não trava durante carregamento
- [ ] ✅ Memory leaks são prevenidos (rate limiter cleanup)

### **9. Navegação**
- [ ] ✅ Botão voltar funciona
- [ ] ✅ Estado é resetado ao voltar
- [ ] ✅ Pergunta inicial é processada automaticamente

## 🧪 Testes Manuais Sugeridos

### **Teste 1: Chat Básico**
```
1. Selecionar um time (ex: Corinthians)
2. Digite: "Quais são as melhores oportunidades de aposta?"
3. Enviar mensagem
4. Verificar se resposta menciona o Corinthians
5. Continuar conversa com: "E para próximos jogos?"
```

### **Teste 2: Múltiplos Times**
```
1. Selecionar 2-3 times
2. Digite: "Compare as chances dos meus times"
3. Verificar se resposta aborda todos os times
```

### **Teste 3: Tratamento de Erros**
```
1. Configurar OPENAI_API_KEY inválida
2. Tentar enviar mensagem
3. Verificar mensagem de erro user-friendly
4. Testar botão "Tentar novamente"
```

### **Teste 4: Rate Limiting**
```
1. Enviar 11 mensagens rapidamente
2. Verificar se 11ª é bloqueada
3. Aguardar reset e tentar novamente
```

### **Teste 5: Validação de Entrada**
```
1. Tentar enviar: "<script>alert('test')</script>"
2. Verificar se é bloqueado
3. Tentar mensagem muito longa (>2000 chars)
4. Verificar se é rejeitada
```

### **Teste 6: Edge Cases**
```
1. Mensagem vazia (apenas espaços)
2. Emojis e caracteres especiais
3. Conexão lenta/offline
4. Múltiplas abas abertas
5. Refresh durante conversa
```

## 📊 Métricas de Sucesso

### **Performance**
- ⚡ Tempo de primeira resposta: < 3s
- 📡 Streaming funcional: Sem delays perceptíveis
- 💾 Uso de memória: Estável durante uso prolongado

### **Confiabilidade**
- 🛡️ Zero vazamentos de API key
- 🔐 Validação bloqueia 100% dos scripts maliciosos
- ⏱️ Rate limiting funciona consistentemente

### **UX**
- 😊 Mensagens de erro são claras e acionáveis
- 🎯 Resposta considera contexto dos times em 90%+ dos casos
- 📱 Interface funciona bem em mobile e desktop

## ✅ Critérios de Conclusão da Fase 1

A Fase 1 está **COMPLETA** quando:

1. ✅ **Todos os testes acima passam**
2. ✅ **Chat end-to-end funciona com OpenAI real**
3. ✅ **Tratamento de erros é robusto**
4. ✅ **Segurança básica está implementada**
5. ✅ **Performance atende os critérios**
6. ✅ **Documentação está atualizada**

## 🚀 Próximo Passo

Após completar todos os testes, avançar para **Fase 2: Contexto Esportivo**
