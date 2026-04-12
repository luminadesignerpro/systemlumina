UPDATE auth.users 
SET email_confirmed_at = now(),
    updated_at = now()
WHERE email = 'jerffesson1991@hotmail.com' 
  AND email_confirmed_at IS NULL;