# ✅ Checklist de Setup - SystemLumina

Use este checklist para garantir que tudo está configurado corretamente.

---

## 📋 Pré-Setup

- [ ] Node.js 18+ instalado
- [ ] Git instalado
- [ ] Editor de código (VS Code recomendado)
- [ ] Conta GitHub criada
- [ ] Conta Supabase criada (gratuita)
- [ ] Conta Meta Business criada
- [ ] Cartão de crédito para verificação Meta (pode remover depois)

---

## 🚀 Setup Inicial

### 1. Código
- [ ] Repositório clonado
- [ ] Dependências instaladas (`npm install`)
- [ ] Arquivo `.env` criado
- [ ] Projeto abre sem erros (`npm run dev`)

---

## 💾 Supabase

### 2. Projeto Supabase
- [ ] Projeto criado no Supabase
- [ ] URL copiada para `.env`
- [ ] Anon key copiada para `.env`
- [ ] Project ID copiada para `.env`

### 3. Database
- [ ] Migration `20260321000000_systemlumina_merge.sql` executada
- [ ] Migration `20260412000000_add_messaging_system.sql` executada
- [ ] Tabelas criadas (verificar no Table Editor)
- [ ] Políticas RLS ativas

### 4. Storage
- [ ] Bucket `post-media` criado
- [ ] Bucket configurado como público
- [ ] Políticas de acesso configuradas

### 5. Edge Functions
- [ ] `instagram-auth` deployada
- [ ] `whatsapp-webhook` deployada
- [ ] `whatsapp-send` deployada
- [ ] `generate-content` deployada
- [ ] `publish-post` deployada
- [ ] `check-scheduled` deployada

### 6. Secrets
- [ ] `META_APP_ID` configurado
- [ ] `META_APP_SECRET` configurado
- [ ] `WHATSAPP_WEBHOOK_VERIFY_TOKEN` configurado
- [ ] `OPENAI_API_KEY` configurado (opcional)

---

## 📱 WhatsApp Business API

### 7. App Meta
- [ ] App criado no Meta for Developers
- [ ] Produto WhatsApp adicionado
- [ ] Business Account selecionado
- [ ] App ID e App Secret salvos

### 8. Número WhatsApp
- [ ] Número de telefone adicionado
- [ ] Número verificado (SMS/Call)
- [ ] Phone Number ID copiado
- [ ] Número de teste funcionando

### 9. Token de Acesso
- [ ] Token temporário obtido
- [ ] Token permanente gerado
- [ ] Token salvo em local seguro

### 10. Webhook
- [ ] Callback URL configurada
- [ ] Verify Token configurado
- [ ] Webhook verificado (status verde)
- [ ] Eventos `messages` e `message_status` inscritos

### 11. Teste WhatsApp
- [ ] Conectado no SystemLumina
- [ ] Mensagem de teste enviada
- [ ] Mensagem de teste recebida
- [ ] Mensagem aparece na interface

---

## 📸 Instagram Business API

### 12. Conta Instagram
- [ ] Conta convertida para Business/Creator
- [ ] Página Facebook criada/selecionada
- [ ] Instagram conectado à Página Facebook

### 13. App Meta (mesmo do WhatsApp)
- [ ] Produto Instagram adicionado
- [ ] OAuth Redirect URIs configuradas
- [ ] Permissões solicitadas

### 14. Teste Instagram
- [ ] Conectado no SystemLumina
- [ ] Autorização concedida
- [ ] Conta aparece como conectada
- [ ] Post de teste agendado (opcional)

---

## 🌐 Deploy

### 15. Frontend (Vercel)
- [ ] Código commitado no GitHub
- [ ] Projeto importado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy com sucesso
- [ ] Site acessível na URL da Vercel

### 16. Atualizar URLs
- [ ] Webhook WhatsApp atualizado para URL da Vercel
- [ ] OAuth Instagram atualizado para URL da Vercel
- [ ] URLs testadas

---

## 🧪 Testes Finais

### 17. Funcionalidades Core
- [ ] Login funciona
- [ ] Logout funciona
- [ ] CRM carrega leads
- [ ] Analytics mostra dados

### 18. Mensageria
- [ ] WhatsApp recebe mensagens
- [ ] WhatsApp envia mensagens
- [ ] Status de leitura funciona
- [ ] Conversas aparecem em tempo real

### 19. Social Media
- [ ] Instagram conectado
- [ ] Posts podem ser criados
- [ ] Posts podem ser agendados
- [ ] Histórico mostra posts

### 20. Integrações
- [ ] Geração de conteúdo com IA funciona (se OpenAI configurado)
- [ ] Notificações aparecem
- [ ] Automações podem ser criadas

---

## 🐛 Troubleshooting

### Se algo não funcionar:

1. **Verificar Logs**
   - [ ] Console do navegador (F12)
   - [ ] Logs do Supabase (Dashboard > Logs)
   - [ ] Logs do Meta (App Dashboard > Webhooks)

2. **Verificar Variáveis**
   - [ ] `.env` local correto
   - [ ] Vercel env vars corretas
   - [ ] Supabase secrets corretos

3. **Verificar Conexões**
   - [ ] Internet estável
   - [ ] Supabase status OK
   - [ ] Meta APIs status OK

4. **Limpar Cache**
   - [ ] Hard refresh (Ctrl+Shift+R)
   - [ ] Limpar localStorage
   - [ ] Fazer logout e login

---

## 📊 Métricas de Sucesso

Tudo funcionando se:

- ✅ Você consegue fazer login
- ✅ Consegue enviar e receber mensagens WhatsApp
- ✅ Consegue agendar posts no Instagram
- ✅ Dashboard carrega sem erros
- ✅ Notificações aparecem
- ✅ Dados são salvos corretamente

---

## 🎉 Próximos Passos

Após tudo configurado:

1. **Configurar Equipe**
   - Convidar membros
   - Atribuir permissões
   - Configurar automações

2. **Importar Dados**
   - Importar leads existentes
   - Configurar templates de mensagens
   - Criar fluxos de chatbot

3. **Personalizar**
   - Ajustar branding
   - Configurar notificações
   - Criar dashboards personalizados

4. **Otimizar**
   - Monitorar performance
   - Ajustar automações
   - Treinar equipe

---

## 📞 Precisa de Ajuda?

Se algo não estiver funcionando:

1. Consulte o [SETUP_GUIDE.md](SETUP_GUIDE.md) para instruções detalhadas
2. Verifique a [ARCHITECTURE.md](ARCHITECTURE.md) para entender o sistema
3. Abra uma issue no GitHub
4. Entre em contato com o suporte

---

✅ **Tudo pronto?** Comece a usar o SystemLumina e transforme seu atendimento! 🚀

---

**Última atualização:** Abril 2026
**Versão:** 2.0.0
