-- Adicionar controle de envio de email de boas-vindas
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_email_sent boolean DEFAULT false;
