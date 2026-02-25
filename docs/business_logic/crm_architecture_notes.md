# Notas sobre a Arquitetura do CRM

Baseado nas imagens fornecidas, o sistema segue uma arquitetura focada em **venda consultiva** e **proatividade do vendedor**.

## 1. O Tripé de Dados (The Tripod)
A base do sistema gira em torno de três entidades principais, com relações flexíveis:

| Entidade | Descrição |
| :--- | :--- |
| **Conta (Account)** | Representa a empresa cliente. Uma conta pode ter múltiplos contatos. |
| **Contato (Contact)** | Representa a pessoa física. **Requisito:** Um contato deve poder estar vinculado a múltiplas empresas simultaneamente. |
| **Oportunidade (Opportunity/Deal)** | O negócio. Deve estar vinculado obrigatoriamente a uma Conta e um Contato. |

## 2. Relações e Flexibilidade
- **Many-to-Many (Contato <-> Empresa):** Diferente de CRMs básicos onde o contato pertence a uma única conta, aqui é necessária uma tabela associativa para permitir que a mesma pessoa represente empresas diferentes em negócios distintos.
- **Customização:** Todas as entidades principais (Empresa, Contato, Oportunidade) devem suportar **Campos Personalizados**.

## 3. Lógica Baseada em Tarefas (Task-Driven Logic)
... (mantido)

## 4. Requisitos de Propostas e Detalhes (A Visão "Canvas")
A tela de negociação deve atuar como um **hub central (Canvas)** permitindo:
- **Edição Completa:** Informações da oportunidade, associação de contatos e produtos em uma única interface.
- **Automação de Documentos:** Montagem de propostas, envio de links com rastreio de aprovação, download em PDF.
- **Comunicação Inteligente:**
    - **Templates de E-mail:** Com preenchimento automático de variáveis (`{{empresa_nome}}`, `{{contato_nome}}`).
    - **Integração WhatsApp:** Botão de ação direta ao lado do número do contato.

## 5. Casos Específicos (B2B vs B2C/CPF)
- **Hierarquia Padrão:** Oportunidade subordinada à Conta (Empresa).
- **Exceção (CPF):** Suporte para oportunidades vinculadas diretamente a um Contato quando não há uma empresa jurídica envolvida (venda direta para pessoa física).
