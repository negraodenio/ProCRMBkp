'use client';

import { createClient } from "@/lib/supabase/client";
import { revalidatePath } from "next/cache";

export async function saveLeadQualification(
  contactId: string,
  organizationId: string,
  responses: any,
  score: number
) {
  const supabase = createClient();

  // Determinar classificação
  let classification = 'Frio';
  if (score >= 70) classification = 'Quente';
  else if (score >= 40) classification = 'Morno';

  // 1. Salvar na tabela de qualificações
  const { error: qualError } = await supabase.from('lead_qualifications').upsert({
    contact_id: contactId,
    organization_id: organizationId,
    responses,
    score,
    classification,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'contact_id' });

  if (qualError) throw qualError;

  // 2. Atualizar o score e status no contato (opcional, mas bom para a listagem)
  const { error: contactError } = await supabase
    .from('contacts')
    .update({
      score: score,
      status: score >= 70 ? 'qualified' : undefined // Opcional: auto-qualificar se for quente
    })
    .eq('id', contactId);

  if (contactError) throw contactError;

  return { success: true };
}
