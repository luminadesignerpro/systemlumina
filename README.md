# 🚀 SystemLumina - CRM + Social Media IA Platform

![SystemLumina](https://img.shields.io/badge/SystemLumina-v2.0-blue)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-2.0-3ECF8E?logo=supabase)

**SystemLumina** é uma plataforma completa de CRM e gerenciamento de redes sociais com inteligência artificial integrada. Gerencie conversas multi-canal (WhatsApp, Instagram, Messenger), automatize publicações em redes sociais e potencialize seu atendimento com IA.

---

## ✨ Funcionalidades Principais

### 📱 **Mensageria Unificada**
- ✅ WhatsApp Business API integrado
- ✅ Instagram Direct Messages
- ✅ Facebook Messenger
- ✅ Interface única para todos os canais
- ✅ Respostas em tempo real
- ✅ Status de leitura e entrega
- ✅ Suporte a mídia (imagens, vídeos, documentos)

### 📊 **CRM Completo**
- Gestão de leads com pipeline visual
- Filtros avançados por canal, status e tags
- Exportação de dados
- Analytics e métricas
- Atribuição de leads para equipe

### 🤖 **Automação & IA**
- Agentes de IA para atendimento
- Chatbots configuráveis
- Respostas automáticas
- Geração de conteúdo com IA
- Fluxos de automação personalizados

### 📲 **Social Media Management**
- Agendamento de posts (Instagram, Facebook)
- Criação de conteúdo com IA
- Calendário visual de publicações
- Analytics de desempenho
- Suporte a Stories e Reels

### 📧 **Email Marketing**
- Campanhas de e-mail
- Templates personalizáveis
- Segmentação de público

---

## 🏗️ Arquitetura Técnica

### **Frontend**
- **React 18.3** + **TypeScript**
- **Vite** - Build tool moderno
- **TailwindCSS** + **Radix UI** - Design system
- **React Router v6** - Roteamento
- **TanStack Query (React Query)** - Estado e cache
- **Framer Motion** - Animações
- **Shadcn/ui** - Componentes UI

### **Backend**
- **Supabase** - BaaS (Backend as a Service)
  - PostgreSQL database
  - Row Level Security (RLS)
  - Edge Functions (Deno)
  - Realtime subscriptions
  - Authentication
  - Storage

### **Integrações**
- **Meta Business API** (WhatsApp, Instagram, Facebook)
- **OpenAI API** (Geração de conteúdo com IA)
- **Webhooks** para recebimento de mensagens

---

## 📦 Instalação e Setup

### **Pré-requisitos**
- Node.js 18+ ou Bun
- Conta Supabase (gratuita)
- Conta Meta Business (para WhatsApp/Instagram)

### **1. Clone o Repositório**
```bash
git clone https://github.com/luminadesignerpro/systemlumina.git
cd systemlumina
```

### **2. Instale as Dependências**
```bash
# Com npm
npm install

# Com yarn
yarn install

# Com bun (recomendado)
bun install
```

### **3. Configure as Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase
VITE_SUPABASE_URL=https://seu-project-id.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key
VITE_SUPABASE_PROJECT_ID=seu-project-id

# Meta Business (WhatsApp + Instagram)
META_APP_ID=seu-meta-app-id
META_APP_SECRET=seu-meta-app-secret

# WhatsApp
WHATSAPP_WEBHOOK_VERIFY_TOKEN=systemlumina_verify_token_2026

# OpenAI (opcional - para geração de conteúdo)
OPENAI_API_KEY=sua-openai-key
```

### **4. Configure o Supabase**

#### **4.1. Crie um Projeto no Supabase**
1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL e a chave pública (anon key)

#### **4.2. Execute as Migrations**
```bash
# Instale o Supabase CLI
npm install -g supabase

# Faça login
supabase login

# Link com seu projeto
supabase link --project-ref seu-project-id

# Execute as migrations
supabase db push
```

Ou execute manualmente os arquivos SQL em `/supabase/migrations/` no SQL Editor do Supabase.

#### **4.3. Configure as Edge Functions**

```bash
# Deploy das functions
supabase functions deploy instagram-auth
supabase functions deploy whatsapp-webhook
supabase functions deploy whatsapp-send
supabase functions deploy generate-content
supabase functions deploy publish-post
supabase functions deploy check-scheduled
```

Configure os secrets:
```bash
supabase secrets set META_APP_ID=seu-app-id
supabase secrets set META_APP_SECRET=seu-app-secret
supabase secrets set WHATSAPP_WEBHOOK_VERIFY_TOKEN=systemlumina_verify_token_2026
supabase secrets set OPENAI_API_KEY=sua-openai-key
```

### **5. Inicie o Servidor de Desenvolvimento**
```bash
npm run dev
# ou
yarn dev
# ou
bun dev
```

Acesse `http://localhost:5173`

---

## 🔌 Configuração de Integrações

### **WhatsApp Business API**

#### **Passo 1: Criar App no Meta Business**
1. Acesse [Meta for Developers](https://developers.facebook.com/apps)
2. Crie um novo app (tipo: Business)
3. Adicione o produto "WhatsApp"
4. Acesse **WhatsApp > API Setup**

#### **Passo 2: Obter Credenciais**
- **Phone Number ID**: Na seção "Phone Numbers"
- **Access Token**: Gere um token permanente em "Access Tokens"
- **Business Account ID**: Visível na URL ou na seção "Settings"

#### **Passo 3: Configurar Webhook**
1. Acesse **WhatsApp > Configuration > Webhooks**
2. Configure:
   - **Callback URL**: `https://seu-projeto.supabase.co/functions/v1/whatsapp-webhook`
   - **Verify Token**: `systemlumina_verify_token_2026`
3. Inscreva-se nos eventos: `messages`, `message_status`

#### **Passo 4: Conectar no SystemLumina**
1. Faça login no SystemLumina
2. Vá em **Configurações > WhatsApp**
3. Cole o **Phone Number ID** e **Access Token**
4. Clique em **Conectar**

---

### **Instagram Business API**

#### **Passo 1: Requisitos**
- Conta Instagram convertida para Business ou Creator
- Página do Facebook vinculada à conta Instagram
- App Meta configurado (mesmo do WhatsApp)

#### **Passo 2: Configurar no Meta**
1. No mesmo app Meta, adicione o produto "Instagram"
2. Configure permissões:
   - `instagram_basic`
   - `instagram_content_publish`
   - `instagram_manage_insights`
   - `pages_show_list`
   - `pages_read_engagement`

#### **Passo 3: Conectar no SystemLumina**
1. Vá em **Configurações > Instagram**
2. Clique em **Conectar com Instagram**
3. Autorize o acesso
4. Selecione a página do Facebook vinculada

---

## 📊 Estrutura do Banco de Dados

### **Principais Tabelas**

#### **conversations**
Armazena todas as conversas multi-canal
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- contact_name (text)
- contact_identifier (text) -- telefone, instagram_id, etc
- channel (text) -- whatsapp, instagram, messenger
- status (text) -- open, pending, resolved, closed
- last_message_at (timestamptz)
- tags (text[])
```

#### **messages**
Mensagens de todas as conversas
```sql
- id (uuid, PK)
- conversation_id (uuid, FK)
- content (text)
- direction (text) -- incoming, outgoing
- message_type (text) -- text, image, video, audio
- status (text) -- sent, delivered, read, failed
- created_at (timestamptz)
```

#### **whatsapp_connections**
Conexões do WhatsApp Business
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- phone_number_id (text)
- access_token (text)
- is_active (boolean)
```

#### **instagram_connections**
Conexões do Instagram
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- instagram_user_id (text)
- instagram_username (text)
- access_token (text)
- page_id (text)
```

#### **posts**
Posts agendados/publicados
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- platform (text) -- instagram, facebook
- generated_content (text)
- scheduled_at (timestamptz)
- status (text) -- rascunho, agendado, publicado
```

#### **leads**
CRM - leads e contatos
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- name (text)
- email (text)
- phone (text)
- stage (text)
- channel (text)
- value (numeric)
```

---

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de dev
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Lint do código
npm run test         # Executa testes
```

---

## 🚀 Deploy

### **Frontend (Vercel/Netlify)**

#### **Vercel**
```bash
npm install -g vercel
vercel --prod
```

#### **Netlify**
```bash
npm run build
netlify deploy --prod --dir=dist
```

### **Backend (Supabase)**
Já está hospedado no Supabase! Apenas certifique-se de que as Edge Functions foram deployadas.

---

## 📝 Roadmap

### **Em Desenvolvimento**
- [ ] Chatbot com fluxos visuais
- [ ] Templates de mensagens
- [ ] Analytics avançado
- [ ] Integração com Telegram
- [ ] API pública
- [ ] App mobile (React Native)

### **Concluído** ✅
- [x] WhatsApp Business API
- [x] Instagram Direct Messages
- [x] Interface de mensagens unificada
- [x] CRM com pipeline
- [x] Agendamento de posts
- [x] Geração de conteúdo com IA
- [x] Sistema de autenticação
- [x] Dark/Light mode

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 💬 Suporte

- **Documentação**: [Em construção]
- **Issues**: [GitHub Issues](https://github.com/luminadesignerpro/systemlumina/issues)
- **Email**: suporte@systemlumina.com

---

## 🙏 Agradecimentos

- [Supabase](https://supabase.com) - Backend as a Service
- [Shadcn/ui](https://ui.shadcn.com) - Componentes UI
- [Meta Business](https://business.facebook.com) - WhatsApp & Instagram APIs
- [OpenAI](https://openai.com) - Geração de conteúdo com IA

---

<div align="center">
  <p>Feito com ❤️ pela equipe SystemLumina</p>
  <p>
    <a href="https://systemlumina.vercel.app">Website</a> •
    <a href="https://github.com/luminadesignerpro/systemlumina">GitHub</a> •
    <a href="https://twitter.com/systemlumina">Twitter</a>
  </p>
</div>
