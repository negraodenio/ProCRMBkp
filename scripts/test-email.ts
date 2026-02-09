import { Resend } from 'resend';
import * as dotenv from 'dotenv';
import path from 'path';

// Carregar .env
dotenv.config({ path: path.join(process.cwd(), '.env') });

const resend = new Resend(process.env.RESEND_API_KEY);

async function main() {
  console.log('Enviando email para negraodenio@gmail.com...');
  console.log('API Key:', process.env.RESEND_API_KEY ? 'Encontrada' : 'NÃO ENCONTRADA');

  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: 'negraodenio@gmail.com',
      subject: 'Bem-vindo ao ProCRM! 🚀 (Teste Script)',
      html: `
        <h1>Bem-vindo ao ProCRM! 🚀</h1>
        <p>Este é um teste de envio direto.</p>
        <p>Se você recebeu este email, a configuração do Resend está funcionando perfeitamente!</p>
      `,
    });

    if (error) {
      console.error('Erro Resend:', error);
      process.exit(1);
    }

    console.log('Email enviado com sucesso!', data);
  } catch (err) {
    console.error('Erro Geral:', err);
    process.exit(1);
  }
}

main();
