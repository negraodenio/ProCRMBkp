-- =========================================
-- UPDATE DEALS: ADD NOTES
-- Migration para adicionar campo de notas aos negócios
-- =========================================

ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS notes TEXT;

-- Comentário para documentação
COMMENT ON COLUMN public.deals.notes IS 'Notas e observações internas sobre o negócio/deal';
