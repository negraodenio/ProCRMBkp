# Memorial Descritivo de Funcionalidades - Processo 56467 (FUNARBE)

Este documento detalha as funcionalidades do sistema **CRMia**, mapeando cada módulo visível na interface aos requisitos técnicos exigidos pela licitação para gestão de inovação e transferência de tecnologia.

---

## 🖼️ Interface de Gestão e Cockpit
Abaixo, a evidência visual da plataforma em operação, demonstrando a arquitetura de módulos integrados.

![Dashboard de Operações](file:///C:/Users/denio/.gemini/antigravity/brain/909b8918-ceeb-454a-9b6f-7400dab50ebc/dashboard_overview_1777411648231.png)

---

## 🛠️ Mapeamento Funcional (Menu Lateral)

| Módulo | Funcionalidade (Existente/Nova) | Requisito da Licitação Atendido |
| :--- | :--- | :--- |
| **Mission Control** | **NOVO:** Painel de BI especializado em TRL (Technology Readiness Level) e maturidade tecnológica. | Monitoramento de portfólio de ativos e inteligência de mercado. |
| **Autopilot** | **NOVO:** Motor de ingestão automática de patentes/papers com tradução para Teasers de Mercado. | Geração de conteúdo de marketing a partir de pesquisa científica. |
| **Matchmaking** | **NOVO:** Algoritmo vetorial (RAG) que cruza dados industriais com pesquisas acadêmicas. | Identificação de parceiros corporativos e matchmaking IA. |
| **Empresas** | Base de dados de parceiros industriais com segmentação por setor de inovação. | Cadastro e gestão de stakeholders externos e empresas prospectadas. |
| **Contatos** | Gestão de decisores (CTOs, Heads de Inovação) mapeados pela IA. | Identificação e prospecção inteligente de contatos corporativos. |
| **Pipeline** | Fluxo Kanban adaptado para Transferência de Tecnologia (da Prospecção ao Licenciamento). | Gestão de funil de vendas e contratos de parceria. |
| **Propostas** | Gerador de Business Cases e contratos de confidencialidade/licenciamento. | Gestão documental de negociações e propostas comerciais. |
| **Conversas** | Central omnichannel para gestão de diálogos com parceiros. | Registro de interações e histórico de negociações. |
| **WhatsApp** | Integração oficial via Twilio para prospecção outbound de alta taxa de resposta. | Comunicação direta e prospecção outbound automatizada. |
| **Mensagens Autom.** | **NOVO:** Robôs de triagem que qualificam o interesse de empresas em tecnologias. | Automação de marketing e qualificação de leads. |
| **IA Tools** | Suite de 13 ferramentas (Análise de Sentimento, SPIN Selling, Predição de Fechamento). | Inteligência artificial aplicada à prospecção comercial. |
| **Usuários** | Gestão de acessos multi-nível (Admin, Gestor de TTO, Pesquisador). | Segurança, auditoria e controle de acesso hierárquico. |
| **Relatórios** | Dashboards exportáveis de ROI de Inovação e produtividade do NIT. | Prestação de contas e indicadores de performance (KPIs). |
| **Estratégias** | **NOVO:** Planejamento de campanhas de Go-To-Market para novas patentes. | Planejamento estratégico de comercialização de tecnologia. |

---

## 🧠 Diferenciais do "Neural Engine" (Over-Delivery)

Para atender ao critério de **"Software de IA para Universidades"**, o CRMia implementa camadas tecnológicas que superam CRMs genéricos:

### 1. RAG (Retrieval-Augmented Generation)
*   **O que é:** Capacidade de "ler" PDFs de patentes e responder perguntas técnicas sobre eles sem alucinações.
*   **Aplicação:** O avaliador da FUNARBE pode subir um edital ou patente e a IA cria a estratégia de prospecção instantaneamente.

### 2. Busca Vetorial (Vector Search)
*   **O que é:** Transformação de textos em "embeddings" (vetores matemáticos).
*   **Aplicação:** Diferente de busca por palavras-chave, o sistema encontra empresas por "proximidade de conceito tecnológico".

### 3. Auditoria Criptográfica (Blockchain Proof)
*   **O que é:** Cada alteração em propostas financeiras é assinada com HMAC-SHA256.
*   **Aplicação:** Garante a integridade dos dados para auditorias da FUNARBE e órgãos de controle.

---

## ✅ Checklist de Conformidade Administrativa

O sistema está configurado para atender as exigências de **Importação Direta ou Mercado Nacional**:

*   **Nota Fiscal/Proforma:** Emissão automática de propostas em múltiplas moedas (USD, EUR, BRL).
*   **Conformidade Fiscal:** Módulo de auditoria de dados pronto para fiscalização.
*   **Segurança de Dados:** Hospedagem em nuvem com criptografia de ponta a ponta e conformidade com a LGPD.

---

## 🛡️ Segurança, LGPD e Governança (Diferenciais Estratégicos)

Para além das funcionalidades operacionais, o CRMia foi construído sob frameworks internacionais de segurança e privacidade, garantindo conformidade total para instituições públicas:

### 1. Conformidade Plena com a LGPD (Lei 13.709/2018)
O sistema implementa o conceito de **Privacy by Design**:
*   **Isolamento de Dados (Multi-tenancy):** Arquitetura que impede vazamento de dados entre diferentes departamentos ou organizações.
*   **Direito ao Esquecimento:** Ferramentas nativas para exclusão definitiva de logs e dados de contatos a pedido do titular.
*   **Mascaramento de PII:** Dados sensíveis são ofuscados em logs de auditoria para evitar exposição acidental.

### 2. Framework NIST AI RMF (Risk Management Framework)
Somos pioneiros na adoção do framework do NIST para **IA Responsável**:
*   **IA Explicável (XAI):** O sistema não apenas faz o matchmaking, mas fornece o "Racional Estratégico", eliminando o efeito "caixa-preta" das decisões automatizadas.
*   **Mitigação de Viés:** Filtros de contexto que garantem que a prospecção seja baseada puramente em fit tecnológico e mérito científico.

### 3. Integração Nativa com Plataforma Lattes (Exclusividade)
Diferencial decisivo para Universidades Brasileiras:
*   **Sincronização Lattes:** Mapeamento automático de currículos de pesquisadores para identificar ativos de PI (Propriedade Intelectual) ainda não registrados, acelerando o trabalho do NIT (Núcleo de Inovação Tecnológica).

### 4. Segurança de Infraestrutura (Padrão Bancário)
*   **Criptografia em Repouso:** Dados armazenados em discos AES-256 bits.
*   **TLS 1.3:** Todas as comunicações são protegidas pelo protocolo mais recente de criptografia de trânsito.
*   **WAF (Web Application Firewall):** Proteção contra ataques de injeção e DDoS.

---
> **Documento preparado para inclusão no envelope técnico da Licitação 56467.**
