#!/bin/bash

# Script para gerenciar o servidor de desenvolvimento
# Limpa processos antigos e informa a porta correta

echo "🔧 Limpando processos antigos nas portas 3000-3002..."
lsof -ti:3000,3001,3002 | xargs kill -9 2>/dev/null || true
sleep 1

echo "✅ Portas limpas!"
echo ""

# Verifica qual porta será usada
PORT=3000
if lsof -i:$PORT >/dev/null 2>&1; then
    PORT=3001
    if lsof -i:$PORT >/dev/null 2>&1; then
        PORT=3002
    fi
fi

echo "🚀 Iniciando servidor na porta $PORT..."
echo "📍 URL para teste: http://localhost:$PORT"
echo "====================================="
echo ""

# Inicia o servidor
npm run dev
