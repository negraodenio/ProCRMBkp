import { resend } from "@/lib/resend";
import { WelcomeEmail } from "@/emails/welcome";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: "ProCRM <onboarding@resend.dev>", // Usando domínio de teste do Resend
      to: [email],
      subject: "Bem-vindo ao ProCRM! 🚀 (Teste)",
      react: WelcomeEmail({ name: "Denio (Teste)" }),
    });

    if (error) {
      return NextResponse.json({ error }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
