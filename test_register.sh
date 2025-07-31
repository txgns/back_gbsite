#!/bin/bash
echo "🧪 Testando sistema de registro..."

echo "1. Testando health check:"
curl -s http://127.0.0.1:8001/api/health

echo -e "\n\n2. Testando registro de novo usuário:"
curl -X POST http://127.0.0.1:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com", 
    "password": "test123456",
    "role": "consumer"
  }' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n\n3. Testando login com usuário criado:"
curl -X POST http://127.0.0.1:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }' \
  -w "\nStatus: %{http_code}\n"

echo -e "\n✅ Teste concluído!"