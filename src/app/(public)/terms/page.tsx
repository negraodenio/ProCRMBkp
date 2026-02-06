export default function TermsPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Termos de Uso</h1>
            <div className="prose dark:prose-invert">
                <p>Última atualização: {new Date().toLocaleDateString()}</p>

                <h2>1. Aceitação</h2>
                <p>Ao usar nosso software CRM, você concorda com estes termos integralmente.</p>

                <h2>2. Uso Aceitável</h2>
                <p>Você concorda em não usar o serviço para:</p>
                <ul>
                    <li>Enviar SPAM ou mensagens não solicitadas em massa no WhatsApp.</li>
                    <li>Atividades ilegais ou fraudulentas.</li>
                    <li>Tentar violar a segurança do sistema.</li>
                </ul>

                <h2>3. Pagamentos e Assinaturas</h2>
                <p>O serviço é cobrado via assinatura (SaaS). O não pagamento pode resultar na suspensão do acesso.</p>

                <h2>4. Limitação de Responsabilidade</h2>
                <p>O software é fornecido "como está". Não garantimos lucros ou resultados específicos de vendas.</p>

                <h2>5. Cancelamento</h2>
                <p>Você pode cancelar sua assinatura a qualquer momento através do painel de controle.</p>
            </div>
        </div>
    );
}
