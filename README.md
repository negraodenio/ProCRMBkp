# CRMia.eu - University Partnership & AI Tech Transfer

Plataforma avançada de CRM e Inteligência de Mercado focada em transferência de tecnologia, prospecção de parcerias universitárias e gestão de inovação.

## 🚀 Funcionalidades Centrais

- **Neural Engine**: Sistema de RAG (Retrieval-Augmented Generation) para processamento de patentes e papers.
- **Autopilot**: Geração automática de materiais de marketing e campanhas outbound.
- **Matchmaking Semântico**: Conexão inteligente entre pesquisas e empresas parceiras.
- **Mission Control**: Dashboard centralizado para gestão de ativos de inovação e TTO (Tech Transfer Office).

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14+ (App Router)
- **Backend**: Supabase (Auth, DB, Vector, Edge Functions)
- **IA**: OpenAI / SiliconFlow (DeepSeek)
- **Mensageria**: Twilio (WhatsApp Business API)
- **Estilização**: Tailwind CSS + Shadcn/UI

## 📂 Estrutura do Projeto

- `/src/app`: Rotas e componentes do Next.js.
- `/src/components`: UI components reutilizáveis.
- `/src/lib`: Utilitários, configurações de IA e Supabase.
- `/src/services`: Integrações com serviços externos (Twilio, Evolution, Stripe).
- `/migrations`: Scripts SQL de evolução do banco de dados.
- `/scripts/legacy`: Scripts de utilidade e testes manuais.

## 👷 Worker & Fila

O sistema utiliza um sistema de fila (`queue`) para processamento assíncrono de mensagens e IA. O worker está localizado em `/api/queue/worker`.

---
© 2024 CRMia.eu - Inovação Conectada.
