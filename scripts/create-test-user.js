const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createTestUser() {
  const email = 'test_senior@crmia.eu';
  const password = 'Password123!';

  console.log(`Creating user: ${email}`);

  // Create user with service role (automatically confirms email)
  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true,
    user_metadata: {
      full_name: 'Senior Tester',
      company_name: 'Antigravity AI'
    }
  });

  if (error) {
    if (error.message.includes('already registered')) {
      console.log('User already exists. Resetting password...');
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === email).id,
        { password: password }
      );
      if (updateError) console.error('Error updating user:', updateError);
      else console.log('Password reset successfully.');
    } else {
      console.error('Error creating user:', error);
    }
  } else {
    console.log('User created and confirmed successfully:', data.user.id);
    
    // Ensure the profile exists (the trigger should handle this, but let's be sure)
    // Wait, the handle_new_user trigger in MASTER_CRM_SETUP.sql should have run.
  }
}

createTestUser();
