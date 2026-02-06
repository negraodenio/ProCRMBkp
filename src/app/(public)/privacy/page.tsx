export default function PrivacyPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Política de Privacidade</h1>
            <div className="prose dark:prose-invert">
                <p>Última atualização: {new Date().toLocaleDateString()}</p>

                <h2>1. Introdução</h2>
                <p>A sua privacidade é importante para nós. Esta política explica como coletamos, usamos e protegemos seus dados.</p>

                <h2>2. Dados Coletados</h2>
                <p>Coletamos informações necessárias para o funcionamento do serviço, incluindo:</p>
                <ul>
                    <li>Dados de conta (Nome, Email, Telefone)</li>
                    <li>Dados de uso do CRM (Leads, Contatos)</li>
                    <li>Mensagens processadas via integração WhatsApp (para funcionalidade do chat)</li>
                </ul>

                <h2>3. Uso dos Dados</h2>
                <p>Utilizamos seus dados para:</p>
                <ul>
                    <li>Fornecer e manter o serviço CRM</li>
                    <li>Processar pagamentos (via Stripe)</li>
                    <li>Melhorar nossos modelos de IA (apenas dados anonimizados)</li>
                </ul>

                <h2>4. Compartilhamento</h2>
                <p>Não vendemos seus dados pessoais. Compartilhamos apenas com processadores essenciais (ex: Stripe, Provedores de IA LLM) sob estritos acordos de confidencialidade.</p>

                <h2>5. Seus Direitos</h2>
                <p>Você pode solicitar a exclusão ou exportação dos seus dados a qualquer momento entrando em contato com o suporte.</p>
            </div>
        </div>
    );
}
