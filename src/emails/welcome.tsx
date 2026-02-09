import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Tailwind,
} from "@react-email/components";
import * as React from "react";

interface WelcomeEmailProps {
  name: string;
}

export const WelcomeEmail = ({ name = "Novo Usuário" }: WelcomeEmailProps) => {
  const previewText = `Bem-vindo ao ProCRM, ${name}!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px] bg-white">
            <Section className="mt-[32px]">
              <div className="flex items-center gap-2 justify-center mb-8">
                 {/* Logo placeholder - replace with actual URL in production */}
                 <Text className="text-2xl font-bold text-blue-600 text-center">
                    🧠 ProCRM
                 </Text>
              </div>
            </Section>

            <Heading className="text-black text-[24px] font-bold text-center p-0 my-[30px] mx-0">
              Bem-vindo ao Futuro das Vendas! 🚀
            </Heading>

            <Text className="text-black text-[14px] leading-[24px]">
              Olá {name},
            </Text>

            <Text className="text-black text-[14px] leading-[24px]">
              Estamos muito felizes em ter você a bordo. O ProCRM foi criado para ajudar você a vender 35% a mais usando Inteligência Artificial.
            </Text>

            <Section className="bg-slate-50 p-4 rounded-lg my-4 border border-slate-100">
              <Text className="text-slate-800 font-semibold mb-2 m-0">
                Seus Próximos Passos:
              </Text>
              <Text className="text-slate-600 text-sm mt-1 m-0">✓ Completar seu perfil de empresa</Text>
              <Text className="text-slate-600 text-sm mt-1 m-0">✓ Importar seus primeiros leads</Text>
              <Text className="text-slate-600 text-sm mt-1 m-0">✓ Configurar o assistente de IA</Text>
            </Section>

            <Section className="text-center mt-[32px] mb-[32px]">
              <Button
                className="bg-blue-600 rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href="https://procrm.com/dashboard"
              >
                Acessar Meu Dashboard
              </Button>
            </Section>

            <Text className="text-black text-[14px] leading-[24px]">
              Se tiver qualquer dúvida, nosso suporte está disponível 24/7.
              <br />
              Basta responder a este email.
            </Text>

            <Hr className="border border-solid border-[#eaeaea] my-[26px] mx-0 w-full" />

            <Text className="text-[#666666] text-[12px] leading-[24px] text-center">
              © 2026 ProCRM. Todos os direitos reservados.
              <br />
              Feito com ❤️ por Denio & AI AntiGravity.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default WelcomeEmail;
