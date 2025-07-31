#!/bin/bash

echo "🚀 Iniciando GBSite..."

# Função para verificar se uma porta está em uso
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        echo "⚠️  Porta $1 já está em uso"
        return 0
    else
        return 1  
    fi
}

# Verificar e parar processos existentes
echo "🧹 Limpando processos existentes..."
pkill -f "python.*server.py" 2>/dev/null || true
pkill -f "vite" 2>/dev/null || true

# Aguardar um momento
sleep 2

# Iniciar Backend
echo "🔧 Iniciando Backend (Flask)..."
cd /app/backend

# Verificar se as dependências estão instaladas
if [ ! -f "server.py" ]; then
    echo "❌ Arquivo server.py não encontrado!"
    exit 1
fi

# Instalar dependências se necessário
pip install -q -r requirements.txt 2>/dev/null || echo "Dependências já instaladas"

# Iniciar backend em background
python server.py &
BACKEND_PID=$!

echo "⏳ Aguardando backend inicializar..."
sleep 5

# Testar se backend está respondendo
if curl -s http://127.0.0.1:8001/api/health > /dev/null 2>&1; then
    echo "✅ Backend rodando na porta 8001"
else
    echo "❌ Backend não está respondendo"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Iniciar Frontend
echo "🎨 Iniciando Frontend (React + Vite)..."
cd /app/frontend

# Verificar se as dependências estão instaladas  
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências do frontend..."
    yarn install
fi

# Iniciar frontend
echo "🌐 Frontend será executado em: http://localhost:3000"
echo "🔑 Login Admin: admin@gbsite.com / admin123"
echo ""
echo "Para parar os serviços, pressione Ctrl+C"

yarn dev

# Cleanup ao sair
trap 'echo "🛑 Parando serviços..."; kill $BACKEND_PID 2>/dev/null || true; exit' INT TERM

wait