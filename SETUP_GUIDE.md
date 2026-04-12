# 📋 Guia de Configuração Completo - SystemLumina

Este guia fornece instruções passo a passo para configurar completamente o SystemLumina, incluindo todas as integrações necessárias.

---

## 📑 Índice

1. [Configuração Inicial](#1-configuração-inicial)
2. [Configuração do Supabase](#2-configuração-do-supabase)
3. [WhatsApp Business API](#3-whatsapp-business-api)
4. [Instagram Business API](#4-instagram-business-api)
5. [OpenAI (Opcional)](#5-openai-opcional)
6. [Deploy](#6-deploy)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Configuração Inicial

### 1.1. Requisitos
- Node.js 18+ ou Bun
- Git
- Conta GitHub (para deploy)
- Conta Supabase
- Conta Meta Business
- Cartão de crédito (para verificação Meta - pode ser removido após)

### 1.2. Clone e Instalação
```bash
git clone https://github.com/luminadesignerpro/systemlumina.git
cd systemlumina
npm install  # ou yarn install / bun install
```

---

## 2. Configuração do Supabase

### 2.1. Criar Projeto

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Configure:
   - **Organization**: Selecione ou crie uma
   - **Name**: `systemlumina`
   - **Database Password**: Escolha uma senha forte (salve!)
   - **Region**: Escolha a mais próxima de você
   - **Pricing Plan**: Free (para começar)
4. Clique em "Create new project"
5. Aguarde ~2 minutos para o projeto ser criado

### 2.2. Obter Credenciais

1. No dashboard do projeto, vá em **Settings > API**
2. Copie:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbGc...`
   - **Project Ref**: `xxxxx` (nas configurações gerais)

### 2.3. Configurar `.env`

Crie o arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://seu-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua-anon-key-aqui
VITE_SUPABASE_PROJECT_ID=seu-project-ref
```

### 2.4. Executar Migrations

#### Opção A: Via Supabase CLI (Recomendado)

```bash
# Instalar CLI
npm install -g supabase

# Login
supabase login

# Linkar projeto
supabase link --project-ref seu-project-ref

# Executar migrations
supabase db push
```

#### Opção B: Via SQL Editor (Manual)

1. No dashboard Supabase, vá em **SQL Editor**
2. Clique em "New query"
3. Cole o conteúdo de cada arquivo SQL em `/supabase/migrations/` na ordem:
   - `20260321000000_systemlumina_merge.sql`
   - `20260412000000_add_messaging_system.sql`
4. Execute cada script clicando em "Run"

### 2.5. Criar Bucket de Storage

1. Vá em **Storage > New bucket**
2. Configure:
   - **Name**: `post-media`
   - **Public**: ✅ Yes
3. Clique em "Create bucket"

### 2.6. Deploy Edge Functions

```bash
# Deploy todas as functions
supabase functions deploy instagram-auth
supabase functions deploy whatsapp-webhook
supabase functions deploy whatsapp-send
supabase functions deploy generate-content
supabase functions deploy publish-post
supabase functions deploy check-scheduled
```

---

## 3. WhatsApp Business API

### 3.1. Requisitos

- Número de telefone que não está em uso no WhatsApp
- Conta Meta Business
- Verificação em 2 fatores habilitada no Facebook

### 3.2. Criar App no Meta for Developers

1. Acesse [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Clique em "Create App"
3. Selecione "Business" como tipo
4. Configure:
   - **App name**: `SystemLumina WhatsApp`
   - **App contact email**: seu-email@example.com
   - **Business Account**: Selecione ou crie uma
5. Clique em "Create app"

### 3.3. Adicionar WhatsApp Product

1. No dashboard do app, clique em "Add Product"
2. Encontre "WhatsApp" e clique em "Set up"
3. Selecione ou crie uma **Business Account**
4. Aguarde a configuração

### 3.4. Configurar Número de Telefone

1. Vá em **WhatsApp > API Setup**
2. Clique em "Add phone number"
3. Siga os passos:
   - Escolha método de verificação (SMS/Call)
   - Digite o código recebido
   - Aceite os termos

### 3.5. Obter Credenciais

#### Phone Number ID
1. Em **WhatsApp > API Setup**
2. Seção "Phone numbers"
3. Copie o **Phone number ID** (número longo)

#### Access Token
1. No mesmo painel, seção "Temporary access token"
2. Copie o token (começa com `EAA...`)
3. ⚠️ **Importante**: Este token expira em 24h!

#### Criar Token Permanente
1. Vá em **Settings > Basic**
2. Copie o **App ID** e **App Secret**
3. No Supabase, configure os secrets:
```bash
supabase secrets set META_APP_ID=seu-app-id
supabase secrets set META_APP_SECRET=seu-app-secret
```

4. Gere um token permanente:
```bash
curl -X GET "https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=SEU_APP_ID&client_secret=SEU_APP_SECRET&fb_exchange_token=SEU_TOKEN_TEMPORARIO"
```

### 3.6. Configurar Webhook

1. Vá em **WhatsApp > Configuration > Webhooks**
2. Clique em "Edit"
3. Configure:
   - **Callback URL**: `https://seu-projeto.supabase.co/functions/v1/whatsapp-webhook`
   - **Verify token**: `systemlumina_verify_token_2026`
4. Clique em "Verify and Save"
5. Inscreva-se em:
   - ✅ `messages`
   - ✅ `message_status`

### 3.7. Testar WhatsApp

1. No SystemLumina, vá em **⚙️ Configurações > WhatsApp**
2. Cole:
   - **Phone Number ID**
   - **Access Token** (permanente)
3. Clique em "Conectar WhatsApp"
4. Envie uma mensagem de teste para o número WhatsApp configurado
5. A mensagem deve aparecer em **Mensagens**

---

## 4. Instagram Business API

### 4.1. Requisitos

- Conta Instagram convertida para **Business** ou **Creator**
- Página do Facebook conectada ao Instagram
- Mesmo App Meta do WhatsApp

### 4.2. Converter Instagram para Business

1. No app Instagram, vá em **Settings > Account**
2. Toque em "Switch to Professional Account"
3. Escolha "Business" ou "Creator"
4. Siga os passos

### 4.3. Conectar ao Facebook

1. No Instagram, vá em **Settings > Account > Linked accounts**
2. Toque em "Facebook"
3. Faça login e conecte à sua página

### 4.4. Configurar no Meta App

1. No mesmo App Meta, adicione o produto "Instagram"
2. Vá em **Instagram > Basic Display**
3. Configure:
   - **Valid OAuth Redirect URIs**:
     - `https://seu-site.com/instagram/callback`
     - `https://localhost:5173/instagram/callback`
4. Salve

### 4.5. Configurar Permissões

1. Vá em **App Review > Permissions and Features**
2. Solicite as permissões:
   - `instagram_basic`
   - `instagram_content_publish`
   - `instagram_manage_insights`
   - `pages_show_list`
   - `pages_read_engagement`

⚠️ **Para desenvolvimento**: Pode usar sem aprovação (modo teste)

### 4.6. Testar Instagram

1. No SystemLumina, vá em **⚙️ Configurações > Instagram**
2. Clique em "Conectar com Instagram"
3. Autorize o acesso
4. Selecione a Página do Facebook
5. Pronto! Agora pode agendar posts

---

## 5. OpenAI (Opcional)

Para usar geração de conteúdo com IA:

### 5.1. Obter API Key

1. Acesse [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Crie uma conta ou faça login
3. Clique em "Create new secret key"
4. Copie a chave (começa com `sk-...`)

### 5.2. Configurar

No Supabase:
```bash
supabase secrets set OPENAI_API_KEY=sk-sua-chave-aqui
```

Ou edite a Edge Function diretamente se preferir usar outra API de IA.

---

## 6. Deploy

### 6.1. Frontend (Vercel)

1. Push para GitHub:
```bash
git add .
git commit -m "Initial setup"
git push origin main
```

2. Acesse [vercel.com](https://vercel.com)
3. Clique em "Import Project"
4. Selecione o repositório
5. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
   - `VITE_SUPABASE_PROJECT_ID`
6. Clique em "Deploy"

### 6.2. Atualizar URLs

Após o deploy, atualize:

#### No Meta App
1. **WhatsApp Webhook**: Use a nova URL da Vercel
2. **Instagram OAuth Redirect**: Adicione a URL da Vercel

#### No Código
A URL do backend (Supabase Functions) já está configurada automaticamente.

---

## 7. Troubleshooting

### Webhook não recebe mensagens

**Problema**: Envio mensagem no WhatsApp mas não aparece no sistema.

**Soluções**:
1. Verifique se o webhook está ativo no Meta
2. Teste o webhook manualmente:
```bash
curl -X POST "https://seu-projeto.supabase.co/functions/v1/whatsapp-webhook" \
  -H "Content-Type: application/json" \
  -d '{"object":"whatsapp_business_account","entry":[]}'
```
3. Verifique os logs da Edge Function no Supabase
4. Confirme que o `WHATSAPP_WEBHOOK_VERIFY_TOKEN` está configurado

### Token expirado

**Problema**: "Invalid OAuth access token"

**Solução**:
1. Gere um novo token permanente (passo 3.5)
2. Atualize no SystemLumina

### Instagram não conecta

**Problema**: "Nenhuma conta Business/Creator encontrada"

**Soluções**:
1. Certifique-se de que o Instagram é Business/Creator
2. Verifique se está conectado a uma Página do Facebook
3. Use a mesma conta Facebook do App Meta

### Erro ao enviar mensagem

**Problema**: "Failed to send WhatsApp message"

**Soluções**:
1. Verifique se o número está no formato correto (+5511999999999)
2. Confirme que o access token é válido
3. Verifique se não ultrapassou o limite de mensagens (1000/dia no free tier)

### Database error

**Problema**: Erros ao salvar dados

**Soluções**:
1. Verifique se as migrations foram executadas
2. Confirme as políticas RLS no Supabase
3. Teste as queries no SQL Editor

---

## 📞 Suporte Adicional

Se ainda tiver problemas:

1. Verifique os logs:
   - Supabase: **Logs > Edge Functions**
   - Meta: **App Dashboard > Webhooks > Logs**
   - Browser: Console do desenvolvedor (F12)

2. Consulte a documentação oficial:
   - [Supabase Docs](https://supabase.com/docs)
   - [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)
   - [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)

3. Abra uma issue no GitHub com:
   - Descrição do problema
   - Passos para reproduzir
   - Logs relevantes (sem expor tokens!)

---

✅ **Configuração completa!** Agora você está pronto para usar o SystemLumina. 🚀
