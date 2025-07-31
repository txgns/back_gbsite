# 🛒 GBSite - Sistema de E-commerce Completo

## 🎯 **Funcionalidades Implementadas**

### ✅ **Sistema de Autenticação**
- ✅ **Registro de usuários** com validação completa
- ✅ **Login JWT** com persistência de sessão
- ✅ **Perfil de usuário** com avatar customizável
- ✅ **Dois tipos de usuário**: Admin e Consumidor

### ✅ **E-commerce Completo**
- ✅ **Loja de produtos** com filtros por categoria e preço
- ✅ **Sistema de carrinho** persistente por usuário
- ✅ **Checkout e pedidos** funcionais
- ✅ **Gestão de estoque** com controle de quantidade

### ✅ **Dashboard Administrativo**
- ✅ **Gestão de usuários** (criar, editar, excluir)
- ✅ **Gestão de produtos** (CRUD completo)
- ✅ **Gestão de pedidos** (status, histórico)
- ✅ **Controle de estoque** com movimentações

### ✅ **Interface de Usuário**
- ✅ **Design responsivo** com Tailwind CSS
- ✅ **Header dinâmico** com login/logout e avatar
- ✅ **Contador de carrinho** em tempo real
- ✅ **Menu de usuário** com todas as opções

## 🏗️ **Arquitetura Técnica**

### **Backend (FastAPI)**
- **Porta**: 8001
- **Banco de dados**: SQLite
- **Autenticação**: JWT
- **Documentação**: http://127.0.0.1:8001/docs

### **Frontend (React + Vite)**
- **Porta**: 3000
- **TypeScript**: Tipagem completa
- **Estado global**: Context API
- **UI**: Tailwind CSS + Radix UI

## 🚀 **Como Executar**

### **Método 1: Script Automático**
```bash
# Windows
start.bat

# Linux/Mac
./start.sh
```

### **Método 2: Manual**

**Backend:**
```bash
cd backend
pip install -r requirements.txt
python main.py
```

**Frontend:**
```bash
cd frontend
npm install  # ou yarn install
npm run dev  # ou yarn dev
```

## 🔑 **Credenciais de Acesso**

### **Administrador**
- **Email**: admin@gbsite.com
- **Senha**: admin123
- **Permissões**: Acesso total ao sistema

### **Usuário Regular**
- **Criar conta**: Via página de registro
- **Permissões**: Compras e perfil pessoal

## 🎨 **Funcionalidades do Header**

### **Usuário NÃO Logado**
- Botões de **Login** e **Registro**
- Menu de navegação básico

### **Usuário Logado**
- **Avatar/Foto** do usuário (personalizável)
- **Nome de usuário** visível
- **Contador do carrinho** com badge
- **Menu dropdown** com:
  - Meu Perfil
  - Meu Carrinho (com contador)
  - Meus Pedidos
  - Painel Admin (se for admin)
  - Sair

## 🛒 **Sistema de Carrinho**

### **Funcionalidades**
- ✅ **Adicionar produtos** da loja
- ✅ **Persistência por usuário** (não perde ao sair/entrar)
- ✅ **Contador em tempo real** no header
- ✅ **Atualizar quantidades**
- ✅ **Remover itens**
- ✅ **Limpar carrinho**

### **Integração**
- Carrinho salvo no **backend** por usuário
- **Sincronização automática** entre páginas
- **Carregamento** automático no login

## 📱 **URLs do Sistema**

### **Frontend**
- **Homepage**: http://localhost:3000
- **Loja**: http://localhost:3000/loja
- **Login**: http://localhost:3000/login
- **Registro**: http://localhost:3000/register
- **Carrinho**: http://localhost:3000/cart
- **Dashboard**: http://localhost:3000/dashboard
- **Admin**: http://localhost:3000/admin

### **Backend API**
- **Health**: http://127.0.0.1:8001/api/health
- **Docs**: http://127.0.0.1:8001/docs
- **Produtos**: http://127.0.0.1:8001/api/products/
- **Carrinho**: http://127.0.0.1:8001/api/cart/
- **Auth**: http://127.0.0.1:8001/api/auth/

## 🎯 **Produtos Pré-carregados**

1. **Arduino Uno R3** - R$ 89,90
2. **Kit Robótica Básico** - R$ 299,99
3. **Sensor Ultrassônico HC-SR04** - R$ 25,90
4. **Motor Servo SG90** - R$ 18,50
5. **LED RGB 5mm** - R$ 3,50

## 🔧 **Solução de Problemas**

### **Backend não inicia**
```bash
pip install email-validator
pip install python-jose[cryptography]
pip install passlib[bcrypt]
```

### **Frontend não conecta**
- Verificar se backend está na porta 8001
- Verificar logs do console do navegador
- Testar: `curl http://127.0.0.1:8001/api/health`

### **Carrinho não funciona**
- Fazer login primeiro
- Verificar console do navegador (F12)
- Testar API diretamente: `/api/cart/`

## 📋 **Status Atual**

### ✅ **100% Funcionais**
- Sistema de autenticação
- Registro e login
- Carrinho de compras
- Gestão de produtos
- Dashboard admin
- Interface responsiva
- Header com avatar

### 🎉 **Projeto CONCLUÍDO**
Todas as funcionalidades solicitadas foram implementadas e testadas com sucesso!

---

**Desenvolvido com ❤️ usando FastAPI + React**