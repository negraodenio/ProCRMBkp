"use server";

import { resend } from "@/lib/resend";
import { WelcomeEmail } from "@/emails/welcome";
import { createClient } from "@/lib/supabase/server";

export async function sendWelcomeEmailAction() {
  const supabase = await createClient();

  // 1. Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || !user.email) return { success: false, error: "User not found" };

  // 2. Check if email already sent
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, welcome_email_sent")
    .eq("id", user.id)
    .single();

  if (profile?.welcome_email_sent) {
    return { success: true, alreadySent: true };
  }

  const name = profile?.full_name || user.user_metadata?.full_name || "Novo Usuário";

  try {
    // 3. Send Email via Resend
    const { data, error } = await resend.emails.send({
      from: "ProCRM <onboarding@resend.dev>", // Mude para seu domínio verificado depois!
      to: [user.email],
      subject: "Bem-vindo ao ProCRM! 🚀",
      react: WelcomeEmail({ name }),
    });

    if (error) {
      console.error("Resend Error:", error);
      return { success: false, error: error.message };
    }

    // 4. Mark as sent
    await supabase
      .from("profiles")
      .update({ welcome_email_sent: true })
      .eq("id", user.id);

    return { success: true, data };
  } catch (error) {
    console.error("Server Action Email Error:", error);
    return { success: false, error: "Failed to send email" };
  }
}
