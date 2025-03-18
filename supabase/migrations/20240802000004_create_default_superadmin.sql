-- Create a default superadmin user if it doesn't exist

-- First check if the user already exists
DO $$
DECLARE
  user_exists BOOLEAN;
  user_id UUID;
BEGIN
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'josebaez@albroksa.com') INTO user_exists;
  
  IF NOT user_exists THEN
    -- Insert directly into auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'josebaez@albroksa.com',
      crypt('Jbfjbf1982@#', gen_salt('bf')),
      now(),
      NULL,
      NULL,
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"José Báez"}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    ) RETURNING id INTO user_id;
    
    -- Insert into public.users
    INSERT INTO public.users (id, email, full_name, role, avatar_url, created_at)
    VALUES (
      user_id,
      'josebaez@albroksa.com',
      'José Báez',
      'superadmin',
      'https://api.dicebear.com/7.x/avataaars/svg?seed=josebaez@albroksa.com',
      now()
    );
  END IF;
END
$$;