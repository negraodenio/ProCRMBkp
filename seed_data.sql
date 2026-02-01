-- ==============================================================================
-- SEED DATA FOR CRM TESTING
-- Run this AFTER running MASTER_CRM_SETUP.sql
-- ==============================================================================

-- 1. Create a test organization (if not exists)
INSERT INTO public.organizations (id, name) VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Gráfica Imediata Ltda')
ON CONFLICT (id) DO NOTHING;

-- 2. Create test profiles
INSERT INTO public.profiles (id, email, full_name, organization_id, role, status) VALUES
('11111111-1111-1111-1111-111111111111', 'elisangela@crmia.eu', 'Elisangela Pereira', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', 'active'),
('22222222-2222-2222-2222-222222222222', 'supervisor@graficaimediata.com.br', 'supervisor grafica', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', 'active'),
('33333333-3333-3333-3333-333333333333', 'atendimento@graficaimediata.com.br', 'Atendimento Gráfica Imediata', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', 'active'),
('44444444-4444-4444-4444-444444444444', 'diego@crmia.eu', 'Diego Cairon', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'user', 'active'),
('55555555-5555-5555-5555-555555555555', 'lidiane@crmia.eu', 'Lidiane CRM', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'user', 'active'),
('66666666-6666-6666-6666-666666666666', 'crmdenio@gmail.com', 'DENIO AUGUSTO NEGRAO', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'admin', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. Create pipeline with stages matching Replit
INSERT INTO public.pipelines (id, organization_id, name, is_default) VALUES
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Funil de Vendas', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.stages (id, pipeline_id, name, "order", color) VALUES
('c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Prospecção', 0, '#3b82f6'),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Qualificação', 1, '#f97316'),
('c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Proposta', 2, '#22c55e'),
('c4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Negociação', 3, '#1e40af'),
('c5eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fechado', 4, '#15803d'),
('c6eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Perdido', 5, '#dc2626')
ON CONFLICT (id) DO NOTHING;

-- 4. Create test contacts
INSERT INTO public.contacts (id, organization_id, name, email, phone, company, type, status, source, score) VALUES
('d1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'João Silva', 'joao@empresa.com', '(11) 99999-1111', 'Empresa ABC', 'lead', 'new', 'whatsapp', 75),
('d2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Maria Santos', 'maria@startup.com', '(11) 99999-2222', 'Startup XYZ', 'lead', 'contacted', 'website', 85),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Carlos Oliveira', 'carlos@tech.com', '(11) 99999-3333', 'TechCorp', 'client', 'qualified', 'referral', 95),
('d4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'vcvcvcvcv', 'vcvcvcvcv@test.com', '(11) 99999-4444', 'VCVCVCV', 'lead', 'new', 'whatsapp', 50)
ON CONFLICT (id) DO NOTHING;

-- 5. Create test deals
INSERT INTO public.deals (id, organization_id, stage_id, title, value, contact_id, status) VALUES
('e1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Contrato João Silva', 25000.00, 'd1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'open'),
('e2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Projeto Startup XYZ', 75000.00, 'd2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'open'),
('e3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Contrato TechCorp', 150000.00, 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'open')
ON CONFLICT (id) DO NOTHING;

-- 6. Create test proposals
INSERT INTO public.proposals (id, organization_id, contact_id, deal_id, number, title, value, valid_until, status, sent_via_whatsapp, sent_via_email) VALUES
('f1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', null, 'PROP-176411645832', 'Proposta VCVCVCVCV', 3434333.69, '2025-12-26', 'sent', true, false)
ON CONFLICT (id) DO NOTHING;

-- 7. Create proposal templates
INSERT INTO public.proposal_templates (id, organization_id, name, category, is_active, content) VALUES
('g1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Proposta Desenvolvimento Web', 'Tecnologia', true, '{"sections": [], "estimatedValue": 15000, "estimatedDays": 30}'),
('g2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Proposta Marketing Digital', 'Marketing Digital', true, '{"sections": [], "estimatedValue": 8000, "estimatedDays": 60}'),
('g3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Contrato de Consultoria', 'Consultoria', true, '{"sections": [], "estimatedValue": 25000, "estimatedDays": 90}')
ON CONFLICT (id) DO NOTHING;

-- 8. Create automation rules
INSERT INTO public.automation_rules (id, organization_id, name, trigger_type, trigger_entity, from_status, to_status, action_type, message_template, is_active) VALUES
('h1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Boas Vindas Novo Lead', 'status_change', 'lead', null, 'Prospecção', 'send_whatsapp', 'Olá {nome}! Bem-vindo à nossa empresa. Como podemos ajudar?', true),
('h2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lead Qualificado', 'status_change', 'lead', 'Prospecção', 'Qualificação', 'send_whatsapp', 'Olá {nome}! Seu perfil foi qualificado. Um consultor entrará em contato.', true),
('h3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Proposta Enviada', 'status_change', 'lead', 'Qualificação', 'Proposta', 'send_whatsapp', 'Olá {nome}! Acabamos de enviar sua proposta. Aguardamos seu retorno!', true)
ON CONFLICT (id) DO NOTHING;

-- 9. Create marketing strategies
INSERT INTO public.marketing_strategies (id, organization_id, name, type, trigger_type, days_after, message_template, is_active) VALUES
('i1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Follow-up Pós-Venda', 'pos_venda', 'days_after_close', 7, 'Olá {nome}! Como está sendo sua experiência com nosso serviço?', true),
('i2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Reativação Cliente Inativo', 'reativacao', 'days_inactive', 30, 'Olá {nome}! Sentimos sua falta. Temos novidades para você!', true)
ON CONFLICT (id) DO NOTHING;

-- Done!
SELECT 'Seed data inserted successfully!' as status;
