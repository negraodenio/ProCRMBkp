const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Erro: Variáveis de ambiente do Supabase não encontradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupFunarbeAdmin() {
  const email = 'admin@ia4all.com.br';
  const password = process.env.ADMIN_PASSWORD || 'Mudar@Senha#123'; // Use variável de ambiente para produção
  const fullName = 'Diretor de Inovação (IA4ALL)';

  console.log(`Configurando acesso admin: ${email}...`);

  // Tenta criar o usuário
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      role: 'admin'
    }
  });

  if (error) {
    if (error.message.includes('already registered') || error.status === 422) {
      console.log('Usuário já existe. Atualizando senha e perfil...');
      
      // Busca o ID do usuário pelo e-mail
      const { data: usersData } = await supabase.auth.admin.listUsers();
      const existingUser = usersData.users.find(u => u.email === email);
      
      if (existingUser) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          existingUser.id,
          { 
            password: password,
            user_metadata: { full_name: fullName, role: 'admin' }
          }
        );
        if (updateError) console.error('Erro ao atualizar:', updateError);
        else console.log('Acesso atualizado com sucesso!');
      }
    } else {
      console.error('Erro ao criar:', error);
    }
  } else {
    console.log('Admin criado e confirmado com sucesso!');
  }
}

setupFunarbeAdmin();
