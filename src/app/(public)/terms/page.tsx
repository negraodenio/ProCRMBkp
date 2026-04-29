export default function TermsPage() {
    return (
        <div className="container mx-auto py-10 px-4 max-w-4xl">
            <h1 className="text-3xl font-bold mb-6">Termos de Uso</h1>
            <div className="prose dark:prose-invert">
                <p>Última atualizaçío: {new Date().toLocaleDateString()}</p>

                <h2>1. Aceitaçío</h2>
                <p>Ao usar nosso software CRM, você concorda com estes termos integralmente.</p>

                <h2>2. Uso Aceitável</h2>
                <p>Você concorda em nío usar o serviço para:</p>
                <ul>
                    <li>Enviar SPAM ou mensagens nío solicitadas em massa no WhatsApp.</li>
                    <li>Atividades ilegais ou fraudulentas.</li>
                    <li>Tentar violar a segurança do sistema.</li>
                </ul>

                <h2>3. Pagamentos e Assinaturas</h2>
                <p>O serviço é cobrado via assinatura (SaaS). O nío pagamento pode resultar na suspensío do acesso.</p>

                <h2>4. Limitaçío de Responsabilidade</h2>
                <p>O software é fornecido "como está". Nío garantimos lucros ou resultados específicos de vendas.</p>

                <h2>5. Cancelamento</h2>
                <p>Você pode cancelar sua assinatura a qualquer momento através do painel de controle.</p>
            </div>
        </div>
    );
}
