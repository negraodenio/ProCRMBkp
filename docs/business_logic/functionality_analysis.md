# Análise Funcional do CRM

Com base nas 15 imagens fornecidas, o sistema foi projetado para ser um CRM de alto desempenho, focado em proatividade e centralização de tarefas (Canvas). Abaixo, detalho as funcionalidades por pilar:

---

## 1. Gestão de Entidades (O "Tripé")
O sistema organiza os dados em três níveis fundamentais para garantir que o histórico de relacionamento seja preservado enquanto os negócios evoluem.

- **Empresas (Accounts):** Centraliza métricas de desempenho (valor vendido vs. perdido, ticket médio). Permite múltiplos contatos e campos personalizados.
- **Contatos (Contacts):** Cadastro flexível que permite que a mesma pessoa física esteja vinculada a múltiplas empresas (Many-to-Many). Inclui integração direta com WhatsApp.
- **Negociações (Oportunidades/Deals):** O ativo dinâmico do CRM. Pode ser associado a uma conta ou diretamente a um CPF (B2C).

---

## 2. Processo de Venda e Pipeline (O Fluxo)
O CRM utiliza um modelo de **Pipeline Visual** com estágios customizáveis (ex: Padrão, Ativação, WhatsApp).

- **Motor de Tarefas:** A regra de ouro do sistema. Uma negociação não pode ficar "parada". Se não houver uma tarefa pendente (próxima ação), o vendedor é forçado a fechar o negócio (Ganhos/Perdidos).
- **Segmentação Visual:** Controle de tempo médio de permanência em cada fase, ideal para identificar gargalos no funil.

---

## 3. A Visão "Canvas" (Hub da Negociação)
A tela de negociação funciona como um painel central onde todas as ações ocorrem sem troca de página:
- **Produtos/Serviços:** Adição de itens com suporte a recorrência, descontos granulares e cálculo automático de somatória.
- **Gestão de Propostas:** Geração de propostas comerciais com controle de aprovação (ativa, pendente, desativada).
- **Repositório de Arquivos:** Aba dedicada para upload de anexos e documentos de suporte.

---

## 4. Comunicação e Automação
O sistema foca em reduzir o trabalho manual do vendedor:
- **Template Engine:** Modelos de e-mail que preenchem automaticamente dados da empresa e do contato (`{{empresa}}`, `{{contato}}`).
- **Rastreamento:** Opção de notificar o vendedor quando o e-mail da proposta for lido pelo cliente.
- **Click-to-WhatsApp:** Conexão instantânea com o Lead via API de WhatsApp.

---

## 5. Pontos para Verificação/Desenvolvimento
Com base nas notas do usuário, foram identificados os seguintes objetivos imediatos:
- **Correção de Bugs:** O modal de criação de contatos e o menu de edição (três pontos) não estão abrindo.
- **Flexibilidade de Vínculo:** Implementar a lógica de "Contato Multifuncional" (mesma pessoa em várias empresas).
- **Lógica de Funil:** Adicionar a opção de definir ou mover o funil/estágio já no ato da criação da negociação.
