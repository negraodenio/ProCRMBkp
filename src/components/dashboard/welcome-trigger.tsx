"use client";

import { useEffect } from "react";
import { sendWelcomeEmailAction } from "@/app/actions/email-actions";
import { toast } from "sonner";

export function WelcomeEmailTrigger() {
  useEffect(() => {
    // Dispara apenas uma vez na montagem
    async function trigger() {
      // Pequeno delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      try {
        const result = await sendWelcomeEmailAction();
        if (result && result.success && !result.alreadySent) {
          toast.success("Email de boas-vindas a caminho! 📧");
        }
      } catch (error) {
        console.error("Erro ao disparar email:", error);
      }
    }

    trigger();
  }, []); // Array vazio = executa 1 vez

  return null; // Componente invisível
}
