
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(__dirname, '../.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = envConfig.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase URL or Service Key.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  console.log('--- Setting up Storage ---');

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();

  if (listError) {
      console.error('Error listing buckets:', listError);
      return;
  }

  const avatarsBucket = buckets.find(b => b.name === 'avatars');

  if (avatarsBucket) {
      console.log('✅ Bucket "avatars" already exists.');
      // Check if public
      if (!avatarsBucket.public) {
          console.log('⚠️ Bucket is not public. Updating...');
          const { error: updateError } = await supabase.storage.updateBucket('avatars', {
              public: true
          });
          if (updateError) console.error('Error updating bucket:', updateError);
          else console.log('✅ Bucket updated to Public.');
      }
  } else {
      console.log('🛠️ Bucket "avatars" not found. Creating...');
      const { data, error: createError } = await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 1048576, // 1MB
          allowedMimeTypes: ['image/*']
      });

      if (createError) {
          console.error('❌ Error creating bucket:', createError);
      } else {
          console.log('✅ Bucket "avatars" created successfully.');
      }
  }
}

setupStorage();
