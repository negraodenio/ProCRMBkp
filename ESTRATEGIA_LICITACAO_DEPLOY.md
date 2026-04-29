# 📑 Estratégia de Deploy e Demonstração para Licitação

Este guia resume os passos necessários para colocar a plataforma de Inovação online e realizar uma apresentação de alto impacto.

---

## 🛠️ 1. Deploy no Vercel (Subdomínio)

Para criar um ambiente isolado (ex: `inovacao.crmia.eu`):

1.  **Git Push:**
    *   Certifique-se de estar no branch `evolution-firstignite`.
    *   Comando: `git push origin evolution-firstignite`.
2.  **Novo Projeto no Vercel:**
    *   Importe o repositório.
    *   Configure o **Production Branch** como `evolution-firstignite`.
3.  **Variáveis de Ambiente (.env):**
    *   Copie todas as chaves do seu `.env` local para o painel do Vercel (especialmente `SILICONFLOW_API_KEY` e as chaves do Supabase).
4.  **Domínio:**
    *   Em *Settings > Domains*, adicione o subdomínio desejado.
    *   Configure o CNAME no seu provedor de DNS conforme as instruções do Vercel.

---

## 🎯 2. Roteiro da Demonstração (The Pitch)

Siga esta ordem para "vender" a solução durante a licitação:

### Passo A: A Fachada (`/innovation`)
*   Mostre a Landing Page de Inovação.
*   **Argumento:** "Temos uma solução dedicada e especializada em transferência de tecnologia, não um CRM genérico."

### Passo B: O Roteiro Guiado (`/demo`)
*   Use esta página para navegar pelos módulos.
*   Explique o framework **G-M-E (Gerar, Match, Engajar)**.

### Passo C: O Efeito Uau (`/autopilot`)
*   Faça o upload de um **PDF de uma patente real**.
*   Mostre a extração de texto e a IA gerando o **TRL** e o Teaser de Mercado.

### Passo D: O Match semântico (`/match`)
*   Mostre que o sistema encontra empresas com base no significado técnico, não apenas palavras-chave.
*   Destaque o **Racional Estratégico** (A IA explicando o porquê do match).

### Passo E: Fechamento e Auditoria (`/mission-control`)
*   Mostre o dashboard analítico.
*   Clique em **"Exportar Relatório"** para mostrar a capacidade de gerar evidências para auditoria governamental.

---

## 🚨 Lembretes Técnicos

*   **SQL:** O script `migrations/20240428_matchmaking.sql` já foi rodado no Supabase. Não precisa rodar de novo.
*   **Seed:** Após criar sua conta no ambiente de produção, não esqueça de rodar `node seed_companies.js` (apontando para o ambiente correto) para popular as empresas de teste.

---

**Status Atual:** Tudo desenvolvido e testado no branch `evolution-firstignite`.
**Pronto para o combate!** 🚀
